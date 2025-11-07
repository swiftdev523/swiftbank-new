import React from "react";

const AccountBalance = ({
  accountNumber,
  customerName,
  balance,
  accountType = "Checking",
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getBalanceColor = (balance) => {
    if (balance < 0) return "text-red-600";
    if (balance < 100) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {customerName}
          </h2>
          <p className="text-gray-600 text-sm">Account: {accountNumber}</p>
          <p className="text-gray-500 text-sm">{accountType} Account</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Current Balance</p>
          <p className={`text-2xl font-bold ${getBalanceColor(balance)}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Last Updated:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountBalance;
