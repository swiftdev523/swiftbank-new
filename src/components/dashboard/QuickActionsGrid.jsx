import React, { useState } from "react";
import {
  FaInfoCircle,
  FaFileAlt,
  FaCalculator,
  FaGlobe,
  FaMobile,
  FaShieldAlt,
  FaPhone,
  FaStar,
  FaCog,
  FaPaperPlane,
  FaDownload,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { FaCreditCard as FaDebitCard } from "react-icons/fa";
import CustomNotification from "../common/CustomNotification";

const QuickActionsGrid = ({ handleBankingService, onAction }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    messageId: null,
    title: "Unable to perform this action",
    message: "Contact the bank for further assistance",
  });

  const shortcuts = [
    {
      name: "Send Money",
      icon: FaPaperPlane,
      color: "bg-blue-100 text-blue-600",
      action: "send-money",
      priority: true,
    },
    {
      name: "Receive Money",
      icon: FaDownload,
      color: "bg-green-100 text-green-600",
      action: "receive-money",
      priority: true,
    },
    {
      name: "Deposit",
      icon: FaPlus,
      color: "bg-emerald-100 text-emerald-600",
      action: "deposit",
      priority: true,
    },
    {
      name: "Withdraw",
      icon: FaMinus,
      color: "bg-red-100 text-red-600",
      action: "withdraw",
      priority: true,
    },
    {
      name: "Bill Pay",
      icon: FaCalculator,
      color: "bg-orange-100 text-orange-600",
      action: "bill-pay",
    },
    {
      name: "Wire Transfer",
      icon: FaGlobe,
      color: "bg-indigo-100 text-indigo-600",
      action: "wire-transfer",
    },
    {
      name: "Mobile Deposit",
      icon: FaMobile,
      color: "bg-cyan-100 text-cyan-600",
      action: "mobile-deposit",
    },
    {
      name: "Card Controls",
      icon: FaDebitCard,
      color: "bg-pink-100 text-pink-600",
      action: "card-controls",
    },
    {
      name: "Account Details",
      icon: FaInfoCircle,
      color: "bg-gray-100 text-gray-600",
      action: "account-details",
    },
    {
      name: "Statements",
      icon: FaFileAlt,
      color: "bg-slate-100 text-slate-600",
      action: "statements",
    },
    {
      name: "Security Center",
      icon: FaShieldAlt,
      color: "bg-amber-100 text-amber-600",
      action: "security",
    },
  ];

  // Actions that should show the custom notification
  const restrictedActions = [
    "send-money",
    "deposit",
    "withdraw",
    "bill-pay",
    "wire-transfer",
    "mobile-deposit",
    "card-controls",
  ];

  const handleQuickAction = (action) => {
    if (restrictedActions.includes(action)) {
      // Show custom notification for restricted actions using message IDs
      const actionToMessageMap = {
        "send-money": "transferUnavailable",
        deposit: "depositUnavailable",
        withdraw: "withdrawalUnavailable",
        "bill-pay": "billPayUnavailable",
        "wire-transfer": "wireTransferUnavailable",
        "mobile-deposit": "mobileDepositUnavailable",
        "card-controls": "cardControlsUnavailable",
      };

      const messageId = actionToMessageMap[action];
      setNotificationConfig({
        messageId: messageId,
        title: "Service Unavailable",
        message:
          "Unable to perform this action. Contact the bank for further assistance.",
      });
      setShowNotification(true);
    } else if (onAction) {
      // For dashboard overview - map action names to modal types
      const actionToModalMap = {
        "send-money": "transfer",
        "receive-money": "receive",
        deposit: "deposit",
        withdraw: "withdraw",
      };
      const modalType = actionToModalMap[action] || action;
      onAction(modalType);
    } else if (handleBankingService) {
      // For dashboard page - handle banking service info display
      handleBankingService(action);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 sm:p-7 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mr-3">
          <FaPaperPlane className="text-blue-600 text-lg" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-0.5">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-500">
            Perform common banking operations instantly
          </p>
        </div>
      </div>

      {/* Priority Actions - Clean Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {shortcuts
          .filter((shortcut) => shortcut.priority)
          .map((shortcut, index) => (
            <button
              key={shortcut.action + index}
              onClick={() => handleQuickAction(shortcut.action)}
              className="group relative p-4 sm:p-5 bg-blue-50/50 hover:bg-blue-100/70 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] text-blue-700 border border-blue-100/50 hover:border-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:bg-blue-500/15 transition-colors duration-200">
                  <shortcut.icon className="text-xl text-blue-600" />
                </div>
                <h4 className="text-sm font-medium mb-1">{shortcut.name}</h4>
                <p className="text-xs text-blue-600/70">Perform instantly</p>
              </div>
            </button>
          ))}
      </div>

      {/* Secondary Actions - Clean Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3">
        {shortcuts
          .filter((shortcut) => !shortcut.priority)
          .map((shortcut, index) => (
            <button
              key={shortcut.action + index}
              onClick={() => handleQuickAction(shortcut.action)}
              className="group relative p-3 sm:p-4 bg-gray-50/50 hover:bg-gray-100/70 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] border border-gray-100/50 hover:border-gray-200/70">
              <div className="text-center">
                <div
                  className={`w-10 h-10 ${shortcut.color} rounded-lg flex items-center justify-center mb-2.5 mx-auto transition-transform duration-200`}>
                  <shortcut.icon className="text-base" />
                </div>
                <h5 className="text-xs font-medium text-gray-700 mb-0.5">
                  {shortcut.name}
                </h5>
                <p className="text-xs text-gray-500">Banking service</p>
              </div>
            </button>
          ))}
      </div>

      {/* Custom Notification */}
      <CustomNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        title={notificationConfig.title}
        message={notificationConfig.message}
        duration={4000}
      />
    </div>
  );
};

export default QuickActionsGrid;
