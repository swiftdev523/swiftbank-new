import React, { useState, useRef } from "react";
import {
  FaEye,
  FaCopy,
  FaQrcode,
  FaExchangeAlt,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";
import clbg7 from "../../assets/images/clbg7.jpg";

const AccountCard = ({ account, isPrimary = false, onAction }) => {
  const { user } = useAuth();
  const { settings } = useWebsiteSettings();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const dropdownRef = useRef(null);

  // Provide default values to prevent undefined errors and ensure proper types
  const safeAccount = {
    accountNumber: "****5678",
    accountType: "checking",
    balance: 0,
    ...account,
  };

  // Ensure balance is properly converted to number
  safeAccount.balance =
    typeof safeAccount.balance === "number"
      ? safeAccount.balance
      : parseFloat(safeAccount.balance) || 0;

  // Helper function to format account type display name
  const formatAccountType = (accountType) => {
    if (!accountType) return "Checking";

    const typeMap = {
      primary: "Primary Account",
      savings: "Savings Account",
      checking: "Checking Account",
      business: "Business Account",
      investment: "Investment Account",
    };

    return (
      typeMap[accountType.toLowerCase()] ||
      accountType.charAt(0).toUpperCase() + accountType.slice(1) + " Account"
    );
  };

  const bankingDetails = {
    routingNumber: "021000021",
    accountNumber: safeAccount.accountNumber || "****5678",
    accountType: formatAccountType(safeAccount.accountType),
    bankName: settings?.bankName || "Swift Bank",
    branchCode: "SWIFTUS33",
    swiftCode: "SWIFTUS33XXX",
  };

  const formatBalance = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankingDetails.accountNumber);
    alert("Account number copied to clipboard");
  };

  const handleShowQR = () => {
    alert(
      "QR Code feature will open your account details for easy sharing with trusted services."
    );
  };

  return (
    <div className="relative mb-3 sm:mb-4 w-full h-full">
      <div
        className="relative rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg transform hover:scale-[1.01] transition-all duration-200 overflow-hidden border border-white/20 hover:border-white/30 w-full h-full"
        style={{
          backgroundImage: `url(${clbg7})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}>
        {/* Softer overlay for better readability but less contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-blue-800/50 to-purple-800/60"></div>

        {/* Reduced additional overlay */}
        <div className="absolute inset-0 bg-black/15"></div>

        {/* Subtle glass morphism layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-xl sm:rounded-2xl"></div>

        {/* Minimized background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"></div>
        </div>

        {/* Subtle glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-black/5 rounded-xl sm:rounded-2xl backdrop-blur-sm"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4 sm:mb-5">
            {/* Simplified Account Type & Number Component */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="group flex items-center space-x-3 hover:bg-white/5 rounded-lg p-2 transition-all duration-200 cursor-pointer">
                {/* Left side: Account Type & Number */}
                <div className="flex flex-col space-y-1">
                  {/* Account Type - simplified */}
                  <span className="text-sm font-medium text-white/90 drop-shadow-sm">
                    {formatAccountType(safeAccount.accountType)}
                  </span>

                  {/* Account Number - cleaner design */}
                  <span className="text-xs text-white/70 font-mono tracking-wider">
                    •••• {safeAccount.accountNumber.toString().slice(-4)}
                  </span>
                </div>

                {/* Right side: Simple Dropdown Arrow */}
                <span
                  className={`text-xs text-white/60 hover:text-white/80 transition-all duration-200 ${
                    showAccountDropdown ? "rotate-180" : ""
                  }`}>
                  ▼
                </span>
              </button>

              {showAccountDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-800 text-sm">
                      Account Details
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatAccountType(safeAccount.accountType)}
                    </p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">
                        Full Account:
                      </span>
                      <span className="text-xs font-mono text-gray-800">
                        {bankingDetails.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Routing:</span>
                      <span className="text-xs font-mono text-gray-800">
                        {bankingDetails.routingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Type:</span>
                      <span className="text-xs text-gray-800">
                        {bankingDetails.accountType}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 flex space-x-2">
                    <button
                      onClick={handleCopyAccount}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1">
                      <FaCopy className="text-xs" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handleShowQR}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1">
                      <FaQrcode className="text-xs" />
                      <span>QR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 sm:mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium drop-shadow-lg bg-black/15 inline-block px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-sm font-sans">
                Available Balance
              </p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-lg transition-all duration-200 bg-black/20 border border-white/20 backdrop-blur-sm shadow-md hover:shadow-lg">
                <FaEye
                  className={`text-white text-sm transition-all duration-200 drop-shadow-md ${
                    showBalance ? "opacity-100 scale-105" : "opacity-70"
                  }`}
                />
              </button>
            </div>
            <div className="bg-black/15 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <p
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg leading-tight text-center font-display"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.1)",
                  letterSpacing: "-0.01em",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}>
                {showBalance ? formatBalance(safeAccount.balance) : "••••••••"}
              </p>
            </div>
          </div>

          {/* Simplified Transaction Actions */}
          {onAction && (
            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => onAction("transfer", safeAccount)}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/90 hover:text-white text-xs py-3 px-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1.5 border border-white/20 hover:border-blue-300/40 hover:shadow-sm font-medium">
                <FaExchangeAlt className="text-sm group-hover:text-blue-300 transition-colors duration-200" />
                <span className="text-xs font-medium">Transfer</span>
              </button>
              <button
                onClick={() => onAction("deposit", safeAccount)}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/90 hover:text-white text-xs py-3 px-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1.5 border border-white/20 hover:border-green-300/40 hover:shadow-sm font-medium">
                <FaPlus className="text-sm group-hover:text-green-300 transition-colors duration-200" />
                <span className="text-xs font-medium">Deposit</span>
              </button>
              <button
                onClick={() => onAction("withdraw", safeAccount)}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/90 hover:text-white text-xs py-3 px-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1.5 border border-white/20 hover:border-red-300/40 hover:shadow-sm font-medium">
                <FaMinus className="text-sm group-hover:text-red-300 transition-colors duration-200" />
                <span className="text-xs font-medium">Withdraw</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
