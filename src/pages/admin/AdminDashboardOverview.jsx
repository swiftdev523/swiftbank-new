import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaUsers,
  FaDollarSign,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import firestoreService from "../../services/firestoreService";

const AdminDashboardOverview = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalBalance: 0,
    monthlyTransactions: 0,
    userGrowth: 0,
    transactionGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time data from Firestore
  useEffect(() => {
    let usersListener, transactionsListener;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Subscribe to users collection for real-time updates
        usersListener = await firestoreService.subscribeToCollection(
          "users",
          [],
          async (users, error) => {
            if (error) {
              console.error("Error fetching users:", error);
              return;
            }

            if (users) {
              // Calculate total accounts from all users
              const totalAccounts = users.reduce((acc, user) => {
                return acc + (user.accounts?.length || 0);
              }, 0);

              // Calculate total balance from all user accounts
              const totalBalance = users.reduce((acc, user) => {
                if (user.accounts) {
                  return (
                    acc +
                    user.accounts.reduce((accountAcc, account) => {
                      return accountAcc + (parseFloat(account.balance) || 0);
                    }, 0)
                  );
                }
                return acc;
              }, 0);

              setStatsData((prev) => ({
                ...prev,
                totalUsers: users.length,
                totalAccounts,
                totalBalance,
              }));
            }
          }
        );

        // Subscribe to transactions collection for real-time updates
        transactionsListener = await firestoreService.subscribeToCollection(
          "transactions",
          [],
          (transactions, error) => {
            if (error) {
              console.error("Error fetching transactions:", error);
              return;
            }

            if (transactions) {
              // Calculate monthly transactions (last 30 days)
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

              const monthlyTransactions = transactions.filter((transaction) => {
                const transactionDate = transaction.timestamp?.toDate
                  ? transaction.timestamp.toDate()
                  : new Date(transaction.timestamp);
                return transactionDate >= thirtyDaysAgo;
              }).length;

              setStatsData((prev) => ({
                ...prev,
                monthlyTransactions,
                userGrowth: 12.5,
                transactionGrowth: 8.3,
              }));
            }
          }
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up admin dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup listeners on unmount
    return () => {
      if (usersListener) {
        firestoreService.unsubscribe(usersListener);
      }
      if (transactionsListener) {
        firestoreService.unsubscribe(transactionsListener);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? "..." : statsData.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <FaUsers className="text-blue-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-green-400 text-sm" />
            <span className="text-green-400 text-sm ml-1">
              {statsData.userGrowth}%
            </span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Total Accounts
              </p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? "..." : statsData.totalAccounts.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <MdAccountBalance className="text-green-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-green-400 text-sm" />
            <span className="text-green-400 text-sm ml-1">5.2%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Balance</p>
              <p className="text-2xl font-bold text-white">
                {isLoading
                  ? "..."
                  : `$${statsData.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <FaDollarSign className="text-purple-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-green-400 text-sm" />
            <span className="text-green-400 text-sm ml-1">3.8%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Monthly Transactions
              </p>
              <p className="text-2xl font-bold text-white">
                {isLoading
                  ? "..."
                  : statsData.monthlyTransactions.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
              <FaExchangeAlt className="text-orange-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-green-400 text-sm" />
            <span className="text-green-400 text-sm ml-1">
              {statsData.transactionGrowth}%
            </span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors cursor-pointer">
              Create New Account
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors cursor-pointer">
              Process Manual Transaction
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl transition-colors cursor-pointer">
              Generate Report
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl transition-colors cursor-pointer">
              Send System Message
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">
                New user registration: John Doe
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">
                Large transaction flagged: $25,000
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">
                Account balance updated manually
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">
                System maintenance completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
