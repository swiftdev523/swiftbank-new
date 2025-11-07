import React from "react";
import {
  FaCreditCard,
  FaPiggyBank,
  FaBuilding,
  FaChartBar,
} from "react-icons/fa";

const AccountSummary = ({ accounts = [] }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getAccountTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "checking":
        return <FaCreditCard className="text-blue-500" />;
      case "savings":
        return <FaPiggyBank className="text-green-500" />;
      case "credit":
        return <FaBuilding className="text-purple-500" />;
      default:
        return <FaChartBar className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Account Summary</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(getTotalBalance())}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {getAccountTypeIcon(account.type)}
                </span>
                <span className="font-medium text-gray-800">
                  {account.type}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ••{account.accountNumber.slice(-4)}
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(account.balance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Available Balance</p>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No accounts found</p>
        </div>
      )}
    </div>
  );
};

export default AccountSummary;
