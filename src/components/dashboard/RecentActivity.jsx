import React from "react";
import {
  FaCoffee,
  FaLeaf,
  FaUtensils,
  FaPalette,
  FaPlane,
  FaGem,
} from "react-icons/fa";

const RecentActivity = ({ user }) => {
  // Sort transactions by date (newest first) and take the first 6
  const recentTransactions =
    user?.transactions
      ?.sort((a, b) => new Date(b.date) - new Date(a.date))
      ?.slice(0, 6) || [];

  const getTransactionIcon = (description) => {
    const iconMap = {
      coffee: FaCoffee,
      starbucks: FaCoffee,
      restaurant: FaUtensils,
      dining: FaUtensils,
      travel: FaPlane,
      flight: FaPlane,
      art: FaPalette,
      jewelry: FaGem,
      eco: FaLeaf,
      green: FaLeaf,
    };

    const lowerDesc = description.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerDesc.includes(key)) {
        return icon;
      }
    }
    return FaCoffee; // Default icon
  };

  const getTransactionStatus = (transaction) => {
    if (transaction.status === "failed") {
      return "✗ Failed";
    }
    return transaction.amount > 0 ? "✓ Received" : "✓ Completed";
  };

  const getTransactionBg = (transaction) => {
    if (transaction.status === "failed") {
      return "from-orange-50 to-yellow-50";
    }
    return transaction.amount > 0
      ? "from-green-50 to-emerald-50"
      : "from-red-50 to-pink-50";
  };

  const getTransactionColor = (transaction) => {
    if (transaction.status === "failed") {
      return "from-orange-500 to-yellow-600";
    }
    return transaction.amount > 0
      ? "from-green-500 to-emerald-600"
      : "from-red-500 to-pink-600";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentTransactions.map((transaction, index) => {
          const IconComponent = getTransactionIcon(transaction.description);
          return (
            <div
              key={transaction.id || index}
              className={`flex items-center justify-between p-3 bg-gradient-to-r ${getTransactionBg(
                transaction
              )} rounded-lg hover:scale-102 transition-transform duration-200`}>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${getTransactionColor(
                    transaction
                  )} rounded-lg flex items-center justify-center shadow-lg`}>
                  <IconComponent className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {transaction.description}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      transaction.status === "failed"
                        ? "text-orange-600"
                        : transaction.amount > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                    }`}>
                    {getTransactionStatus(transaction)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    transaction.status === "failed"
                      ? "text-orange-600"
                      : transaction.amount > 0
                        ? "text-green-600"
                        : "text-gray-800"
                  }`}>
                  {transaction.status === "failed"
                    ? "FAILED"
                    : `${transaction.amount > 0 ? "+" : ""}$${Math.abs(
                        transaction.amount
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {recentTransactions.length === 0 && (
        <div className="text-center py-8">
          <FaCoffee className="mx-auto text-gray-300 text-3xl mb-3" />
          <p className="text-gray-500 text-sm">No recent transactions</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
