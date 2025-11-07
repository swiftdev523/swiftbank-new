#!/usr/bin/env node

/**
 * Generate Realistic Historical Transactions
 * Creates realistic transaction history from 2020 to April 2025 with varied descriptions,
 * realistic amounts, and proper account linkage for Johnson Boseman.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

// Firebase config - use environment variables or hardcoded for script
const firebaseConfig = {
  apiKey:
    process.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBjcZaBI0kXYBcjJwmn5T_JB6Pm8VzUPkY",
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || "swiftbank-2811b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "swiftbank-2811b",
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET || "swiftbank-2811b.appspot.com",
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Johnson's account info from Firestore screenshot
const JOHNSON_USER_ID = "mYFGjRgsARS0AheCdYUkzhMRLkk2";
const JOHNSON_ACCOUNTS = {
  primary: "johnson_primary",
  checking: "johnson_checking",
  savings: "johnson_savings",
};

// Transaction categories with realistic descriptions and amount ranges
const TRANSACTION_CATEGORIES = {
  income: {
    descriptions: [
      "Salary Deposit - Tech Corp",
      "Freelance Payment - Web Design",
      "Investment Dividend - Portfolio",
      "Bonus Payment - Annual",
      "Contract Payment - Consulting",
      "Side Hustle - App Development",
      "Royalty Payment - Software License",
      "Tax Refund - Federal",
      "Gift Deposit - Family",
      "Rental Income - Property",
    ],
    amountRange: [2500, 8500],
    frequency: 0.15, // 15% of transactions
  },
  groceries: {
    descriptions: [
      "Grocery Store - Whole Foods",
      "Supermarket - Kroger",
      "Grocery Shopping - Target",
      "Fresh Market - Local",
      "Organic Foods - Trader Joe's",
      "Bulk Shopping - Costco",
      "Corner Store - Quick Buy",
      "Farmers Market - Weekend",
      "Online Grocery - Instacart",
      "Specialty Foods - Deli",
    ],
    amountRange: [45, 185],
    frequency: 0.2, // 20% of transactions
  },
  dining: {
    descriptions: [
      "Restaurant - Italian Bistro",
      "Fast Food - McDonald's",
      "Coffee Shop - Starbucks",
      "Fine Dining - The Steakhouse",
      "Takeout - Chinese Garden",
      "Food Delivery - DoorDash",
      "Lunch - Subway",
      "Brunch - Local Cafe",
      "Pizza - Domino's",
      "Food Truck - Downtown",
    ],
    amountRange: [8, 125],
    frequency: 0.18, // 18% of transactions
  },
  utilities: {
    descriptions: [
      "Electric Bill - City Power",
      "Gas Bill - Natural Gas Co",
      "Water Bill - Municipal",
      "Internet - Fiber Connect",
      "Phone Bill - Wireless Plus",
      "Cable TV - Entertainment Co",
      "Streaming - Netflix",
      "Trash Service - Waste Mgmt",
      "Home Insurance - State Farm",
      "Security System - ADT",
    ],
    amountRange: [25, 280],
    frequency: 0.12, // 12% of transactions
  },
  transportation: {
    descriptions: [
      "Gas Station - Shell",
      "Gas Station - Exxon",
      "Uber Ride - Downtown",
      "Lyft Ride - Airport",
      "Public Transit - Metro",
      "Car Maintenance - AutoZone",
      "Parking Fee - Downtown",
      "Toll Road - Highway",
      "Car Wash - Express Clean",
      "Oil Change - Quick Lube",
    ],
    amountRange: [5, 85],
    frequency: 0.15, // 15% of transactions
  },
  shopping: {
    descriptions: [
      "Amazon Purchase - Online",
      "Department Store - Macy's",
      "Electronics - Best Buy",
      "Clothing - H&M",
      "Home Improvement - Home Depot",
      "Pharmacy - CVS",
      "Books - Barnes & Noble",
      "Sporting Goods - Dick's",
      "Office Supplies - Staples",
      "Gift Purchase - Local Shop",
    ],
    amountRange: [15, 450],
    frequency: 0.12, // 12% of transactions
  },
  healthcare: {
    descriptions: [
      "Doctor Visit - Primary Care",
      "Dentist - Routine Cleaning",
      "Pharmacy - Prescription",
      "Specialist - Dermatology",
      "Eye Exam - Vision Center",
      "Physical Therapy - Rehab",
      "Lab Work - Blood Test",
      "Urgent Care - Walk-in",
      "Health Insurance - Premium",
      "Vitamins - Health Store",
    ],
    amountRange: [20, 350],
    frequency: 0.08, // 8% of transactions
  },
};

// Generate random date between start and end
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Generate random amount within range
function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Select random item from array
function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Select account based on transaction type
function selectAccount(type, amount) {
  if (type === "income" || amount > 1000) {
    return JOHNSON_ACCOUNTS.primary;
  } else if (Math.random() > 0.7) {
    return JOHNSON_ACCOUNTS.savings;
  } else {
    return JOHNSON_ACCOUNTS.checking;
  }
}

// Generate a single realistic transaction
function generateTransaction(date) {
  // Select category based on frequency weights
  const rand = Math.random();
  let cumulative = 0;
  let selectedCategory = null;

  for (const [category, config] of Object.entries(TRANSACTION_CATEGORIES)) {
    cumulative += config.frequency;
    if (rand <= cumulative) {
      selectedCategory = { name: category, ...config };
      break;
    }
  }

  // Fallback to shopping if no category selected
  if (!selectedCategory) {
    selectedCategory = { name: "shopping", ...TRANSACTION_CATEGORIES.shopping };
  }

  const amount = randomAmount(
    selectedCategory.amountRange[0],
    selectedCategory.amountRange[1]
  );
  const description = randomSelect(selectedCategory.descriptions);
  const accountId = selectAccount(selectedCategory.name, amount);

  // Income transactions are positive, others are negative
  const transactionAmount =
    selectedCategory.name === "income" ? amount : -amount;
  const type =
    selectedCategory.name === "income"
      ? "deposit"
      : ["groceries", "dining", "shopping"].includes(selectedCategory.name)
        ? "purchase"
        : "withdrawal";

  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: JOHNSON_USER_ID,
    accountId: accountId,
    amount: transactionAmount,
    description: description,
    type: type,
    status: "completed",
    timestamp: date,
    category: selectedCategory.name,
    balanceAfter: 0, // Will be calculated after sorting
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Calculate running balances (start with current balance and work backwards)
function calculateBalances(transactions, startingBalance = 750000000) {
  // Sort by date descending (newest first)
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  let runningBalance = startingBalance;

  for (const transaction of transactions) {
    transaction.balanceAfter = Math.round(runningBalance * 100) / 100;
    runningBalance -= transaction.amount; // Subtract because we're going backwards
  }

  return transactions;
}

// Clear existing transactions for Johnson
async function clearExistingTransactions() {
  console.log("🧹 Clearing existing transactions for Johnson...");

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", JOHNSON_USER_ID)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  if (snapshot.docs.length > 0) {
    await batch.commit();
    console.log(`✅ Deleted ${snapshot.docs.length} existing transactions`);
  } else {
    console.log("ℹ️ No existing transactions found to delete");
  }
}

// Generate and save historical transactions
async function generateHistoricalTransactions() {
  console.log(
    "🏦 Generating realistic historical transactions for Johnson Boseman..."
  );

  const startDate = new Date("2020-01-01");
  const endDate = new Date("2025-04-30");
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Generate 2-5 transactions per week on average (more realistic frequency)
  const totalTransactions = Math.floor((totalDays / 7) * 3.5); // ~3.5 transactions per week
  console.log(
    `📊 Generating ${totalTransactions} transactions from 2020-01-01 to 2025-04-30 over ${totalDays} days`
  );

  const transactions = [];

  for (let i = 0; i < totalTransactions; i++) {
    const transactionDate = randomDate(startDate, endDate);
    const transaction = generateTransaction(transactionDate);
    transactions.push(transaction);
  }

  // Calculate realistic balances
  console.log("💰 Calculating running balances...");
  const transactionsWithBalances = calculateBalances(transactions);

  // Clear existing transactions first
  await clearExistingTransactions();

  // Save transactions in batches
  console.log("💾 Saving transactions to Firestore...");
  const batchSize = 500; // Firestore batch limit
  const batches = [];

  for (let i = 0; i < transactionsWithBalances.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchTransactions = transactionsWithBalances.slice(i, i + batchSize);

    batchTransactions.forEach((transaction) => {
      const docRef = doc(collection(db, "transactions"));
      batch.set(docRef, transaction);
    });

    batches.push(batch);
  }

  // Execute all batches
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(
      `✅ Batch ${i + 1}/${batches.length} saved (${Math.min(batchSize, transactionsWithBalances.length - i * batchSize)} transactions)`
    );
  }

  console.log(
    `🎉 Successfully generated ${transactionsWithBalances.length} historical transactions!`
  );

  // Summary statistics
  const incomeTransactions = transactionsWithBalances.filter(
    (t) => t.type === "deposit"
  ).length;
  const expenseTransactions = transactionsWithBalances.filter(
    (t) => t.type !== "deposit"
  ).length;
  const totalIncome = transactionsWithBalances
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    transactionsWithBalances
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  console.log("\n📈 Transaction Summary:");
  console.log(`   Income transactions: ${incomeTransactions}`);
  console.log(`   Expense transactions: ${expenseTransactions}`);
  console.log(`   Total income: $${totalIncome.toLocaleString()}`);
  console.log(`   Total expenses: $${totalExpenses.toLocaleString()}`);
  console.log(`   Net: $${(totalIncome - totalExpenses).toLocaleString()}`);
}

// Main execution
async function main() {
  try {
    console.log("🚀 Starting realistic transaction generation...\n");
    await generateHistoricalTransactions();
    console.log("\n✨ Transaction generation completed successfully!");
    console.log("🔄 Refresh your app to see the new transaction history.");
  } catch (error) {
    console.error("❌ Error generating transactions:", error);
    process.exit(1);
  }
}

// Run the main function
main();
