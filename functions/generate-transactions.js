/**
 * Firestore Admin Script - Generate Realistic Historical Transactions
 * Run with: firebase functions:shell --project swiftbank-2811b
 * Then execute: generateRealisticTransactions()
 */

// Johnson's account info
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
    frequency: 0.15,
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
    frequency: 0.2,
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
    frequency: 0.18,
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
    frequency: 0.12,
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
    frequency: 0.15,
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
    frequency: 0.12,
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
    frequency: 0.08,
  },
};

// Utility functions
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function selectAccount(type, amount) {
  if (type === "income" || amount > 1000) {
    return JOHNSON_ACCOUNTS.primary;
  } else if (Math.random() > 0.7) {
    return JOHNSON_ACCOUNTS.savings;
  } else {
    return JOHNSON_ACCOUNTS.checking;
  }
}

function generateTransaction(date) {
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

  if (!selectedCategory) {
    selectedCategory = { name: "shopping", ...TRANSACTION_CATEGORIES.shopping };
  }

  const amount = randomAmount(
    selectedCategory.amountRange[0],
    selectedCategory.amountRange[1]
  );
  const description = randomSelect(selectedCategory.descriptions);
  const accountId = selectAccount(selectedCategory.name, amount);

  const transactionAmount =
    selectedCategory.name === "income" ? amount : -amount;
  const type =
    selectedCategory.name === "income"
      ? "deposit"
      : ["groceries", "dining", "shopping"].includes(selectedCategory.name)
        ? "purchase"
        : "withdrawal";

  return {
    userId: JOHNSON_USER_ID,
    accountId: accountId,
    amount: transactionAmount,
    description: description,
    type: type,
    status: "completed",
    timestamp: date,
    category: selectedCategory.name,
    balanceAfter: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function calculateBalances(transactions, startingBalance = 750000000) {
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  let runningBalance = startingBalance;

  for (const transaction of transactions) {
    transaction.balanceAfter = Math.round(runningBalance * 100) / 100;
    runningBalance -= transaction.amount;
  }

  return transactions;
}

// Export function for Firebase Functions shell
function generateRealisticTransactions() {
  console.log("🏦 Generating realistic historical transactions...");

  const admin = require("firebase-admin");
  const db = admin.firestore();

  const startDate = new Date("2020-01-01");
  const endDate = new Date("2025-04-30");
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const totalTransactions = Math.floor((totalDays / 7) * 3.5);

  console.log(
    `📊 Generating ${totalTransactions} transactions from 2020-01-01 to 2025-04-30 over ${totalDays} days`
  );

  const transactions = [];

  for (let i = 0; i < totalTransactions; i++) {
    const transactionDate = randomDate(startDate, endDate);
    const transaction = generateTransaction(transactionDate);
    transactions.push(transaction);
  }

  const transactionsWithBalances = calculateBalances(transactions);

  // Clear existing transactions
  return db
    .collection("transactions")
    .where("userId", "==", JOHNSON_USER_ID)
    .get()
    .then((snapshot) => {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    })
    .then(() => {
      console.log("🧹 Cleared existing transactions");

      // Add new transactions in batches
      const batchSize = 500;
      const batches = [];

      for (let i = 0; i < transactionsWithBalances.length; i += batchSize) {
        const batch = db.batch();
        const batchTransactions = transactionsWithBalances.slice(
          i,
          i + batchSize
        );

        batchTransactions.forEach((transaction) => {
          const docRef = db.collection("transactions").doc();
          batch.set(docRef, transaction);
        });

        batches.push(batch);
      }

      return Promise.all(batches.map((batch) => batch.commit()));
    })
    .then(() => {
      console.log(
        `🎉 Successfully generated ${transactionsWithBalances.length} historical transactions!`
      );

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

      return transactionsWithBalances.length;
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      throw error;
    });
}

module.exports = { generateRealisticTransactions };
