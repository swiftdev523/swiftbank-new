import React, { useState } from "react";
import { useBankData } from "../../context/BankDataContext";
import {
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";

const TransactionHistoryWidget = ({ user }) => {
  const { transactions: hardcodedTransactions } = useBankData();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // Use hardcoded transactions if available, otherwise fall back to user transactions
  const transactions =
    hardcodedTransactions && hardcodedTransactions.length > 0
      ? hardcodedTransactions
      : user?.transactions || [];

  // Filter and search logic
  const filteredTransactions = transactions
    .filter((tx) => {
      if (filterType === "deposit")
        return tx.amount > 0 || tx.type === "credit";
      if (filterType === "withdrawal")
        return tx.amount < 0 || tx.type === "debit";
      return true;
    })
    .filter((tx) =>
      tx.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FaCalendarAlt className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">
            Transaction History
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description..."
            className="px-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 flex items-center space-x-1"
            title="Sort by date">
            {sortOrder === "desc" ? <FaArrowDown /> : <FaArrowUp />}
            <span>Date</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Description
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-700">
                Amount
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-700">
                Balance After
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {tx.description}
                  </td>
                  <td
                    className={`px-4 py-2 whitespace-nowrap text-right font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount > 0 ? "+" : "-"}$
                    {Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-gray-600">
                    ${tx.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistoryWidget;
