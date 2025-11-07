const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
let app;
try {
  app = admin.app();
} catch (error) {
  // App doesn't exist, initialize it
  app = admin.initializeApp({
    // Uses Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS
    projectId: "swiftbank-2811b",
  });
}

const db = admin.firestore();

// Account types data with comprehensive editable fields
const accountTypesData = [
  {
    id: "primary",
    category: "primary",
    name: "Primary Account",
    displayName: "Primary Checking Account",
    description:
      "Primary checking account with comprehensive banking features and unlimited access",
    accountNumberPrefix: "****",
    accountNumberSuffix: "7958",
    routingNumber: "Not provided",
    minimumBalance: 0,
    currentBalance: 15750.5,
    currency: "USD",
    interestRate: 0.01,
    monthlyFee: 0,
    overdraftLimit: 500,
    dailyWithdrawalLimit: 1000,
    features: [
      "Online Banking",
      "Mobile Banking",
      "Debit Card",
      "ATM Access",
      "Direct Deposit",
      "Bill Pay",
      "Mobile Check Deposit",
      "Wire Transfers",
    ],
    benefits: [
      "No monthly maintenance fee",
      "Free ATM withdrawals",
      "Mobile banking app",
      "Online bill pay",
      "24/7 customer support",
    ],
    eligibility: [
      "Must be 18 years or older",
      "Valid government-issued ID required",
      "Social Security Number required",
    ],
    status: "active",
    priority: 1,
    isDefault: true,
    canClose: false,
    requiresApproval: false,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: "savings",
    category: "savings",
    name: "Savings Account",
    displayName: "High-Yield Savings Account",
    description:
      "Earn competitive interest rates on your savings with easy access to your funds",
    accountNumberPrefix: "****",
    accountNumberSuffix: "1120",
    routingNumber: "Not provided",
    minimumBalance: 100,
    currentBalance: 5000,
    currency: "USD",
    interestRate: 2.5,
    monthlyFee: 0,
    overdraftLimit: 0,
    dailyWithdrawalLimit: 500,
    features: [
      "Online Banking",
      "Mobile Banking",
      "ATM Access",
      "Direct Deposit",
      "High Interest Rate",
      "Automatic Transfers",
    ],
    benefits: [
      "Competitive interest rates",
      "No minimum balance fees",
      "FDIC insured up to $250,000",
      "Easy online transfers",
      "Monthly statements",
    ],
    eligibility: [
      "Must be 18 years or older",
      "Valid government-issued ID required",
      "Minimum opening deposit of $25",
    ],
    status: "active",
    priority: 2,
    isDefault: false,
    canClose: true,
    requiresApproval: false,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: "current",
    category: "current",
    name: "Current Account",
    displayName: "Premium Current Account",
    description:
      "Premium banking experience with enhanced features and personalized service",
    accountNumberPrefix: "****",
    accountNumberSuffix: "5314",
    routingNumber: "Not provided",
    minimumBalance: 1000,
    currentBalance: 8250.75,
    currency: "USD",
    interestRate: 0.75,
    monthlyFee: 15,
    overdraftLimit: 1000,
    dailyWithdrawalLimit: 2500,
    features: [
      "Online Banking",
      "Mobile Banking",
      "Premium Debit Card",
      "ATM Access",
      "Direct Deposit",
      "Premium Customer Support",
      "Investment Advisory",
      "Concierge Services",
    ],
    benefits: [
      "Premium customer service",
      "Higher transaction limits",
      "Investment advisory services",
      "Exclusive banking offers",
      "Priority phone support",
      "Waived fees on select services",
    ],
    eligibility: [
      "Must be 21 years or older",
      "Valid government-issued ID required",
      "Minimum opening deposit of $1,000",
      "Credit check may be required",
    ],
    status: "active",
    priority: 3,
    isDefault: false,
    canClose: true,
    requiresApproval: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

async function seedAccountTypes() {
  try {
    console.log("🌱 Starting account types seeding process...");

    const accountTypesCollection = db.collection("accountTypes");

    // First, get all existing documents to clean up extras
    const existingDocs = await accountTypesCollection.get();
    const existingIds = new Set();

    console.log(
      `📋 Found ${existingDocs.size} existing account type documents`
    );

    existingDocs.forEach((doc) => {
      existingIds.add(doc.id);
    });

    // Seed the three required account types
    const validIds = new Set(["primary", "savings", "current"]);

    for (const accountType of accountTypesData) {
      console.log(
        `📝 Upserting account type: ${accountType.name} (${accountType.id})`
      );

      await accountTypesCollection
        .doc(accountType.id)
        .set(accountType, { merge: false });
      console.log(`✅ Successfully upserted: ${accountType.name}`);
    }

    // Delete any extra account types that shouldn't exist
    const idsToDelete = Array.from(existingIds).filter(
      (id) => !validIds.has(id)
    );

    if (idsToDelete.length > 0) {
      console.log(
        `🗑️  Deleting ${idsToDelete.length} extra account type(s): ${idsToDelete.join(", ")}`
      );

      const batch = db.batch();
      idsToDelete.forEach((id) => {
        batch.delete(accountTypesCollection.doc(id));
      });

      await batch.commit();
      console.log(`✅ Successfully deleted extra account types`);
    } else {
      console.log("✅ No extra account types found to delete");
    }

    console.log("🎉 Account types seeding completed successfully!");
    console.log("📊 Final state: 3 account types (Primary, Savings, Current)");
  } catch (error) {
    console.error("❌ Error seeding account types:", error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedAccountTypes()
    .then(() => {
      console.log("✨ Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding process failed:", error);
      process.exit(1);
    });
}

module.exports = { seedAccountTypes };
