#!/usr/bin/env node

/**
 * Transaction Balance Synchronization Script
 *
 * This script ensures that all transactions for each user's accounts
 * always sum up to the current account balance. When an admin modifies
 * account balances, this script will automatically generate or adjust
 * transactions to maintain consistency.
 *
 * Usage:
 * - node sync-transactions-with-balance.js (sync all accounts)
 * - node sync-transactions-with-balance.js --userId=USER_ID (sync specific user)
 * - node sync-transactions-with-balance.js --accountId=ACCOUNT_ID (sync specific account)
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(
  __dirname,
  "../firebase-service-account.json"
);

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
      projectId: "swift-bank-e4a5a",
    });
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error.message);
  console.log(
    "📝 Please ensure firebase-service-account.json exists in the project root"
  );
  process.exit(1);
}

const db = admin.firestore();

class TransactionSyncManager {
  constructor() {
    this.processedAccounts = 0;
    this.totalAccounts = 0;
    this.adjustmentsMade = 0;
  }

  /**
   * Get all accounts or filter by userId/accountId
   */
  async getAccountsToProcess(options = {}) {
    let accountsQuery = db.collection("users");

    if (options.userId) {
      accountsQuery = accountsQuery.where(
        admin.firestore.FieldPath.documentId(),
        "==",
        options.userId
      );
    }

    const usersSnapshot = await accountsQuery.get();
    const accounts = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Get user's accounts (assuming accounts are stored in user document or separate collection)
      let userAccounts = [];

      // First, try to get accounts from separate accounts collection
      const accountsSnapshot = await db
        .collection("accounts")
        .where("userId", "==", userId)
        .get();

      if (!accountsSnapshot.empty) {
        userAccounts = accountsSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId: userId,
          ...doc.data(),
        }));
      } else {
        // Fallback: check if accounts are in user document
        if (userData.accounts && Array.isArray(userData.accounts)) {
          userAccounts = userData.accounts.map((account, index) => ({
            id: `${userId}_account_${index}`,
            userId: userId,
            accountNumber:
              account.accountNumber || `****${String(index).padStart(4, "0")}`,
            accountType: account.accountType || "primary",
            balance: account.balance || 0,
            ...account,
          }));
        } else {
          // Create a default primary account if none exists
          userAccounts = [
            {
              id: `${userId}_primary`,
              userId: userId,
              accountNumber: userData.accountNumber || "****0001",
              accountType: "primary",
              balance: userData.balance || 0,
            },
          ];
        }
      }

      // Filter by specific account if requested
      if (options.accountId) {
        userAccounts = userAccounts.filter(
          (acc) => acc.id === options.accountId
        );
      }

      accounts.push(...userAccounts);
    }

    return accounts;
  }

  /**
   * Get all transactions for a specific account
   */
  async getAccountTransactions(accountId, userId) {
    // Try multiple query strategies to find transactions
    let transactions = [];

    try {
      // Strategy 1: Query by accountId field
      const accountIdQuery = await db
        .collection("transactions")
        .where("accountId", "==", accountId)
        .orderBy("timestamp", "desc")
        .get();

      transactions.push(
        ...accountIdQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Strategy 2: Query by userId field
      const userIdQuery = await db
        .collection("transactions")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .get();

      transactions.push(
        ...userIdQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Strategy 3: Query by fromAccount or toAccount
      const fromAccountQuery = await db
        .collection("transactions")
        .where("fromAccount", "==", accountId)
        .orderBy("timestamp", "desc")
        .get();

      const toAccountQuery = await db
        .collection("transactions")
        .where("toAccount", "==", accountId)
        .orderBy("timestamp", "desc")
        .get();

      transactions.push(
        ...fromAccountQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      transactions.push(
        ...toAccountQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.warn(
        `⚠️  Error querying transactions for account ${accountId}:`,
        error.message
      );
    }

    // Remove duplicates based on transaction ID
    const uniqueTransactions = transactions.filter(
      (transaction, index, self) =>
        index === self.findIndex((t) => t.id === transaction.id)
    );

    return uniqueTransactions;
  }

  /**
   * Calculate the sum of all transactions for an account
   */
  calculateTransactionTotal(transactions) {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      return total + amount;
    }, 0);
  }

  /**
   * Generate a realistic transaction history that sums to the target balance
   */
  generateTransactionHistory(targetBalance, existingTransactions = []) {
    const transactions = [...existingTransactions];
    const currentTotal = this.calculateTransactionTotal(transactions);
    const difference = targetBalance - currentTotal;

    // If the difference is 0, no adjustment needed
    if (Math.abs(difference) < 0.01) {
      return transactions;
    }

    // Generate realistic transactions to reach the target balance
    const adjustmentTransactions =
      this.generateRealisticTransactions(difference);

    return [...transactions, ...adjustmentTransactions];
  }

  /**
   * Generate realistic transactions that sum to the specified amount
   */
  generateRealisticTransactions(targetAmount) {
    const transactions = [];
    let remainingAmount = targetAmount;
    let currentBalance = 0;

    // Common transaction types and amounts
    const transactionTypes = [
      {
        type: "deposit",
        descriptions: [
          "Salary Payment",
          "Direct Deposit",
          "Investment Return",
          "Refund",
          "Freelance Payment",
        ],
      },
      {
        type: "withdrawal",
        descriptions: [
          "ATM Withdrawal",
          "Purchase",
          "Bill Payment",
          "Transfer Out",
          "Fee",
        ],
      },
      {
        type: "transfer",
        descriptions: [
          "Internal Transfer",
          "Account Transfer",
          "Online Transfer",
        ],
      },
    ];

    // Generate initial deposit if starting balance is positive
    if (targetAmount > 0) {
      const initialDeposit = Math.min(targetAmount * 0.6, 5000); // Up to 60% or $5000
      transactions.push({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "deposit",
        description: "Initial Account Opening Deposit",
        amount: parseFloat(initialDeposit.toFixed(2)),
        balanceAfter: parseFloat(initialDeposit.toFixed(2)),
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        status: "completed",
        accountId: null, // Will be set when saving
        userId: null, // Will be set when saving
      });

      currentBalance = initialDeposit;
      remainingAmount -= initialDeposit;
    }

    // Generate additional transactions to reach target
    let transactionCount = 0;
    const maxTransactions = 20;

    while (
      Math.abs(remainingAmount) > 0.01 &&
      transactionCount < maxTransactions
    ) {
      let transactionAmount;
      const isDeposit = remainingAmount > 0;

      if (isDeposit) {
        // Generate deposit
        transactionAmount = Math.min(
          remainingAmount,
          Math.random() * 2000 + 100 // Random amount between $100-$2100
        );
      } else {
        // Generate withdrawal
        transactionAmount = Math.max(
          remainingAmount,
          -(Math.random() * 500 + 50) // Random amount between $50-$550
        );
      }

      transactionAmount = parseFloat(transactionAmount.toFixed(2));
      currentBalance += transactionAmount;

      const typeInfo = transactionTypes[isDeposit ? 0 : 1];
      const description =
        typeInfo.descriptions[
          Math.floor(Math.random() * typeInfo.descriptions.length)
        ];

      transactions.push({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: typeInfo.type,
        description: description,
        amount: transactionAmount,
        balanceAfter: parseFloat(currentBalance.toFixed(2)),
        timestamp: new Date(
          Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000
        ), // Random date within last 25 days
        status: "completed",
        accountId: null, // Will be set when saving
        userId: null, // Will be set when saving
      });

      remainingAmount -= transactionAmount;
      transactionCount++;
    }

    // Final adjustment transaction if needed
    if (Math.abs(remainingAmount) > 0.01) {
      const adjustmentType = remainingAmount > 0 ? "deposit" : "withdrawal";
      const adjustmentDescription =
        remainingAmount > 0
          ? "Balance Adjustment - Credit"
          : "Balance Adjustment - Debit";

      currentBalance += remainingAmount;

      transactions.push({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: adjustmentType,
        description: adjustmentDescription,
        amount: parseFloat(remainingAmount.toFixed(2)),
        balanceAfter: parseFloat(currentBalance.toFixed(2)),
        timestamp: new Date(),
        status: "completed",
        accountId: null, // Will be set when saving
        userId: null, // Will be set when saving
      });
    }

    // Sort transactions by timestamp
    return transactions.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Save transactions to Firestore
   */
  async saveTransactions(transactions, accountId, userId) {
    const batch = db.batch();
    let savedCount = 0;

    for (const transaction of transactions) {
      // Skip if transaction already exists
      if (transaction.id && transaction.id.startsWith("txn_")) {
        const existingDoc = await db
          .collection("transactions")
          .doc(transaction.id)
          .get();
        if (existingDoc.exists) {
          continue;
        }
      }

      // Set account and user info
      transaction.accountId = accountId;
      transaction.userId = userId;

      const docRef = db.collection("transactions").doc();
      batch.set(docRef, {
        ...transaction,
        id: docRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      savedCount++;
    }

    if (savedCount > 0) {
      await batch.commit();
      console.log(
        `💾 Saved ${savedCount} new transactions for account ${accountId}`
      );
    }

    return savedCount;
  }

  /**
   * Sync transactions for a specific account
   */
  async syncAccount(account) {
    const {
      id: accountId,
      userId,
      balance,
      accountType,
      accountNumber,
    } = account;
    const targetBalance = parseFloat(balance) || 0;

    console.log(
      `\n🔄 Processing account: ${accountId} (${accountType || "primary"}) - Target Balance: $${targetBalance.toFixed(2)}`
    );

    try {
      // Get existing transactions
      const existingTransactions = await this.getAccountTransactions(
        accountId,
        userId
      );
      console.log(
        `📊 Found ${existingTransactions.length} existing transactions`
      );

      // Calculate current transaction total
      const currentTotal = this.calculateTransactionTotal(existingTransactions);
      console.log(`💰 Current transaction total: $${currentTotal.toFixed(2)}`);

      const difference = targetBalance - currentTotal;
      console.log(`🔀 Difference: $${difference.toFixed(2)}`);

      if (Math.abs(difference) < 0.01) {
        console.log(`✅ Account ${accountId} is already in sync`);
        return 0;
      }

      // Generate new transactions to bridge the gap
      let adjustmentTransactions = [];

      if (existingTransactions.length === 0) {
        // No existing transactions - generate realistic history
        adjustmentTransactions =
          this.generateRealisticTransactions(targetBalance);
        console.log(
          `🎭 Generated ${adjustmentTransactions.length} realistic transactions for new account`
        );
      } else {
        // Has existing transactions - create adjustment
        const adjustmentType = difference > 0 ? "deposit" : "withdrawal";
        const adjustmentDescription =
          difference > 0
            ? "Balance Adjustment - Administrative Credit"
            : "Balance Adjustment - Administrative Debit";

        adjustmentTransactions = [
          {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: adjustmentType,
            description: adjustmentDescription,
            amount: parseFloat(difference.toFixed(2)),
            balanceAfter: parseFloat(targetBalance.toFixed(2)),
            timestamp: new Date(),
            status: "completed",
            accountId: accountId,
            userId: userId,
          },
        ];
        console.log(
          `⚖️  Created adjustment transaction: $${difference.toFixed(2)}`
        );
      }

      // Save new transactions
      const savedCount = await this.saveTransactions(
        adjustmentTransactions,
        accountId,
        userId
      );

      if (savedCount > 0) {
        this.adjustmentsMade++;
        console.log(
          `✅ Synchronized account ${accountId} - ${savedCount} transactions added`
        );
      }

      return savedCount;
    } catch (error) {
      console.error(`❌ Error syncing account ${accountId}:`, error.message);
      return 0;
    }
  }

  /**
   * Main synchronization process
   */
  async run(options = {}) {
    console.log("🚀 Starting Transaction Balance Synchronization...\n");

    try {
      // Get accounts to process
      const accounts = await this.getAccountsToProcess(options);
      this.totalAccounts = accounts.length;

      if (accounts.length === 0) {
        console.log("❌ No accounts found to process");
        return;
      }

      console.log(`📋 Found ${accounts.length} accounts to process`);

      // Process each account
      for (const account of accounts) {
        await this.syncAccount(account);
        this.processedAccounts++;
      }

      // Summary
      console.log("\n" + "=".repeat(50));
      console.log("📊 SYNCHRONIZATION SUMMARY");
      console.log("=".repeat(50));
      console.log(`📈 Total accounts processed: ${this.processedAccounts}`);
      console.log(`⚡ Adjustments made: ${this.adjustmentsMade}`);
      console.log(`✅ Synchronization completed successfully!`);
      console.log("=".repeat(50));
    } catch (error) {
      console.error("❌ Synchronization failed:", error);
      process.exit(1);
    }
  }
}

// CLI argument parsing
const args = process.argv.slice(2);
const options = {};

args.forEach((arg) => {
  if (arg.startsWith("--userId=")) {
    options.userId = arg.split("=")[1];
  } else if (arg.startsWith("--accountId=")) {
    options.accountId = arg.split("=")[1];
  }
});

// Run the synchronization
const syncManager = new TransactionSyncManager();
syncManager
  .run(options)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
