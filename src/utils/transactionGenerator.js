/**
 * Transaction Generator Utility
 * Generates realistic transaction history for new accounts
 */

// Realistic transaction templates
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

export function generateRealisticTransactions(accountData, targetBalance) {
  const transactions = [];
  const accountId = accountData.id || "temp-account";
  const customerId = accountData.customerUID;

  // Start with a reasonable base amount and build up to target balance
  let currentBalance = 0;
  const targetAmount = Number(targetBalance) || 0;

  // Generate transactions from 2020 to April 2025 (5+ years of history)
  const endDate = new Date(2025, 3, 30); // April 30, 2025
  const startDate = new Date(2020, 0, 1); // January 1, 2020

  // Calculate how many transactions we need for 5+ years of realistic history
  const avgTransactionValue = 150; // Average transaction value
  const yearsOfHistory = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
  const avgTransactionsPerMonth = 12; // Realistic monthly transaction count
  const estimatedTransactionCount = Math.max(
    Math.floor(yearsOfHistory * 12 * avgTransactionsPerMonth), // Base on time span
    Math.min(300, Math.abs(targetAmount) / avgTransactionValue) // Cap at 300 transactions
  );

  // First, add income transactions to build up the balance
  const incomeCategories = ["salary", "freelance"];
  const expenseCategories = [
    "groceries",
    "dining",
    "utilities",
    "entertainment",
    "transport",
    "shopping",
  ];

  // Generate income transactions (about 30% of transactions)
  const incomeCount = Math.floor(estimatedTransactionCount * 0.3);
  let totalIncome = 0;

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
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: accountId,
      userId: customerId,
      type: template.type,
      category: category,
      amount: amount,
      description:
        template.descriptions[
          Math.floor(Math.random() * template.descriptions.length)
        ],
      timestamp: transactionDate,
      status: "completed",
      balance: currentBalance,
      currency: accountData.currency || "USD",
      createdAt: transactionDate,
      updatedAt: transactionDate,
    });
  }

  // Generate expense transactions (about 70% of transactions)
  const expenseCount = estimatedTransactionCount - incomeCount;
  let totalExpenses = 0;

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

    totalExpenses += amount;
    currentBalance -= amount;

    const transactionDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );

    transactions.push({
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: accountId,
      userId: customerId,
      type: template.type,
      category: category,
      amount: -amount, // Negative for expenses
      description:
        template.descriptions[
          Math.floor(Math.random() * template.descriptions.length)
        ],
      timestamp: transactionDate,
      status: "completed",
      balance: currentBalance,
      currency: accountData.currency || "USD",
      createdAt: transactionDate,
      updatedAt: transactionDate,
    });
  }

  // Add a final adjustment transaction to reach exact target balance
  if (Math.abs(currentBalance - targetAmount) > 1) {
    const adjustmentAmount = targetAmount - currentBalance;
    const adjustmentType = adjustmentAmount > 0 ? "deposit" : "withdrawal";
    const adjustmentDescription =
      adjustmentAmount > 0 ? "Account Opening Deposit" : "Account Adjustment";

    transactions.push({
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: accountId,
      userId: customerId,
      type: adjustmentType,
      category: "adjustment",
      amount: adjustmentAmount,
      description: adjustmentDescription,
      timestamp: new Date(),
      status: "completed",
      balance: targetAmount,
      currency: accountData.currency || "USD",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Sort transactions by date
  transactions.sort((a, b) => a.timestamp - b.timestamp);

  // Recalculate running balances to ensure accuracy
  let runningBalance = 0;
  transactions.forEach((transaction) => {
    runningBalance += transaction.amount;
    transaction.balance = runningBalance;
  });

  return transactions;
}
