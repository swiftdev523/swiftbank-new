#!/usr/bin/env node

/**
 * Create bank accounts for customer
 */

const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

// Initialize Firebase Admin
const serviceAccountPath = path.join(
  __dirname,
  "..",
  "service-account-key.json"
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "swiftbank-2811b",
});

const db = admin.firestore();

const CUSTOMER_EMAIL = "kindestwavelover@gmail.com";
const CUSTOMER_UID = "BMPayIo945gjgTJpNUk3jLS9VBy1";

function generateAccountNumber() {
  return "1" + Math.random().toString().slice(2, 14);
}

async function createAccounts() {
  console.log("🏦 Creating Bank Accounts for Customer");
  console.log("=".repeat(70));
  console.log(`Customer: ${CUSTOMER_EMAIL}`);
  console.log(`UID: ${CUSTOMER_UID}\n`);

  const accounts = [
    {
      accountType: "primary",
      accountName: "Primary Checking",
      displayName: "Primary Checking Account",
      balance: 15750.5,
      interestRate: 0.01,
      minimumBalance: 0,
      monthlyFee: 0,
    },
    {
      accountType: "savings",
      accountName: "High-Yield Savings",
      displayName: "Premium Savings Account",
      balance: 25000.0,
      interestRate: 0.042,
      minimumBalance: 100,
      monthlyFee: 0,
    },
    {
      accountType: "checking",
      accountName: "Everyday Checking",
      displayName: "Everyday Checking Account",
      balance: 3250.75,
      interestRate: 0.005,
      minimumBalance: 0,
      monthlyFee: 0,
    },
  ];

  const created = [];

  for (const accountData of accounts) {
    try {
      const accountNumber = generateAccountNumber();

      const fullAccountData = {
        ...accountData,
        accountNumber: accountNumber,
        accountNumberPrefix: "****",
        accountNumberSuffix: accountNumber.slice(-4),
        accountHolderName: "William Miller",
        userId: CUSTOMER_UID,
        customerUID: CUSTOMER_UID,
        userEmail: CUSTOMER_EMAIL,
        currency: "USD",
        status: "active",
        isActive: true,
        isPrimary: accountData.accountType === "primary",
        isDefault: accountData.accountType === "primary",
        routingNumber: "123456789",
        branchCode: "MAIN001",
        swiftCode: "SWIFTUS33XXX",
        features: [
          "Online Banking",
          "Mobile Banking",
          accountData.accountType === "primary"
            ? "Premium Debit Card"
            : "Debit Card",
          "ATM Access",
          "Direct Deposit",
        ],
        benefits: [
          "No monthly fees",
          "Free online transfers",
          "24/7 account access",
          "Mobile banking",
        ],
        availableBalance: accountData.balance,
        openedDate: admin.firestore.Timestamp.now(),
        lastTransactionDate: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("accounts").add(fullAccountData);
      created.push({ id: docRef.id, ...fullAccountData });

      console.log(`✅ Created: ${accountData.displayName}`);
      console.log(`   Account Number: ****${accountNumber.slice(-4)}`);
      console.log(`   Balance: $${accountData.balance.toLocaleString()}`);
      console.log(`   Type: ${accountData.accountType}`);
      console.log("");
    } catch (error) {
      console.error(
        `❌ Error creating ${accountData.displayName}:`,
        error.message
      );
    }
  }

  console.log("=".repeat(70));
  console.log(`✅ Successfully created ${created.length} account(s)!`);
  console.log("");
  console.log("📊 Account Summary:");
  console.log(
    `   Total Balance: $${created.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}`
  );
  console.log("");

  return created;
}

createAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
