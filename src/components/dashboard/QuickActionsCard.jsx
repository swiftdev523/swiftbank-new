import React from "react";
import { FaStar, FaCog } from "react-icons/fa";

const QuickActionsCard = ({ shortcuts, onActionClick }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaStar className="text-white text-sm" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Quick Actions
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
          <FaCog className="text-sm sm:text-base" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            onClick={() => onActionClick(shortcut.action)}
            className="group flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${shortcut.color} flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <shortcut.icon className="text-base sm:text-lg" />
            </div>
            <span className="text-xs text-gray-700 text-center font-medium group-hover:text-gray-900 transition-colors leading-tight">
              {shortcut.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
