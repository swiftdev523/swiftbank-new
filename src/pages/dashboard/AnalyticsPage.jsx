import React from "react";
import { useAuth } from "../../context/AuthContext";
import SpendingAnalyticsWidget from "../../components/dashboard/SpendingAnalyticsWidget";
import FinancialOverview from "../../components/dashboard/FinancialOverview";
import { MdAnalytics, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { FaChartLine, FaChartPie, FaCalendarAlt } from "react-icons/fa";

const AnalyticsPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <MdAnalytics className="mr-3 text-blue-600" />
              Financial Analytics
            </h1>
            <p className="text-gray-600">
              Track your spending patterns and financial trends
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <FaCalendarAlt />
              <span>Custom Range</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total Income",
            value: "$4,250.00",
            change: "+12.5%",
            trend: "up",
            icon: MdTrendingUp,
            color: "green",
          },
          {
            title: "Total Expenses",
            value: "$3,150.00",
            change: "-8.2%",
            trend: "down",
            icon: MdTrendingDown,
            color: "red",
          },
          {
            title: "Net Savings",
            value: "$1,100.00",
            change: "+45.3%",
            trend: "up",
            icon: MdTrendingUp,
            color: "blue",
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {metric.title}
              </h3>
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`text-xl text-${metric.color}-600`} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-800">{metric.value}</p>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      <FinancialOverview accounts={user?.accounts || []} />

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SpendingAnalyticsWidget />

        {/* Spending Categories */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="hidden lg:flex text-xl font-bold text-gray-800 items-center">
              <FaChartPie className="mr-3 text-blue-600" />
              Spending by Category
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
              View Details
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                category: "Food & Dining",
                amount: "$850",
                percentage: 27,
                color: "blue",
              },
              {
                category: "Transportation",
                amount: "$650",
                percentage: 20,
                color: "green",
              },
              {
                category: "Shopping",
                amount: "$540",
                percentage: 17,
                color: "purple",
              },
              {
                category: "Utilities",
                amount: "$420",
                percentage: 13,
                color: "orange",
              },
              {
                category: "Entertainment",
                amount: "$380",
                percentage: 12,
                color: "pink",
              },
              {
                category: "Other",
                amount: "$310",
                percentage: 11,
                color: "gray",
              },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">
                    {item.category}
                  </span>
                  <span className="text-gray-600">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="hidden lg:flex text-xl font-bold text-gray-800 items-center">
            <FaChartLine className="mr-3 text-blue-600" />
            Monthly Trends
          </h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm cursor-pointer">
              Income
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer">
              Expenses
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer">
              Savings
            </button>
          </div>
        </div>

        {/* Simple chart placeholder */}
        <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center border border-blue-100">
          <div className="text-center">
            <FaChartLine className="text-4xl text-blue-400 mb-4 mx-auto" />
            <p className="text-gray-600">
              Interactive chart would be displayed here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Showing income and expense trends over time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
