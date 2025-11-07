import React from "react";
import {
  FaInfoCircle,
  FaFileAlt,
  FaCalculator,
  FaGlobe,
  FaMobile,
  FaShieldAlt,
  FaPhone,
  FaCreditCard,
  FaDownload,
  FaCopy,
} from "react-icons/fa";

const BankingInformation = ({
  bankingDetails,
  statements,
  handleBankingService,
  showNotification,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100/50 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaInfoCircle className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Banking Information
          </h3>
        </div>
        <button
          onClick={() => handleBankingService("account-details")}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Account Information */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-800 text-base mb-3">
            Account Details
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account Type:</span>
              <span className="text-sm font-medium text-gray-800">
                {bankingDetails.accountType}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Routing Number:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-gray-800">
                  {bankingDetails.routingNumber}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(bankingDetails.routingNumber);
                    showNotification(
                      "Copied!",
                      "Routing number copied to clipboard",
                      "success",
                      FaCopy
                    );
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors">
                  <FaCopy className="text-xs" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account Number:</span>
              <span className="text-sm font-mono text-gray-800">
                {bankingDetails.accountNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">SWIFT Code:</span>
              <span className="text-sm font-mono text-gray-800">
                {bankingDetails.swiftCode}
              </span>
            </div>
          </div>
        </div>

        {/* Limits & Fees */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-800 text-base mb-3">
            Limits & Fees
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Withdrawal:</span>
              <span className="text-sm font-medium text-gray-800">
                ${bankingDetails.dailyWithdrawalLimit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Purchase:</span>
              <span className="text-sm font-medium text-gray-800">
                ${bankingDetails.dailyPurchaseLimit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Fee:</span>
              <span className="text-sm font-medium text-green-600">
                {bankingDetails.monthlyFee === 0
                  ? "FREE"
                  : `$${bankingDetails.monthlyFee}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Interest Rate:</span>
              <span className="text-sm font-medium text-gray-800">
                {(bankingDetails.interestRate * 100).toFixed(2)}% APY
              </span>
            </div>
          </div>
        </div>

        {/* Security & Features */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-800 text-base mb-3">
            Security & Features
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">FDIC Insured:</span>
              <span className="text-sm font-medium text-green-600">
                ✓ $250K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">2FA Enabled:</span>
              <span className="text-sm font-medium text-green-600">
                ✓ Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fraud Protection:</span>
              <span className="text-sm font-medium text-green-600">✓ 24/7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mobile Banking:</span>
              <span className="text-sm font-medium text-green-600">
                ✓ Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Statements */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-base">
            Recent Statements
          </h4>
          <button
            onClick={() => handleBankingService("statements")}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statements.map((statement, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-800 text-sm">
                  {statement.month}
                </h5>
                <button
                  onClick={() =>
                    showNotification(
                      `${statement.month} Statement`,
                      `Statement for ${statement.month} would be downloaded as a PDF. This feature includes all transactions, fees, interest earned, and account summaries for the month.`,
                      "info",
                      FaDownload
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 transition-colors">
                  <FaDownload className="text-sm" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ending Balance:</span>
                  <span className="font-medium text-gray-800">
                    ${(statement.endingBalance / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium text-gray-800">
                    {statement.transactions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest:</span>
                  <span className="font-medium text-green-600">
                    +${statement.interest.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BankingInformation;
