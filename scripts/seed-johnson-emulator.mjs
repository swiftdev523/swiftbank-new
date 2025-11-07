import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";

// Firebase configuration (for emulator)
const firebaseConfig = {
  projectId: "swiftbank-2811b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore emulator (comment out for production)
try {
  connectFirestoreEmulator(db, "localhost", 8080);
  console.log("🔧 Connected to Firestore Emulator");
} catch (error) {
  console.log("⚠️  Using production Firestore (emulator connection failed)");
}

// Johnson Boseman's user ID
const JOHNSON_BOSEMAN_UID = "mYFGjRgsARS0AheCdYUkzhMRLkk2";

// Account data for Johnson Boseman - All fields are editable by admin
const johnsonAccounts = [
  {
    id: "johnson_primary",
    accountNumber: "10017958",
    accountType: "primary",
    accountName: "Primary Account",
    displayName: "Primary Checking Account",
    accountHolderName: "Johnson Boseman",
    firstName: "Johnson",
    lastName: "Boseman",
    email: "customer@swiftbank.com",
    userId: JOHNSON_BOSEMAN_UID,
    customerUID: JOHNSON_BOSEMAN_UID,

    // Financial Details (All Editable)
    balance: 15750.5,
    availableBalance: 15750.5,
    currency: "USD",
    interestRate: 0.01,
    monthlyFee: 0,
    minimumBalance: 0,
    overdraftLimit: 500,
    dailyWithdrawalLimit: 1000,
    dailyTransferLimit: 5000,

    // Account Details (All Editable)
    routingNumber: "Not provided",
    accountNumberPrefix: "****",
    accountNumberSuffix: "7958",
    branchCode: "MAIN001",
    sortCode: "SB-001",

    // Status and Settings (All Editable)
    status: "active",
    isActive: true,
    isPrimary: true,
    isDefault: true,
    canClose: false,
    requiresApproval: false,

    // Features and Benefits (All Editable)
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

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastTransaction: new Date(),

    // Additional editable fields
    nickname: "Primary",
    description: "Main checking account for daily transactions",
    alerts: {
      lowBalance: true,
      lowBalanceThreshold: 100,
      largeTransaction: true,
      largeTransactionThreshold: 1000,
    },
  },
  {
    id: "johnson_savings",
    accountNumber: "20011120",
    accountType: "savings",
    accountName: "Savings Account",
    displayName: "High-Yield Savings Account",
    accountHolderName: "Johnson Boseman",
    firstName: "Johnson",
    lastName: "Boseman",
    email: "customer@swiftbank.com",
    userId: JOHNSON_BOSEMAN_UID,
    customerUID: JOHNSON_BOSEMAN_UID,

    // Financial Details (All Editable)
    balance: 5000.0,
    availableBalance: 5000.0,
    currency: "USD",
    interestRate: 2.5,
    monthlyFee: 0,
    minimumBalance: 100,
    overdraftLimit: 0,
    dailyWithdrawalLimit: 500,
    dailyTransferLimit: 2000,

    // Account Details (All Editable)
    routingNumber: "Not provided",
    accountNumberPrefix: "****",
    accountNumberSuffix: "1120",
    branchCode: "MAIN001",
    sortCode: "SB-002",

    // Status and Settings (All Editable)
    status: "active",
    isActive: true,
    isPrimary: false,
    isDefault: false,
    canClose: true,
    requiresApproval: false,

    // Features and Benefits (All Editable)
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

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastTransaction: new Date(),

    // Additional editable fields
    nickname: "Savings",
    description: "High-yield savings account for long-term goals",
    alerts: {
      lowBalance: true,
      lowBalanceThreshold: 500,
      largeTransaction: true,
      largeTransactionThreshold: 2000,
    },
  },
  {
    id: "johnson_checking",
    accountNumber: "30015314",
    accountType: "checking",
    accountName: "Checking Account",
    displayName: "Premium Checking Account",
    accountHolderName: "Johnson Boseman",
    firstName: "Johnson",
    lastName: "Boseman",
    email: "customer@swiftbank.com",
    userId: JOHNSON_BOSEMAN_UID,
    customerUID: JOHNSON_BOSEMAN_UID,

    // Financial Details (All Editable)
    balance: 8250.75,
    availableBalance: 8250.75,
    currency: "USD",
    interestRate: 0.75,
    monthlyFee: 15,
    minimumBalance: 1000,
    overdraftLimit: 1000,
    dailyWithdrawalLimit: 2500,
    dailyTransferLimit: 10000,

    // Account Details (All Editable)
    routingNumber: "Not provided",
    accountNumberPrefix: "****",
    accountNumberSuffix: "5314",
    branchCode: "MAIN001",
    sortCode: "SB-003",

    // Status and Settings (All Editable)
    status: "active",
    isActive: true,
    isPrimary: false,
    isDefault: false,
    canClose: true,
    requiresApproval: true,

    // Features and Benefits (All Editable)
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

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastTransaction: new Date(),

    // Additional editable fields
    nickname: "Premium",
    description: "Premium checking account with enhanced services",
    alerts: {
      lowBalance: true,
      lowBalanceThreshold: 2000,
      largeTransaction: true,
      largeTransactionThreshold: 5000,
    },
  },
];

async function seedJohnsonAccounts() {
  try {
    console.log("🏦 Starting Johnson Boseman accounts seeding process...");

    const accountsRef = collection(db, "accounts");

    // First, get all existing accounts and clean them up
    console.log("🧹 Cleaning up existing accounts...");
    const existingAccountsSnapshot = await getDocs(accountsRef);

    if (!existingAccountsSnapshot.empty) {
      console.log(
        `📋 Found ${existingAccountsSnapshot.size} existing accounts to delete`
      );

      // Delete existing accounts one by one
      for (const docSnapshot of existingAccountsSnapshot.docs) {
        await deleteDoc(doc(db, "accounts", docSnapshot.id));
      }

      console.log("✅ Successfully deleted all existing accounts");
    } else {
      console.log("✅ No existing accounts found");
    }

    // Create the three accounts for Johnson Boseman using batch write
    console.log("📝 Creating Johnson Boseman's accounts...");
    const batch = writeBatch(db);

    for (const account of johnsonAccounts) {
      console.log(
        `💳 Preparing ${account.displayName} (${account.accountType})`
      );

      const accountRef = doc(db, "accounts", account.id);
      batch.set(accountRef, account);
    }

    // Commit the batch
    await batch.commit();
    console.log("✅ Successfully created all accounts in batch");

    console.log("🎉 Johnson Boseman accounts seeding completed successfully!");
    console.log(
      "📊 Final state: 3 accounts (Primary, Savings, Checking) for Johnson Boseman"
    );
    console.log("");
    console.log("Account Summary:");
    johnsonAccounts.forEach((account) => {
      console.log(
        `• ${account.displayName}: ${account.currency} ${account.balance.toLocaleString()}`
      );
    });

    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Run: npm run verify:johnson (to verify accounts)");
    console.log("2. Use admin dashboard to edit accounts");
    console.log("3. Run: npm run manage:johnson (for CLI management)");
  } catch (error) {
    console.error("❌ Error seeding Johnson Boseman accounts:", error);
    throw error;
  }
}

// Run the seeding function
seedJohnsonAccounts()
  .then(() => {
    console.log("✨ Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding process failed:", error);
    process.exit(1);
  });
