#!/usr/bin/env node

/**
 * Generate Transaction History for Existing Accounts
 * This script generates realistic transaction history for accounts that don't have matching transactions
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: "swiftbank-2811b",
});

const db = admin.firestore();

// Transaction templates (same as in the utility file)
const TRANSACTION_TEMPLATES = {
  salary: {
    descriptions: [
      "Salary - Engineering Dept",
      "Paycheck - Finance Division",
      "Direct Deposit - Employer",
      "Monthly Salary - Tech Corp",
      "Bi-weekly Pay - Corporate Ltd",
    ],
    amountRange: [3500, 8500],
    type: "deposit",
    frequency: "monthly",
  },

  freelance: {
    descriptions: [
      "Freelance Payment - Web Design",
      "Consulting Fee - Strategy",
      "Project Payment - Development",
      "Contract Payment - Consulting",
      "Service Payment - Creative",
    ],
    amountRange: [800, 3200],
    type: "deposit",
    frequency: "irregular",
  },

  groceries: {
    descriptions: [
      "Whole Foods Market",
      "Target Grocery",
      "Kroger Supermarket",
      "Trader Joe's",
      "Fresh Market Co",
    ],
    amountRange: [45, 160],
    type: "purchase",
    frequency: "weekly",
  },

  dining: {
    descriptions: [
      "Restaurant - Italian Bistro",
      "Starbucks Coffee",
      "McDonald's",
      "Olive Garden",
      "Local Diner",
    ],
    amountRange: [12, 85],
    type: "purchase",
    frequency: "weekly",
  },

  utilities: {
    descriptions: [
      "Electric Company - Monthly Bill",
      "Gas & Electric - Utility",
      "Water Department - Monthly",
      "Internet Service - Broadband",
      "Phone Service - Mobile",
    ],
    amountRange: [75, 220],
    type: "bill_payment",
    frequency: "monthly",
  },

  entertainment: {
    descriptions: [
      "Netflix Subscription",
      "Movie Theater - AMC",
      "Spotify Premium",
      "Amazon Prime Video",
      "Gaming Store Purchase",
    ],
    amountRange: [9, 45],
    type: "purchase",
    frequency: "monthly",
  },

  transport: {
    descriptions: [
      "Gas Station - Shell",
      "Uber Ride",
      "Metro Card Refill",
      "Parking Fee - Downtown",
      "Taxi Service",
    ],
    amountRange: [8, 65],
    type: "purchase",
    frequency: "weekly",
  },

  shopping: {
    descriptions: [
      "Amazon Purchase",
      "Department Store",
      "Online Shopping - eBay",
      "Clothing Store",
      "Electronics Store",
    ],
    amountRange: [25, 350],
    type: "purchase",
    frequency: "irregular",
  },
};

function generateTransactionsForAccount(account) {
  const transactions = [];
  const accountId = account.id;
  const customerId = account.customerUID || account.userId;
  const targetBalance = Number(account.balance) || 0;

  if (targetBalance <= 0) {
    console.log(`⏭️  Skipping account ${accountId} with zero/negative balance`);
    return [];
  }

  let currentBalance = 0;

  // Generate transactions from 2020 to April 2025 (5+ years of history)
  const endDate = new Date(2025, 3, 30); // April 30, 2025
  const startDate = new Date(2020, 0, 1); // January 1, 2020

  // Calculate transaction count based on time span and balance
  const avgTransactionValue = 150;
  const yearsOfHistory = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
  const avgTransactionsPerMonth = 12; // Realistic monthly transaction count
  const estimatedTransactionCount = Math.max(
    Math.floor(yearsOfHistory * 12 * avgTransactionsPerMonth), // Base on time span
    Math.min(300, Math.abs(targetBalance) / avgTransactionValue) // Cap at 300 transactions
  );

  // Income transactions (30%)
  const incomeCategories = ["salary", "freelance"];
  const expenseCategories = [
    "groceries",
    "dining",
    "utilities",
    "entertainment",
    "transport",
    "shopping",
  ];

  const incomeCount = Math.floor(estimatedTransactionCount * 0.3);
  let totalIncome = 0;

  // Generate income transactions
  for (let i = 0; i < incomeCount; i++) {
    const category =
      incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
    const template = TRANSACTION_TEMPLATES[category];
    const amount = Math.floor(
      Math.random() * (template.amountRange[1] - template.amountRange[0]) +
        template.amountRange[0]
    );

    totalIncome += amount;
    currentBalance += amount;

    const transactionDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );

    transactions.push({
      accountId: accountId,
      userId: customerId,
      type: template.type,
      category: category,
      amount: amount,
      description:
        template.descriptions[
          Math.floor(Math.random() * template.descriptions.length)
        ],
      timestamp: admin.firestore.Timestamp.fromDate(transactionDate),
      status: "completed",
      balance: currentBalance,
      currency: account.currency || "USD",
      fromAccount: null,
      toAccount: accountId,
      createdAt: admin.firestore.Timestamp.fromDate(transactionDate),
      updatedAt: admin.firestore.Timestamp.fromDate(transactionDate),
    });
  }

  // Generate expense transactions (70%)
  const expenseCount = estimatedTransactionCount - incomeCount;

  for (let i = 0; i < expenseCount; i++) {
    const category =
      expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const template = TRANSACTION_TEMPLATES[category];
    const amount = Math.floor(
      Math.random() * (template.amountRange[1] - template.amountRange[0]) +
        template.amountRange[0]
    );

    // Don't let balance go too negative
    if (currentBalance - amount < -1000) {
      continue;
    }

    currentBalance -= amount;

    const transactionDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );

    transactions.push({
      accountId: accountId,
      userId: customerId,
      type: template.type,
      category: category,
      amount: -amount, // Negative for expenses
      description:
        template.descriptions[
          Math.floor(Math.random() * template.descriptions.length)
        ],
      timestamp: admin.firestore.Timestamp.fromDate(transactionDate),
      status: "completed",
      balance: currentBalance,
      currency: account.currency || "USD",
      fromAccount: accountId,
      toAccount: null,
      createdAt: admin.firestore.Timestamp.fromDate(transactionDate),
      updatedAt: admin.firestore.Timestamp.fromDate(transactionDate),
    });
  }

  // Add final adjustment to reach exact balance
  if (Math.abs(currentBalance - targetBalance) > 1) {
    const adjustmentAmount = targetBalance - currentBalance;
    const adjustmentType = adjustmentAmount > 0 ? "deposit" : "withdrawal";
    const adjustmentDescription =
      adjustmentAmount > 0 ? "Account Opening Deposit" : "Account Adjustment";

    transactions.push({
      accountId: accountId,
      userId: customerId,
      type: adjustmentType,
      category: "adjustment",
      amount: adjustmentAmount,
      description: adjustmentDescription,
      timestamp: admin.firestore.Timestamp.now(),
      status: "completed",
      balance: targetBalance,
      currency: account.currency || "USD",
      fromAccount: adjustmentAmount < 0 ? accountId : null,
      toAccount: adjustmentAmount > 0 ? accountId : null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  // Sort by timestamp
  transactions.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

  // Recalculate running balances
  let runningBalance = 0;
  transactions.forEach((transaction) => {
    runningBalance += transaction.amount;
    transaction.balance = runningBalance;
  });

  return transactions;
}

async function generateTransactionHistory() {
  try {
    console.log("🏦 Generating Transaction History for Existing Accounts");
    console.log("======================================================");

    // Get all accounts
    const accountsSnapshot = await db.collection("accounts").get();
    console.log(`📊 Found ${accountsSnapshot.size} accounts`);

    let processedAccounts = 0;
    let skippedAccounts = 0;
    let totalTransactions = 0;

    for (const accountDoc of accountsSnapshot.docs) {
      const account = { id: accountDoc.id, ...accountDoc.data() };

      console.log(
        `\n📝 Processing account: ${account.accountName || account.accountType} (${account.id})`
      );
      console.log(`   Customer: ${account.customerUID}`);
      console.log(`   Balance: $${account.balance}`);

      // Check if account already has transactions
      const existingTransactions = await db
        .collection("transactions")
        .where("accountId", "==", account.id)
        .limit(1)
        .get();

      if (!existingTransactions.empty) {
        console.log(`   ⏭️  Skipping - already has transactions`);
        skippedAccounts++;
        continue;
      }

      // Generate transactions for this account
      const transactions = generateTransactionsForAccount(account);

      if (transactions.length === 0) {
        console.log(`   ⏭️  Skipping - zero balance account`);
        skippedAccounts++;
        continue;
      }

      // Save transactions to Firestore
      const batch = db.batch();
      transactions.forEach((transaction) => {
        const transactionRef = db.collection("transactions").doc();
        batch.set(transactionRef, transaction);
      });

      await batch.commit();

      console.log(`   ✅ Generated ${transactions.length} transactions`);
      processedAccounts++;
      totalTransactions += transactions.length;
    }

    console.log("\n🎉 TRANSACTION GENERATION COMPLETED!");
    console.log("====================================");
    console.log(`✅ Processed accounts: ${processedAccounts}`);
    console.log(`⏭️  Skipped accounts: ${skippedAccounts}`);
    console.log(`📊 Total transactions generated: ${totalTransactions}`);
    console.log(
      `📈 Average transactions per account: ${Math.round(totalTransactions / processedAccounts) || 0}`
    );

    console.log("\n💡 Next Steps:");
    console.log(
      "• Check the Firebase Console → Firestore → transactions collection"
    );
    console.log("• View customer accounts in the admin dashboard");
    console.log("• Transaction history should now match account balances");
  } catch (error) {
    console.error("\n❌ Error generating transaction history:", error);
    console.error("Details:", error.message);
  } finally {
    await admin.app().delete();
  }
}

// Run the script
generateTransactionHistory();
