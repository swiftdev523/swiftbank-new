// Firebase CLI script to add missing account
// Run with: node addAccount.js

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = {
  // You'll need to replace these with your actual Firebase service account credentials
  // Download from Firebase Console > Project Settings > Service Accounts
  type: "service_account",
  project_id: "cl-bank-c82fc",
  // Add your other service account fields here
};

// Initialize the app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cl-bank-c82fc-default-rtdb.firebaseapp.com",
});

const db = admin.firestore();

// Generate account number
const generateAccountNumber = () => {
  return (
    "4" +
    Math.floor(Math.random() * 1000000000000000)
      .toString()
      .padStart(15, "0")
  );
};

async function addMissingAccount() {
  try {
    const customerUID = "mYFGjRgsARS0AheCdYUkzhMRLkk2";

    // Create the missing primary checking account
    const primaryAccount = {
      userId: customerUID,
      type: "checking",
      accountNumber: generateAccountNumber(),
      accountName: "Primary Checking",
      balance: 8750.3,
      currency: "USD",
      status: "active",
      active: true,
      createdAt: new Date().toISOString(),
      lastTransaction: new Date().toISOString(),
      interestRate: 0.01,
      minimumBalance: 0,
      features: [
        "debit_card",
        "online_banking",
        "mobile_banking",
        "atm_access",
      ],
      isPrimary: true,
    };

    // Add to Firestore
    const docRef = await db.collection("accounts").add(primaryAccount);
    console.log("✅ Primary account created with ID:", docRef.id);
    console.log("Account details:", primaryAccount);

    // Also create a high-yield savings account
    const savingsAccount = {
      userId: customerUID,
      type: "savings",
      accountNumber: generateAccountNumber(),
      accountName: "High Yield Savings",
      balance: 25430.75,
      currency: "USD",
      status: "active",
      active: true,
      createdAt: new Date().toISOString(),
      lastTransaction: new Date().toISOString(),
      interestRate: 2.5,
      minimumBalance: 100,
      features: ["online_banking", "mobile_banking", "automatic_savings"],
    };

    const savingsDocRef = await db.collection("accounts").add(savingsAccount);
    console.log("✅ Savings account created with ID:", savingsDocRef.id);
    console.log("Savings account details:", savingsAccount);

    // Create a credit card account
    const creditAccount = {
      userId: customerUID,
      type: "credit",
      accountNumber: generateAccountNumber(),
      accountName: "Rewards Credit Card",
      balance: -1250.0, // Negative balance indicates debt
      currency: "USD",
      status: "active",
      active: true,
      createdAt: new Date().toISOString(),
      lastTransaction: new Date().toISOString(),
      creditLimit: 15000,
      availableCredit: 13750,
      interestRate: 18.99,
      minimumPayment: 35,
      features: ["cashback_rewards", "fraud_protection", "travel_insurance"],
    };

    const creditDocRef = await db.collection("accounts").add(creditAccount);
    console.log("✅ Credit account created with ID:", creditDocRef.id);
    console.log("Credit account details:", creditAccount);

    console.log("\n🎉 All accounts created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating accounts:", error);
    process.exit(1);
  }
}

// Run the function
addMissingAccount();
