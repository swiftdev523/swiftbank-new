#!/usr/bin/env node

/**
 * Realistic Transaction Generator for Firebase Firestore
 * Generates realistic banking transactions for all users that sum up to their account balances
 */

import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "swiftbank-2811b",
  });
}

const db = admin.firestore();

// Transaction categories with realistic descriptions and patterns
const TRANSACTION_CATEGORIES = {
  salary: {
    descriptions: [
      "Salary Deposit - Tech Corp",
      "Payroll Deposit - ABC Company",
      "Monthly Salary - XYZ Inc",
      "Bi-weekly Pay - Corporate Ltd",
      "Direct Deposit - Employer",
      "Salary - Engineering Dept",
      "Paycheck - Finance Division",
      "Income - Monthly Salary",
    ],
    amountRange: [3500, 12000],
    frequency: 0.08,
    type: "deposit",
    isIncome: true,
    timing: "monthly", // More structured timing
  },

  freelance: {
    descriptions: [
      "Freelance Payment - Web Design",
      "Contract Payment - Consulting",
      "Project Payment - Development",
      "Freelance Income - Design",
      "Consulting Fee - Strategy",
      "Service Payment - Creative",
      "Project Completion - Tech",
      "Freelance Work - Marketing",
    ],
    amountRange: [500, 4500],
    frequency: 0.03,
    type: "deposit",
    isIncome: true,
    timing: "irregular",
  },

  investment: {
    descriptions: [
      "Dividend Payment - Portfolio",
      "Interest Earned - Savings",
      "Investment Return - Stocks",
      "Bond Interest - Government",
      "Mutual Fund Dividend",
      "Stock Dividend - Apple Inc",
      "REITs Distribution",
      "Capital Gains - Trading",
    ],
    amountRange: [25, 850],
    frequency: 0.02,
    type: "deposit",
    isIncome: true,
    timing: "quarterly",
  },

  groceries: {
    descriptions: [
      "Whole Foods Market",
      "Kroger Supermarket",
      "Target Grocery",
      "Safeway Store",
      "Trader Joe's",
      "Costco Wholesale",
      "Local Market",
      "Fresh Market Co",
      "Organic Foods Store",
      "Corner Grocery",
    ],
    amountRange: [35, 185],
    frequency: 0.15,
    type: "purchase",
    isIncome: false,
    timing: "weekly",
  },

  dining: {
    descriptions: [
      "Restaurant - Italian Bistro",
      "McDonald's #1234",
      "Starbucks Coffee",
      "Olive Garden",
      "Chipotle Mexican Grill",
      "DoorDash Delivery",
      "Subway Sandwiches",
      "Local Cafe Downtown",
      "Pizza Hut",
      "Thai Kitchen Restaurant",
    ],
    amountRange: [8, 125],
    frequency: 0.12,
    type: "purchase",
    isIncome: false,
    timing: "frequent",
  },

  utilities: {
    descriptions: [
      "Electric Company - Monthly",
      "Natural Gas Bill",
      "Water & Sewer Dept",
      "Internet Service - Fiber",
      "Cellular Service Plan",
      "Cable TV Service",
      "Netflix Subscription",
      "Spotify Premium",
      "Home Insurance Premium",
      "Waste Management Fee",
    ],
    amountRange: [25, 280],
    frequency: 0.08,
    type: "bill_payment",
    isIncome: false,
    timing: "monthly",
  },

  transportation: {
    descriptions: [
      "Shell Gas Station",
      "Chevron Fuel",
      "Uber Trip - Downtown",
      "Lyft Ride",
      "Metro Transit Pass",
      "Parking Meter Fee",
      "Car Insurance Premium",
      "Auto Repair Shop",
      "Oil Change Service",
      "Car Wash Express",
    ],
    amountRange: [5, 95],
    frequency: 0.12,
    type: "purchase",
    isIncome: false,
    timing: "weekly",
  },

  shopping: {
    descriptions: [
      "Amazon Online Purchase",
      "Target Store",
      "Best Buy Electronics",
      "Macy's Department Store",
      "Home Depot",
      "CVS Pharmacy",
      "Walmart Supercenter",
      "Barnes & Noble",
      "Apple Store",
      "Local Shopping Mall",
    ],
    amountRange: [15, 650],
    frequency: 0.1,
    type: "purchase",
    isIncome: false,
    timing: "irregular",
  },

  healthcare: {
    descriptions: [
      "Dr. Smith - Primary Care",
      "Dental Care Clinic",
      "CVS Pharmacy Rx",
      "Optometry Center",
      "Physical Therapy",
      "Lab Work - Blood Test",
      "Urgent Care Visit",
      "Health Insurance Co",
      "Medical Specialist",
      "Prescription Refill",
    ],
    amountRange: [15, 450],
    frequency: 0.06,
    type: "bill_payment",
    isIncome: false,
    timing: "irregular",
  },

  entertainment: {
    descriptions: [
      "Movie Theater - AMC",
      "Concert Ticket",
      "Gaming Store Purchase",
      "Streaming Service",
      "Sports Event Ticket",
      "Book Purchase",
      "Hobby Store",
      "Gym Membership",
      "Recreation Center",
      "Entertainment Venue",
    ],
    amountRange: [10, 200],
    frequency: 0.05,
    type: "purchase",
    isIncome: false,
    timing: "irregular",
  },

  cash_withdrawal: {
    descriptions: [
      "ATM Withdrawal - Bank",
      "Cash Advance - ATM",
      "ATM Fee - Outside Network",
      "Cash Withdrawal",
      "ATM Transaction",
    ],
    amountRange: [20, 200],
    frequency: 0.08,
    type: "withdrawal",
    isIncome: false,
    timing: "frequent",
  },

  transfer: {
    descriptions: [
      "Transfer to Savings",
      "Transfer from Checking",
      "Internal Account Transfer",
      "Savings Transfer",
      "Emergency Fund Transfer",
    ],
    amountRange: [100, 2000],
    frequency: 0.04,
    type: "transfer",
    isIncome: false, // Will be handled specially
    timing: "monthly",
  },

  fees: {
    descriptions: [
      "Monthly Maintenance Fee",
      "Overdraft Fee",
      "ATM Fee - Out of Network",
      "Wire Transfer Fee",
      "Foreign Transaction Fee",
      "Account Service Fee",
      "Stop Payment Fee",
    ],
    amountRange: [2.5, 35],
    frequency: 0.02,
    type: "fee",
    isIncome: false,
    timing: "irregular",
  },
};

// Utility functions
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomAmount(min, max, precision = 2) {
  const amount = Math.random() * (max - min) + min;
  return Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision);
}

function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTransactionId() {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Select category based on weighted frequency
function selectCategory() {
  const rand = Math.random();
  let cumulative = 0;

  for (const [categoryName, config] of Object.entries(TRANSACTION_CATEGORIES)) {
    cumulative += config.frequency;
    if (rand <= cumulative) {
      return { name: categoryName, ...config };
    }
  }

  // Fallback
  return { name: "shopping", ...TRANSACTION_CATEGORIES.shopping };
}

// Generate transaction for specific category and amount
function generateSpecificTransaction(
  categoryName,
  amount,
  date,
  userId,
  accountId
) {
  const category = TRANSACTION_CATEGORIES[categoryName];
  if (!category) {
    throw new Error(`Unknown category: ${categoryName}`);
  }

  const description = randomSelect(category.descriptions);
  const transactionAmount = category.isIncome
    ? Math.abs(amount)
    : -Math.abs(amount);

  return {
    id: generateTransactionId(),
    userId: userId,
    accountId: accountId,
    amount: transactionAmount,
    description: description,
    type: category.type,
    status: "completed",
    timestamp: date,
    category: categoryName,
    balanceAfter: 0, // Will be calculated later
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Generate random transaction
function generateRandomTransaction(date, userId, accountId) {
  const category = selectCategory();
  const amount = randomAmount(category.amountRange[0], category.amountRange[1]);

  return generateSpecificTransaction(
    category.name,
    amount,
    date,
    userId,
    accountId
  );
}

// Fetch all users and their accounts from Firestore
async function fetchUsersAndAccounts() {
  console.log("📋 Fetching users and accounts...");

  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = { id: userDoc.id, ...userDoc.data() };

      // Skip admin users
      if (userData.role === "admin") {
        console.log(
          `⏭️  Skipping admin user: ${userData.email || userData.name}`
        );
        continue;
      }

      // Get accounts for this user
      let accounts = [];

      // First try embedded accounts in user document
      if (userData.accounts && Array.isArray(userData.accounts)) {
        accounts = userData.accounts.map((acc) => ({
          id: acc.id || acc.accountId || acc.accountNumber,
          accountType: acc.accountType || acc.type || "checking",
          balance: Number(acc.balance || 0),
          accountNumber: acc.accountNumber || acc.number,
          status: acc.status || "active",
        }));
      }

      // If no embedded accounts, try accounts collection
      if (accounts.length === 0) {
        try {
          const accountsSnapshot = await db
            .collection("accounts")
            .where("userId", "==", userDoc.id)
            .get();

          accounts = accountsSnapshot.docs.map((accountDoc) => ({
            id: accountDoc.id,
            ...accountDoc.data(),
            balance: Number(accountDoc.data().balance || 0),
          }));
        } catch (error) {
          console.warn(
            `⚠️  Could not fetch accounts for user ${userDoc.id}:`,
            error.message
          );
        }
      }

      if (accounts.length > 0) {
        users.push({
          ...userData,
          accounts: accounts.filter((acc) => acc.status === "active"),
        });

        console.log(
          `✅ User: ${userData.firstName} ${userData.lastName || ""} - ${accounts.length} accounts`
        );
        accounts.forEach((acc) => {
          console.log(
            `   💰 ${acc.accountType}: $${acc.balance.toLocaleString()}`
          );
        });
      } else {
        console.log(
          `⚠️  No accounts found for user: ${userData.firstName} ${userData.lastName || ""}`
        );
      }
    }

    return users;
  } catch (error) {
    console.error("❌ Error fetching users and accounts:", error);
    throw error;
  }
}

// Clear all existing transactions
async function clearAllTransactions() {
  console.log("🧹 Clearing all existing transactions...");

  try {
    const transactionsSnapshot = await db.collection("transactions").get();

    if (transactionsSnapshot.docs.length === 0) {
      console.log("ℹ️  No existing transactions to clear");
      return;
    }

    const batchSize = 500;
    const batches = [];
    let currentBatch = db.batch();
    let batchCount = 0;

    for (const docSnap of transactionsSnapshot.docs) {
      currentBatch.delete(docSnap.ref);
      batchCount++;

      if (batchCount === batchSize) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      batches.push(currentBatch);
    }

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Deleted batch ${i + 1}/${batches.length}`);
    }

    console.log(
      `✅ Cleared ${transactionsSnapshot.docs.length} existing transactions`
    );
  } catch (error) {
    console.error("❌ Error clearing transactions:", error);
    throw error;
  }
}

// Generate transactions for a single account
function generateTransactionsForAccount(userId, account, startDate, endDate) {
  const transactions = [];
  const targetBalance = account.balance;
  const accountId = account.id;

  console.log(
    `  📊 Generating transactions for ${account.accountType} (Target: $${targetBalance.toLocaleString()})`
  );

  // Calculate number of transactions based on account balance and type
  const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  let baseTransactionCount;

  if (targetBalance > 100000) {
    baseTransactionCount = Math.floor(daysInPeriod * 0.4); // More transactions for higher balances
  } else if (targetBalance > 10000) {
    baseTransactionCount = Math.floor(daysInPeriod * 0.25);
  } else {
    baseTransactionCount = Math.floor(daysInPeriod * 0.15);
  }

  // Minimum transactions to make it realistic
  const transactionCount = Math.max(baseTransactionCount, 50);

  // Generate income transactions (20-30% of total)
  const incomeCount = Math.floor(transactionCount * 0.25);
  const expenseCount = transactionCount - incomeCount;

  // Generate income transactions
  let totalIncome = 0;
  for (let i = 0; i < incomeCount; i++) {
    const date = randomDate(startDate, endDate);
    let category = "salary";

    // Vary income types
    const rand = Math.random();
    if (rand < 0.7) category = "salary";
    else if (rand < 0.9) category = "freelance";
    else category = "investment";

    const categoryConfig = TRANSACTION_CATEGORIES[category];
    const amount = randomAmount(
      categoryConfig.amountRange[0],
      categoryConfig.amountRange[1]
    );

    const transaction = generateSpecificTransaction(
      category,
      amount,
      date,
      userId,
      accountId
    );
    transactions.push(transaction);
    totalIncome += amount;
  }

  // Calculate how much we need to spend to reach target balance
  const availableToSpend = totalIncome - targetBalance;

  // Generate expense transactions
  let totalExpenses = 0;
  for (let i = 0; i < expenseCount; i++) {
    const date = randomDate(startDate, endDate);
    const category = selectCategory();

    if (category.isIncome) continue; // Skip income categories

    // Calculate remaining budget
    const remainingBudget = availableToSpend - totalExpenses;
    const remainingTransactions = expenseCount - i;

    // Adjust amount based on remaining budget
    let maxAmount = Math.min(
      category.amountRange[1],
      (remainingBudget * 0.8) / Math.max(remainingTransactions, 1)
    );

    maxAmount = Math.max(maxAmount, category.amountRange[0]);

    const amount = randomAmount(category.amountRange[0], maxAmount);

    const transaction = generateSpecificTransaction(
      category.name,
      amount,
      date,
      userId,
      accountId
    );
    transactions.push(transaction);
    totalExpenses += amount;
  }

  // Add final adjustment transaction if needed
  const calculatedBalance = totalIncome - totalExpenses;
  const balanceDifference = targetBalance - calculatedBalance;

  if (Math.abs(balanceDifference) > 1) {
    const adjustmentDate = randomDate(
      startDate,
      new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    );

    if (balanceDifference > 0) {
      // Need more money - add income
      const transaction = generateSpecificTransaction(
        "salary",
        balanceDifference,
        adjustmentDate,
        userId,
        accountId
      );
      transactions.push(transaction);
    } else {
      // Need less money - add expense
      const transaction = generateSpecificTransaction(
        "shopping",
        Math.abs(balanceDifference),
        adjustmentDate,
        userId,
        accountId
      );
      transactions.push(transaction);
    }
  }

  return transactions;
}

// Calculate running balances for transactions
function calculateRunningBalances(transactions, finalBalance) {
  // Sort by timestamp ascending (oldest first)
  transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let runningBalance = 0; // Start from 0 and build up

  // Calculate running balance
  for (const transaction of transactions) {
    runningBalance += transaction.amount;
    transaction.balanceAfter = Math.round(runningBalance * 100) / 100;
  }

  // Adjust all balances to end at the target final balance
  const finalCalculatedBalance = runningBalance;
  const adjustment = finalBalance - finalCalculatedBalance;

  for (const transaction of transactions) {
    transaction.balanceAfter += adjustment;
    transaction.balanceAfter = Math.round(transaction.balanceAfter * 100) / 100;
  }

  return transactions;
}

// Save transactions to Firestore
async function saveTransactions(transactions) {
  console.log(`💾 Saving ${transactions.length} transactions to Firestore...`);

  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = db.batch();
    const batchTransactions = transactions.slice(i, i + batchSize);

    batchTransactions.forEach((transaction) => {
      const docRef = db.collection("transactions").doc();
      // Remove the 'id' field since Firestore will generate the document ID
      const { id, ...transactionData } = transaction;
      batch.set(docRef, transactionData);
    });

    batches.push(batch);
  }

  // Execute all batches
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(`✅ Batch ${i + 1}/${batches.length} saved`);
  }

  console.log(`🎉 Successfully saved ${transactions.length} transactions!`);
}

// Main function to generate all transactions
async function generateAllTransactions() {
  try {
    console.log(
      "🚀 Starting realistic transaction generation for all users...\n"
    );

    // Fetch all users and accounts
    const users = await fetchUsersAndAccounts();

    if (users.length === 0) {
      console.log("❌ No users with accounts found!");
      return;
    }

    console.log(`\n📊 Found ${users.length} users with accounts\n`);

    // Clear existing transactions
    await clearAllTransactions();

    const allTransactions = [];
    const startDate = new Date("2020-01-01");
    const endDate = new Date("2025-04-30");

    // Generate transactions for each user's accounts
    for (const user of users) {
      console.log(
        `\n👤 Processing user: ${user.firstName} ${user.lastName || ""}`
      );

      for (const account of user.accounts) {
        const accountTransactions = generateTransactionsForAccount(
          user.id,
          account,
          startDate,
          endDate
        );

        // Calculate running balances
        const transactionsWithBalances = calculateRunningBalances(
          accountTransactions,
          account.balance
        );

        allTransactions.push(...transactionsWithBalances);

        console.log(
          `  ✅ Generated ${transactionsWithBalances.length} transactions`
        );
      }
    }

    console.log(`\n📈 Total transactions generated: ${allTransactions.length}`);

    // Save all transactions
    await saveTransactions(allTransactions);

    // Summary statistics
    const totalIncome = allTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(
      allTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    console.log("\n📊 Generation Summary:");
    console.log(
      `   Total Transactions: ${allTransactions.length.toLocaleString()}`
    );
    console.log(`   Total Income: $${totalIncome.toLocaleString()}`);
    console.log(`   Total Expenses: $${totalExpenses.toLocaleString()}`);
    console.log(
      `   Net Flow: $${(totalIncome - totalExpenses).toLocaleString()}`
    );

    console.log("\n✨ Transaction generation completed successfully!");
    console.log(
      "🔄 Refresh your app to see the new realistic transaction history."
    );
  } catch (error) {
    console.error("❌ Error generating transactions:", error);
    process.exit(1);
  }
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllTransactions();
}

export { generateAllTransactions };
