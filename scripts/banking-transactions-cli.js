#!/usr/bin/env node

/**
 * CLI Tool for Banking Transaction Management
 * Provides commands to generate, clear, and manage realistic banking transactions
 */

import { generateAllTransactions } from "./generate-realistic-banking-transactions.js";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "swiftbank-2811b",
  });
}

const db = admin.firestore();

// Show help information
function showHelp() {
  console.log(`
🏦 Banking Transaction CLI Tool
===============================

Commands:
  generate     Generate realistic transactions for all users
  status       Show current transaction statistics
  clear        Clear all existing transactions (use with caution!)
  help         Show this help message

Examples:
  node banking-transactions-cli.js generate
  node banking-transactions-cli.js status
  node banking-transactions-cli.js clear

Features:
✅ Generates realistic banking transactions
✅ Matches existing account balances exactly
✅ Includes diverse transaction types (salary, shopping, utilities, etc.)
✅ Proper chronological ordering
✅ Running balance calculations
✅ Support for multiple users and accounts
  `);
}

// Show transaction statistics
async function showStatus() {
  try {
    console.log("📊 Fetching transaction statistics...\n");

    // Get total transaction count
    const transactionsSnapshot = await db.collection("transactions").get();
    const totalTransactions = transactionsSnapshot.docs.length;

    if (totalTransactions === 0) {
      console.log("📭 No transactions found in the database");
      return;
    }

    // Analyze transactions
    let totalIncome = 0;
    let totalExpenses = 0;
    let userStats = {};
    let categoryStats = {};

    transactionsSnapshot.docs.forEach((doc) => {
      const transaction = doc.data();
      const amount = transaction.amount || 0;
      const userId = transaction.userId;
      const category = transaction.category || "unknown";

      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpenses += Math.abs(amount);
      }

      // User statistics
      if (!userStats[userId]) {
        userStats[userId] = { count: 0, income: 0, expenses: 0 };
      }
      userStats[userId].count++;
      if (amount > 0) {
        userStats[userId].income += amount;
      } else {
        userStats[userId].expenses += Math.abs(amount);
      }

      // Category statistics
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, total: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].total += Math.abs(amount);
    });

    // Display statistics
    console.log("📈 Transaction Statistics");
    console.log("=".repeat(50));
    console.log(`Total Transactions: ${totalTransactions.toLocaleString()}`);
    console.log(`Total Income: $${totalIncome.toLocaleString()}`);
    console.log(`Total Expenses: $${totalExpenses.toLocaleString()}`);
    console.log(`Net Flow: $${(totalIncome - totalExpenses).toLocaleString()}`);

    console.log("\n👥 Per User Statistics");
    console.log("=".repeat(50));
    Object.entries(userStats).forEach(([userId, stats]) => {
      console.log(`User ${userId.substring(0, 8)}...:`);
      console.log(`  Transactions: ${stats.count}`);
      console.log(`  Income: $${stats.income.toLocaleString()}`);
      console.log(`  Expenses: $${stats.expenses.toLocaleString()}`);
      console.log(
        `  Net: $${(stats.income - stats.expenses).toLocaleString()}`
      );
      console.log("");
    });

    console.log("🏷️  Top Transaction Categories");
    console.log("=".repeat(50));
    const sortedCategories = Object.entries(categoryStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10);

    sortedCategories.forEach(([category, stats]) => {
      console.log(
        `${category.padEnd(15)}: ${stats.count.toString().padStart(4)} transactions ($${stats.total.toLocaleString()})`
      );
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
  }
}

// Clear all transactions
async function clearTransactions() {
  try {
    console.log("⚠️  This will delete ALL transactions from the database!");
    console.log(
      "Are you sure you want to continue? This action cannot be undone."
    );
    console.log(
      "To confirm, please run the generation script which includes clearing."
    );
  } catch (error) {
    console.error("❌ Error clearing transactions:", error);
  }
}

// Main CLI handler
async function main() {
  const command = process.argv[2] || "help";

  console.log("🏦 Banking Transaction CLI Tool\n");

  switch (command.toLowerCase()) {
    case "generate":
      console.log("🚀 Starting transaction generation...\n");
      await generateAllTransactions();
      break;

    case "status":
      await showStatus();
      break;

    case "clear":
      await clearTransactions();
      break;

    case "help":
    case "--help":
    case "-h":
    default:
      showHelp();
      break;
  }
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ CLI Error:", error);
    process.exit(1);
  });
}
