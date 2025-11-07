import React, { useState } from "react";
import {
  FaChartPie,
  FaShoppingCart,
  FaUtensils,
  FaGasPump,
  FaHome,
  FaGamepad,
  FaMedkit,
  FaEllipsisH,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaArrowRight,
} from "react-icons/fa";

const SpendingAnalyticsWidget = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [showDetails, setShowDetails] = useState(false);

  // Mock spending data - in real app this would come from transaction analysis
  const spendingData = {
    thisMonth: {
      total: 3247.85,
      budget: 4000.0,
      categories: [
        {
          name: "Shopping",
          amount: 892.45,
          percentage: 27.5,
          icon: FaShoppingCart,
          color: "blue",
          trend: "up",
          change: 12.3,
        },
        {
          name: "Dining",
          amount: 456.78,
          percentage: 14.1,
          icon: FaUtensils,
          color: "green",
          trend: "down",
          change: -5.2,
        },
        {
          name: "Gas",
          amount: 234.56,
          percentage: 7.2,
          icon: FaGasPump,
          color: "red",
          trend: "up",
          change: 8.7,
        },
        {
          name: "Bills",
          amount: 1234.5,
          percentage: 38.0,
          icon: FaHome,
          color: "purple",
          trend: "stable",
          change: 0.5,
        },
        {
          name: "Entertainment",
          amount: 189.32,
          percentage: 5.8,
          icon: FaGamepad,
          color: "orange",
          trend: "down",
          change: -15.3,
        },
        {
          name: "Healthcare",
          amount: 125.67,
          percentage: 3.9,
          icon: FaMedkit,
          color: "teal",
          trend: "up",
          change: 23.1,
        },
        {
          name: "Other",
          amount: 114.57,
          percentage: 3.5,
          icon: FaEllipsisH,
          color: "gray",
          trend: "stable",
          change: 1.2,
        },
      ],
    },
  };

  const currentData = spendingData[selectedPeriod];
  const budgetUtilization = (currentData.total / currentData.budget) * 100;
  const remainingBudget = currentData.budget - currentData.total;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <FaArrowUp className="w-3 h-3" />;
      case "down":
        return <FaArrowDown className="w-3 h-3" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTrendColor = (trend, change) => {
    if (trend === "up" && change > 0) return "text-red-600";
    if (trend === "down" && change < 0) return "text-green-600";
    return "text-gray-600";
  };

  const periods = [
    { key: "thisMonth", label: "This Month" },
    { key: "lastMonth", label: "Last Month" },
    { key: "last3Months", label: "3 Months" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <FaChartPie className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Spending Analytics
            </h3>
            <p className="text-sm text-gray-500">Track your expenses</p>
          </div>
        </div>

        {/* Period Selector */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500">
          {periods.map((period) => (
            <option key={period.key} value={period.key}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              ${currentData.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              of ${currentData.budget.toLocaleString()} budget
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-lg font-semibold ${
                remainingBudget > 0 ? "text-green-600" : "text-red-600"
              }`}>
              ${Math.abs(remainingBudget).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {remainingBudget > 0 ? "remaining" : "over budget"}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              budgetUtilization > 100
                ? "bg-red-500"
                : budgetUtilization > 80
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${Math.min(budgetUtilization, 100)}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span
            className={
              budgetUtilization > 100 ? "text-red-600 font-medium" : ""
            }>
            {budgetUtilization.toFixed(1)}% used
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Top Categories */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">
            Top Categories
          </h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium">
            {showDetails ? "Show Less" : "View All"}
          </button>
        </div>

        {currentData.categories
          .slice(0, showDetails ? currentData.categories.length : 4)
          .map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-${category.color}-100 flex items-center justify-center`}>
                    <IconComponent
                      className={`w-4 h-4 text-${category.color}-600`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage}% of spending
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    ${category.amount.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center space-x-1 text-xs ${getTrendColor(category.trend, category.change)}`}>
                    {getTrendIcon(category.trend)}
                    <span>{Math.abs(category.change)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Insights */}
      {showDetails && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            💡 Spending Insights
          </h4>
          <div className="space-y-2 text-xs text-blue-700">
            <p>• You're spending 12% more on shopping this month</p>
            <p>• Great job reducing dining expenses by 5%</p>
            <p>• Consider setting a lower entertainment budget</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-2 cursor-pointer">
          <FaCalendarAlt className="w-4 h-4" />
          <span>Set Monthly Budget</span>
        </button>

        {showDetails && (
          <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-2 cursor-pointer">
            <span>View Detailed Report</span>
            <FaArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SpendingAnalyticsWidget;
