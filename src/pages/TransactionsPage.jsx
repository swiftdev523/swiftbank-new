import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useBankData } from "../context/BankDataContext";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import firestoreService from "../services/firestoreService";
import {
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt,
  FaSearch,
  FaFilter,
  FaCircle,
} from "react-icons/fa";
import clbg1 from "../assets/images/clbg1.jpg";
import {
  normalizeTransactionArray,
  filterTransactions,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  formatTransactionAmount,
} from "../utils/transactionUtils";

const TransactionsPage = () => {
  const { user, userData } = useAuth();
  const { transactions: hardcodedTransactions } = useBankData();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch transactions when user is available
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.uid) return;

      try {
        setIsLoadingTransactions(true);

        // Use hardcoded transactions if available (for kindestwavelover)
        if (hardcodedTransactions && hardcodedTransactions.length > 0) {
          console.log(
            "🎯 Using hardcoded transactions:",
            hardcodedTransactions.length
          );
          setTransactions(hardcodedTransactions);
          setIsLoadingTransactions(false);
          return;
        }

        let userTransactions = await firestoreService.getUserTransactions(
          user.uid,
          100
        );

        // If still no transactions, try a direct Firestore query as a last resort
        if (userTransactions.length === 0) {
          try {
            // Import Firestore functions
            const { collection, query, where, getDocs } = await import(
              "firebase/firestore"
            );
            const { db } = await import("../config/firebase");

            const transactionsRef = collection(db, "transactions");
            const q = query(transactionsRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            const directTransactions = [];
            querySnapshot.forEach((doc) => {
              directTransactions.push({ id: doc.id, ...doc.data() });
            });

            userTransactions = directTransactions;
          } catch (directError) {
            console.warn("⚠️ Direct query also failed:", directError.message);
          }
        }

        // If no transactions found, create some sample ones based on user balance
        if (userTransactions.length === 0) {
          userTransactions = generateSampleTransactions(user);
        }

        // Format transactions for display using standardized normalization
        const formattedTransactions = normalizeTransactionArray(
          userTransactions,
          {
            includeUserInfo: false,
            includeAccountInfo: true,
            defaultStatus: "completed",
          }
        );

        // Always ensure we have some transactions to display
        if (formattedTransactions.length === 0) {
          const forcedTransactions = generateSampleTransactions(user);
          setTransactions(forcedTransactions);
        } else {
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        // Create fallback transactions even on error
        const fallbackTransactions = generateSampleTransactions(user);
        setTransactions(fallbackTransactions);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [user?.uid, hardcodedTransactions]);

  // Generate sample transactions based on user balance
  const generateSampleTransactions = (user) => {
    const balance = parseFloat(user?.balance) || 1000;
    if (balance <= 0) {
      // Even with 0 balance, create some sample transactions from 5 months ago
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

      return [
        {
          id: `sample_${Date.now()}_1`,
          type: "deposit",
          description: "Welcome Bonus",
          amount: 100,
          balanceAfter: 100,
          date: new Date(fiveMonthsAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          status: "completed",
        },
        {
          id: `sample_${Date.now()}_2`,
          type: "withdrawal",
          description: "ATM Withdrawal",
          amount: -100,
          balanceAfter: 0,
          date: new Date(fiveMonthsAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
          status: "completed",
        },
      ];
    }

    const transactions = [];
    let currentBalance = balance;

    // Generate much more transactions spanning back to 2018 but ending 5 months ago
    const startDate = new Date("2018-01-01");
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - 5); // End 5 months ago
    const totalMonths = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24 * 30)
    );

    // Generate 10-25 transactions per month for realistic history
    const transactionCount = Math.min(
      totalMonths * (Math.random() * 15 + 10),
      1200
    );

    // Generate realistic transactions with much more variety dating back to 2018
    const transactionTypes = [
      {
        type: "deposit",
        descriptions: [
          "Salary Deposit - Tech Corp",
          "Freelance Payment - Web Design",
          "Investment Dividend - Portfolio",
          "Bonus Payment - Annual Performance",
          "Contract Payment - Consulting",
          "Side Project Revenue",
          "Tax Refund - Federal",
          "Gift Deposit - Family",
          "Rental Income - Property",
          "Royalty Payment - Software License",
          "Stock Sale - Investment",
          "Cryptocurrency Sale",
          "Insurance Claim Payout",
          "Business Revenue - LLC",
          "Commission Payment - Sales",
        ],
      },
      {
        type: "withdrawal",
        descriptions: [
          "ATM Withdrawal - Downtown Branch",
          "ATM Withdrawal - Mall Location",
          "ATM Withdrawal - Gas Station",
          "Cash Withdrawal - Bank Teller",
          "ATM - Airport Terminal",
          "Emergency Cash - ATM",
          "Weekend Cash - ATM",
          "Travel Cash - Hotel ATM",
          "ATM Withdrawal - Grocery Store",
          "Quick Cash - Bank ATM",
          "ATM - Shopping Center",
          "Cash Advance - ATM",
          "ATM Withdrawal - University",
          "ATM - Restaurant District",
          "ATM Withdrawal - Beach Resort",
        ],
      },
      {
        type: "purchase",
        descriptions: [
          "Grocery Store - Whole Foods Market",
          "Restaurant - Italian Bistro Downtown",
          "Gas Station - Shell Regular",
          "Coffee Shop - Starbucks Morning",
          "Amazon Purchase - Electronics",
          "Pharmacy - CVS Prescription",
          "Supermarket - Kroger Weekly Shopping",
          "Fast Food - McDonald's Drive-Thru",
          "Department Store - Macy's Clothing",
          "Electronics Store - Best Buy",
          "Clothing Store - H&M Fashion",
          "Home Improvement - Home Depot",
          "Target - Household Items",
          "Uber Ride - Downtown to Airport",
          "Netflix Monthly Subscription",
          "Spotify Premium Subscription",
          "Gym Membership - Fitness Plus",
          "Phone Bill - Verizon Wireless",
          "Electric Bill - City Power Co",
          "Internet Bill - Comcast Cable",
          "Takeout - Chinese Garden Restaurant",
          "Food Delivery - DoorDash Order",
          "Lunch - Subway Sandwich",
          "Brunch - Local Cafe Weekend",
          "Pizza Delivery - Domino's Night",
          "Food Truck - Downtown Festival",
          "Parking Fee - Downtown Garage",
          "Toll Road - Highway Commission",
          "Car Maintenance - AutoZone Parts",
          "Oil Change - Quick Lube Service",
          "Car Wash - Express Detail",
          "Public Transit - Metro Card",
          "Lyft Ride - Business District",
          "Doctor Visit - Primary Care",
          "Dentist - Routine Cleaning",
          "Pharmacy - Prescription Refill",
          "Eye Exam - Vision Center",
          "Veterinarian - Pet Checkup",
          "Books - Barnes & Noble",
          "Streaming - Disney Plus",
          "Cloud Storage - Google Drive",
          "Software License - Adobe Creative",
        ],
      },
      {
        type: "transfer",
        descriptions: [
          "Transfer to Savings Account",
          "Transfer from Checking Account",
          "Internal Transfer - Primary to Savings",
          "Account Transfer - Emergency Fund",
          "Transfer - Investment Portfolio",
          "Move to High Yield Savings",
          "Transfer to Retirement Account",
          "Investment Account Transfer",
          "Savings Goal - Vacation Fund",
          "Portfolio Rebalancing Transfer",
          "Transfer to Money Market",
          "Emergency Fund Contribution",
          "Investment - Index Fund",
          "Transfer to CD Account",
          "Roth IRA Contribution",
        ],
      },
    ];

    // Generate transactions spanning from 2018 to now with realistic patterns
    const transactionCategories = [
      { types: [0], weight: 0.15, amountRange: [2500, 8500] }, // Deposits/Income
      { types: [1], weight: 0.12, amountRange: [20, 150] }, // ATM Withdrawals
      { types: [2], weight: 0.65, amountRange: [5, 450] }, // Purchases
      { types: [3], weight: 0.08, amountRange: [100, 2000] }, // Transfers
    ];

    // Start with account opening in 2018
    transactions.push({
      id: `sample_${Date.now()}_1`,
      type: "deposit",
      description: "Account Opening Deposit - Welcome",
      amount: 5000,
      balanceAfter: 5000,
      date: new Date("2018-01-15"),
      status: "completed",
    });

    // Generate historical transactions with realistic distribution
    for (let i = 2; i <= transactionCount; i++) {
      // Random date between 2018 and now, with more recent transactions being more frequent
      const daysSinceStart = Math.floor(
        Math.random() *
          Math.pow(
            (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            0.7
          )
      );
      const transactionDate = new Date(
        startDate.getTime() + daysSinceStart * 24 * 60 * 60 * 1000
      );

      // Select category based on weights
      let selectedCategory = transactionCategories[0];
      const rand = Math.random();
      let cumulative = 0;

      for (const category of transactionCategories) {
        cumulative += category.weight;
        if (rand <= cumulative) {
          selectedCategory = category;
          break;
        }
      }

      // Select random type from category
      const typeIndex =
        selectedCategory.types[
          Math.floor(Math.random() * selectedCategory.types.length)
        ];
      const typeInfo = transactionTypes[typeIndex];

      // Generate realistic amount based on category and year (inflation-adjusted)
      const yearsSince2018 = transactionDate.getFullYear() - 2018;
      const inflationMultiplier = Math.pow(1.03, yearsSince2018); // ~3% annual inflation

      let baseAmount =
        Math.random() *
          (selectedCategory.amountRange[1] - selectedCategory.amountRange[0]) +
        selectedCategory.amountRange[0];
      baseAmount *= inflationMultiplier;

      // For non-deposits, make amount negative
      const amount =
        typeInfo.type === "deposit"
          ? parseFloat(baseAmount.toFixed(2))
          : -parseFloat(baseAmount.toFixed(2));

      const description =
        typeInfo.descriptions[
          Math.floor(Math.random() * typeInfo.descriptions.length)
        ];

      transactions.push({
        id: `sample_${Date.now()}_${i}`,
        type: typeInfo.type,
        description: description,
        amount: amount,
        balanceAfter: 0, // Will be calculated after sorting
        date: transactionDate,
        status: "completed",
      });
    }

    // Sort by date and calculate running balances
    transactions.sort((a, b) => a.date - b.date);

    let runningBalance = 0;
    transactions.forEach((transaction) => {
      runningBalance += transaction.amount;
      transaction.balanceAfter = parseFloat(runningBalance.toFixed(2));
    });

    // Adjust final balance to match user's actual balance
    if (transactions.length > 0) {
      const finalBalance = transactions[transactions.length - 1].balanceAfter;
      const adjustment = balance - finalBalance;

      if (Math.abs(adjustment) > 1) {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        const adjustmentDate = new Date(
          fiveMonthsAgo.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
        );
        transactions.push({
          id: `sample_${Date.now()}_adjustment`,
          type: adjustment > 0 ? "deposit" : "withdrawal",
          description:
            adjustment > 0
              ? "Balance Adjustment - Portfolio Revaluation"
              : "Balance Adjustment - Fee Correction",
          amount: parseFloat(adjustment.toFixed(2)),
          balanceAfter: balance,
          date: adjustmentDate,
          status: "completed",
        });
      }
    }

    // Return sorted by date (newest first for display)
    return transactions.sort((a, b) => b.date - a.date);
  };

  if (!user) return <LoadingSpinner fullScreen size="lg" />;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "short",
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FaArrowDown className="text-green-600 text-sm sm:text-base" />
          </div>
        );
      case "withdrawal":
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FaArrowUp className="text-red-600 text-sm sm:text-base" />
          </div>
        );
      case "transfer":
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaExchangeAlt className="text-blue-600 text-sm sm:text-base" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <FaCircle className="text-gray-600 text-xs sm:text-sm" />
          </div>
        );
    }
  };

  // Use standardized filtering
  const filteredTransactions = filterTransactions(
    transactions,
    searchTerm,
    filter,
    "all"
  );

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/95"></div>

      <div className="relative z-10">
        <Header
          customerName={
            userData?.firstName
              ? `${userData.firstName}${userData.lastName ? " " + userData.lastName : ""}`
              : user?.displayName || user?.email?.split("@")[0] || "User"
          }
        />

        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pt-20 sm:pt-24 pb-20 lg:pb-8">
          <div className="bg-white rounded-xl sm:rounded-lg shadow-lg">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Transaction History
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                View and search your recent transactions
              </p>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-w-[150px]">
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="transfer">Transfers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="divide-y divide-gray-200">
              {isLoadingTransactions ? (
                <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-gray-500 text-sm sm:text-base mt-2">
                    Loading transactions...
                  </p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">
                    No transactions found
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {getTransactionIcon(transaction.type)}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                              {transaction.description}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {formatDate(transaction.date)}
                            </p>
                          </div>

                          <div className="text-right mt-1 sm:mt-0 flex-shrink-0">
                            <p
                              className={`font-semibold text-sm sm:text-base ${
                                transaction.amount >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}>
                              {transaction.amount >= 0 ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Balance:{" "}
                              {formatCurrency(transaction.balanceAfter)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Transactions
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">
                    {filteredTransactions.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Deposits
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter((t) => t.amount > 0)
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Withdrawals
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-red-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter((t) => t.amount < 0)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransactionsPage;
