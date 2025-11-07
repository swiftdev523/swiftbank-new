import React from "react";
import {
  FaChartLine,
  FaCog,
  FaTimes,
  FaLeaf,
  FaStar,
  FaChevronRight,
  FaInfoCircle,
} from "react-icons/fa";
import { MdAnalytics } from "react-icons/md";

const FinancialOverviewCard = ({ expenseCategories }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaChartLine className="text-white text-sm sm:text-base" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-gray-800">
            Financial Overview
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
          <FaCog className="text-sm sm:text-base" />
        </button>
      </div>

      {/* Enhanced Environmental Impact Notice */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-xl"></div>
        <button className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
          <FaTimes className="text-xs sm:text-sm" />
        </button>
        <div className="flex items-start space-x-3 relative z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <FaLeaf className="text-white text-xs sm:text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-emerald-800 mb-1 text-xs sm:text-sm">
              Sustainable Investment Impact!
            </h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your $50M green energy investments have offset 2,500 tons of CO₂
              this quarter.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Expenses Section */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <MdAnalytics className="text-white text-xs sm:text-sm" />
            </div>
            <span className="text-sm sm:text-base font-bold text-gray-800">
              Spending Analytics
            </span>
          </div>
          <button className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
            <FaInfoCircle className="text-xs sm:text-sm" />
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {expenseCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${category.color} shadow-sm`}></div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  ${category.amount.toLocaleString()}
                </span>
                <div className="text-xs text-gray-500">
                  {category.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverviewCard;
