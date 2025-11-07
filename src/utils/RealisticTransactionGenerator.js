/**
 * Client-Side Realistic Transaction Generator
 * This can be added to your admin panel to generate transactions
 * Uses the existing FirestoreService and runs in the browser
 */

// Import this into your admin panel or run via browser console
export class RealisticTransactionGenerator {
  constructor(firestoreService) {
    this.firestoreService = firestoreService;
    this.TRANSACTION_CATEGORIES = {
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
        timing: "monthly",
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
          "Capital Gains - Stock Sale",
          "Investment Income - Bonds",
          "Mutual Fund Distribution",
          "Real Estate Income",
          "Crypto Trading Profit",
          "Interest Payment - Savings",
          "Investment Return",
          "Stock Dividend - Apple Inc",
          "Bond Interest Payment",
        ],
        amountRange: [200, 8500],
        frequency: 0.04,
        type: "deposit",
        isIncome: true,
        timing: "irregular",
      },

      // High-value categories for wealthy individuals
      luxury_investment: {
        descriptions: [
          "Private Equity Distribution",
          "Hedge Fund Profit Share",
          "Real Estate Sale - Commercial",
          "Art Investment Sale",
          "Luxury Asset Liquidation",
          "Private Investment Return",
          "Capital Gains - Major Sale",
          "Investment Property Sale",
          "Business Sale Proceeds",
          "Portfolio Rebalancing",
        ],
        amountRange: [500000, 50000000],
        frequency: 0.01,
        type: "deposit",
        isIncome: true,
        timing: "rare",
      },

      business_income: {
        descriptions: [
          "Business Revenue Transfer",
          "Executive Compensation",
          "Board Member Fee",
          "Consulting Income - C-Suite",
          "Speaking Engagement Fee",
          "Business Partnership Profit",
          "Corporate Bonus Payment",
          "Stock Option Exercise",
          "Director Compensation",
          "Business Sale Profit",
        ],
        amountRange: [100000, 10000000],
        frequency: 0.02,
        type: "deposit",
        isIncome: true,
        timing: "quarterly",
      },

      luxury_purchases: {
        descriptions: [
          "Private Jet Charter",
          "Luxury Vehicle Purchase",
          "Yacht Maintenance",
          "High-End Art Purchase",
          "Luxury Real Estate",
          "Private Club Membership",
          "Designer Jewelry",
          "Luxury Travel Package",
          "Fine Wine Collection",
          "Luxury Watch Purchase",
        ],
        amountRange: [50000, 5000000],
        frequency: 0.005,
        type: "purchase",
        isIncome: false,
        timing: "rare",
      },

      philanthropy: {
        descriptions: [
          "Charitable Donation",
          "Foundation Contribution",
          "University Endowment",
          "Medical Research Donation",
          "Arts Foundation Grant",
          "Environmental Charity",
          "Educational Foundation",
          "Non-Profit Contribution",
          "Humanitarian Aid",
          "Community Development Fund",
        ],
        amountRange: [25000, 1000000],
        frequency: 0.02,
        type: "transfer",
        isIncome: false,
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
  }

  // Utility functions
  randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  randomAmount(min, max, precision = 2) {
    const amount = Math.random() * (max - min) + min;
    return (
      Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision)
    );
  }

  randomSelect(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  selectCategory() {
    const rand = Math.random();
    let cumulative = 0;

    for (const [categoryName, config] of Object.entries(
      this.TRANSACTION_CATEGORIES
    )) {
      cumulative += config.frequency;
      if (rand <= cumulative) {
        return { name: categoryName, ...config };
      }
    }

    return { name: "shopping", ...this.TRANSACTION_CATEGORIES.shopping };
  }

  generateSpecificTransaction(categoryName, amount, date, userId, accountId) {
    const category = this.TRANSACTION_CATEGORIES[categoryName];
    if (!category) {
      throw new Error(`Unknown category: ${categoryName}`);
    }

    const description = this.randomSelect(category.descriptions);
    const transactionAmount = category.isIncome
      ? Math.abs(amount)
      : -Math.abs(amount);

    return {
      id: this.generateTransactionId(),
      userId: userId,
      accountId: accountId,
      amount: transactionAmount,
      description: description,
      type: category.type,
      status: "completed",
      timestamp: date,
      category: categoryName,
      balanceAfter: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  generateTransactionsForAccount(userId, account, startDate, endDate) {
    const transactions = [];
    const targetBalance = account.balance;
    const accountId = account.id;

    console.log(
      `  📊 Generating transactions for ${account.accountType} (Target: $${targetBalance.toLocaleString()})`
    );

    const daysInPeriod = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    // Determine wealth tier and adjust transaction patterns
    const isBillionaire = targetBalance >= 1000000000;
    const isMultiMillionaire = targetBalance >= 100000000;
    const isMillionaire = targetBalance >= 1000000;
    const isWealthy = targetBalance >= 100000;

    // Cap transaction count to 100 for performance (representing the most recent transactions)
    let baseTransactionCount;
    if (isBillionaire) {
      baseTransactionCount = 100; // Recent 100 transactions for billionaires
    } else if (isMultiMillionaire) {
      baseTransactionCount = 90; // Recent 90 transactions for multi-millionaires
    } else if (isMillionaire) {
      baseTransactionCount = 80; // Recent 80 transactions for millionaires
    } else if (isWealthy) {
      baseTransactionCount = 70; // Recent 70 transactions for wealthy
    } else {
      baseTransactionCount = 50; // Recent 50 transactions for regular accounts
    }

    console.log(
      `  📈 Generating ${baseTransactionCount} recent transactions (performance optimized)`
    );

    const transactionCount = baseTransactionCount;
    const incomeCount = Math.floor(
      transactionCount * (isBillionaire ? 0.3 : 0.25)
    );
    const expenseCount = transactionCount - incomeCount;

    // Generate income transactions with wealth-appropriate categories
    let totalIncome = 0;
    for (let i = 0; i < incomeCount; i++) {
      const date = this.randomDate(startDate, endDate);
      let category = "salary";

      if (isBillionaire || isMultiMillionaire) {
        const rand = Math.random();
        if (rand < 0.4) category = "business_income";
        else if (rand < 0.7) category = "luxury_investment";
        else if (rand < 0.85) category = "investment";
        else category = "salary";
      } else if (isMillionaire) {
        const rand = Math.random();
        if (rand < 0.3) category = "business_income";
        else if (rand < 0.5) category = "investment";
        else if (rand < 0.8) category = "salary";
        else category = "freelance";
      } else {
        const rand = Math.random();
        if (rand < 0.7) category = "salary";
        else if (rand < 0.9) category = "freelance";
        else category = "investment";
      }

      const categoryConfig = this.TRANSACTION_CATEGORIES[category];

      // Scale amounts based on wealth tier
      let scaledMin = categoryConfig.amountRange[0];
      let scaledMax = categoryConfig.amountRange[1];

      if (isBillionaire) {
        scaledMin *= 10; // 10x scaling for billionaires
        scaledMax *= 10;
      } else if (isMultiMillionaire) {
        scaledMin *= 5; // 5x scaling for multi-millionaires
        scaledMax *= 5;
      } else if (isMillionaire) {
        scaledMin *= 2; // 2x scaling for millionaires
        scaledMax *= 2;
      }

      const amount = this.randomAmount(scaledMin, scaledMax);

      const transaction = this.generateSpecificTransaction(
        category,
        amount,
        date,
        userId,
        accountId
      );
      transactions.push(transaction);
      totalIncome += amount;
    }

    // Generate expense transactions with wealth-appropriate categories
    const availableToSpend = totalIncome - targetBalance;
    let totalExpenses = 0;

    for (let i = 0; i < expenseCount; i++) {
      const date = this.randomDate(startDate, endDate);
      let categoryName;

      // Select appropriate expense categories based on wealth tier
      if (isBillionaire || isMultiMillionaire) {
        const rand = Math.random();
        if (rand < 0.15) categoryName = "luxury_purchases";
        else if (rand < 0.25) categoryName = "philanthropy";
        else if (rand < 0.35) categoryName = "shopping";
        else if (rand < 0.45) categoryName = "dining";
        else if (rand < 0.55) categoryName = "transportation";
        else if (rand < 0.65) categoryName = "utilities";
        else if (rand < 0.75) categoryName = "healthcare";
        else if (rand < 0.85) categoryName = "entertainment";
        else categoryName = "groceries";
      } else {
        // Use regular category selection for non-billionaires
        const category = this.selectCategory();
        if (category.isIncome) continue;
        categoryName = category.name;
      }

      const categoryConfig = this.TRANSACTION_CATEGORIES[categoryName];
      if (!categoryConfig || categoryConfig.isIncome) continue;

      // Scale expense amounts based on wealth tier
      let scaledMin = categoryConfig.amountRange[0];
      let scaledMax = categoryConfig.amountRange[1];

      if (isBillionaire) {
        scaledMin *= 20; // Higher scaling for expenses
        scaledMax *= 20;
      } else if (isMultiMillionaire) {
        scaledMin *= 10;
        scaledMax *= 10;
      } else if (isMillionaire) {
        scaledMin *= 3;
        scaledMax *= 3;
      }

      const remainingBudget = availableToSpend - totalExpenses;
      const remainingTransactions = expenseCount - i;

      let maxAmount = Math.min(
        scaledMax,
        (remainingBudget * 0.8) / Math.max(remainingTransactions, 1)
      );

      maxAmount = Math.max(maxAmount, scaledMin);
      const amount = this.randomAmount(scaledMin, maxAmount);

      const transaction = this.generateSpecificTransaction(
        categoryName,
        amount,
        date,
        userId,
        accountId
      );
      transactions.push(transaction);
      totalExpenses += amount;
    }

    // Add adjustment transaction if needed
    const calculatedBalance = totalIncome - totalExpenses;
    const balanceDifference = targetBalance - calculatedBalance;

    if (Math.abs(balanceDifference) > 1) {
      const adjustmentDate = this.randomDate(
        startDate,
        new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      );

      if (balanceDifference > 0) {
        const transaction = this.generateSpecificTransaction(
          "salary",
          balanceDifference,
          adjustmentDate,
          userId,
          accountId
        );
        transactions.push(transaction);
      } else {
        const transaction = this.generateSpecificTransaction(
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

  calculateRunningBalances(transactions, finalBalance) {
    transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let runningBalance = 0;

    for (const transaction of transactions) {
      runningBalance += transaction.amount;
      transaction.balanceAfter = Math.round(runningBalance * 100) / 100;
    }

    const finalCalculatedBalance = runningBalance;
    const adjustment = finalBalance - finalCalculatedBalance;

    for (const transaction of transactions) {
      transaction.balanceAfter += adjustment;
      transaction.balanceAfter =
        Math.round(transaction.balanceAfter * 100) / 100;
    }

    return transactions;
  }

  async generateAllTransactions(onProgress = null, currentAdminId = null) {
    try {
      console.log(
        "🚀 Starting realistic transaction generation for assigned customers..."
      );

      // Get assigned customers only (not all users)
      let usersToProcess = [];

      if (currentAdminId) {
        console.log(
          `👥 Loading customers assigned to admin: ${currentAdminId}`
        );

        try {
          // Get admin assignments for this admin
          const assignmentsSnapshot =
            await this.firestoreService.list("adminAssignments");
          const adminAssignments = assignmentsSnapshot.filter(
            (assignment) =>
              assignment.adminId === currentAdminId &&
              assignment.isActive !== false
          );

          if (adminAssignments.length === 0) {
            console.log("⚠️ No customers assigned to this admin");
            return {
              totalUsers: 0,
              totalAccounts: 0,
              totalTransactions: 0,
              usersProcessed: [],
              message: "No customers assigned to generate transactions for.",
            };
          }

          // Get the assigned customer IDs
          const assignedCustomerIds = adminAssignments.map((a) => a.customerId);
          console.log("🔗 Assigned customer IDs:", assignedCustomerIds);

          // Load only assigned customers
          const allUsers = await this.firestoreService.list("users");
          usersToProcess = allUsers.filter(
            (user) =>
              assignedCustomerIds.includes(user.id) && user.role === "customer"
          );

          console.log(`📋 Found ${usersToProcess.length} assigned customers`);
        } catch (assignmentError) {
          console.error("❌ Error loading admin assignments:", assignmentError);
          throw new Error(
            `Failed to load admin assignments: ${assignmentError.message}`
          );
        }
      } else {
        // Fallback: try to get all users (for developer/system admin)
        console.log("🔧 No admin ID provided, attempting to load all users...");
        try {
          const allUsers = await this.firestoreService.list("users");
          usersToProcess = allUsers.filter((user) => user.role !== "admin");
          console.log(`📋 Found ${usersToProcess.length} total customer users`);
        } catch (userError) {
          console.error("❌ Error loading users:", userError);
          throw new Error(`Failed to load users: ${userError.message}`);
        }
      }

      const usersWithAccounts = [];

      for (const user of usersToProcess) {
        try {
          console.log(
            `🔍 Checking user: ${user.firstName || user.name || "Unknown"} (${user.role || "customer"})`
          );

          // Skip admin users (should already be filtered out, but extra safety)
          if (user.role === "admin") {
            console.log(`  ⏭️ Skipping admin user`);
            continue;
          }

          // Use the existing getAccountsForUser method which handles multiple storage patterns
          let accounts = [];

          try {
            // First try embedded accounts in user document
            if (user.accounts && Array.isArray(user.accounts)) {
              accounts = user.accounts.filter((acc) => acc.status === "active");
            }

            // If no embedded accounts, use the FirestoreService method
            if (accounts.length === 0) {
              const userAccounts =
                await this.firestoreService.getAccountsForUser(user.id);
              accounts = userAccounts.filter((acc) => acc.status === "active");
            }
          } catch (accountError) {
            console.warn(
              `⚠️ Could not fetch accounts for user ${user.id}:`,
              accountError.message
            );
            // Continue with empty accounts array - user might not have accounts yet
            accounts = [];
          }

          if (accounts.length > 0) {
            usersWithAccounts.push({ ...user, accounts });
            console.log(
              `✅ User: ${user.firstName || user.name || "Unknown"} ${user.lastName || ""} - ${accounts.length} accounts`
            );
            accounts.forEach((acc) => {
              console.log(
                `   💰 ${acc.accountType}: $${acc.balance?.toLocaleString()}`
              );
            });
          } else {
            console.log(
              `⚠️ No accounts found for user: ${user.firstName || user.name || "Unknown"} ${user.lastName || ""}`
            );
          }
        } catch (userError) {
          console.warn(
            `⚠️ Error processing user ${user.id}:`,
            userError.message
          );
          // Continue processing other users even if one fails
          continue;
        }
      }

      if (usersWithAccounts.length === 0) {
        throw new Error(
          "No users with accounts found! Please ensure users have accounts with balances before generating transactions."
        );
      }

      console.log(`📊 Found ${usersWithAccounts.length} users with accounts`);

      // Clear existing transactions
      console.log("🧹 Clearing existing transactions...");
      const existingTransactions =
        await this.firestoreService.list("transactions");

      for (let i = 0; i < existingTransactions.length; i++) {
        await this.firestoreService.delete(
          "transactions",
          existingTransactions[i].id
        );
        if (onProgress) {
          onProgress(
            `Clearing transactions: ${i + 1}/${existingTransactions.length}`
          );
        }
      }

      const allTransactions = [];
      // Generate recent transactions (last 6 months for performance)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

      console.log(
        `📅 Generating recent transactions from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
      );

      // Generate transactions for each user's accounts
      for (const user of usersWithAccounts) {
        console.log(
          `👤 Processing user: ${user.firstName} ${user.lastName || ""}`
        );

        for (const account of user.accounts) {
          const accountTransactions = this.generateTransactionsForAccount(
            user.id,
            account,
            startDate,
            endDate
          );

          const transactionsWithBalances = this.calculateRunningBalances(
            accountTransactions,
            account.balance
          );

          allTransactions.push(...transactionsWithBalances);
          console.log(
            `  ✅ Generated ${transactionsWithBalances.length} transactions`
          );
        }
      }

      console.log(`📈 Total transactions generated: ${allTransactions.length}`);

      // Save all transactions
      console.log("💾 Saving transactions...");
      for (let i = 0; i < allTransactions.length; i++) {
        const transaction = allTransactions[i];
        const { id, ...transactionData } = transaction;

        await this.firestoreService.create("transactions", transactionData);

        if (onProgress && i % 10 === 0) {
          onProgress(`Saving transactions: ${i + 1}/${allTransactions.length}`);
        }
      }

      // Summary statistics
      const totalIncome = allTransactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = Math.abs(
        allTransactions
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)
      );

      const summary = {
        totalTransactions: allTransactions.length,
        totalIncome,
        totalExpenses,
        netFlow: totalIncome - totalExpenses,
      };

      console.log("✨ Transaction generation completed successfully!");
      return summary;
    } catch (error) {
      console.error("❌ Error generating transactions:", error);
      throw error;
    }
  }
}

// Example usage in your admin panel:
/*
import { RealisticTransactionGenerator } from './path-to-this-file';
import { firestoreService } from './path-to-firestore-service';

const generator = new RealisticTransactionGenerator(firestoreService);

// In your admin component:
const handleGenerateTransactions = async () => {
  setIsGenerating(true);
  try {
    const summary = await generator.generateAllTransactions((progress) => {
      setProgressMessage(progress);
    });
    console.log('Generation complete:', summary);
  } catch (error) {
    console.error('Generation failed:', error);
  } finally {
    setIsGenerating(false);
  }
};
*/
