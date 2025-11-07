import React, { useState, useEffect } from "react";
import {
  FaExchangeAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaEye,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { MdAccountBalance, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useBankData } from "../../context/BankDataContext";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    dateRange: "",
    minAmount: "",
    maxAmount: "",
    searchTerm: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const { user } = useAuth();
  const { getAllTransactions, updateTransaction, getTransactionStats } =
    useBankData();

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const allTransactions = await getAllTransactions();
        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
      } catch (err) {
        console.error("Error loading transactions:", err);
        setError("Failed to load transactions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [getAllTransactions]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(
        (t) => Math.abs(t.amount) >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(
        (t) => Math.abs(t.amount) <= parseFloat(filters.maxAmount)
      );
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchLower) ||
          t.reference?.toLowerCase().includes(searchLower) ||
          t.userId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "amount") {
        aValue = Math.abs(aValue);
        bValue = Math.abs(bValue);
      }

      if (sortConfig.key === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredTransactions(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "failed":
        return <FaTimesCircle className="text-red-500" />;
      case "cancelled":
        return <FaExclamationTriangle className="text-gray-500" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "transfer":
        return <FaExchangeAlt className="text-blue-500" />;
      case "deposit":
        return <MdTrendingUp className="text-green-500" />;
      case "withdrawal":
        return <MdTrendingDown className="text-red-500" />;
      case "payment":
        return <FaMoneyBillWave className="text-purple-500" />;
      default:
        return <MdAccountBalance className="text-gray-500" />;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdateTransactionStatus = async (transactionId, newStatus) => {
    try {
      await updateTransaction(transactionId, { status: newStatus });

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId ? { ...t, status: newStatus } : t
        )
      );

      // Close modal if open
      if (selectedTransaction?.id === transactionId) {
        setSelectedTransaction(null);
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction Management
            </h2>
            <p className="text-sm text-gray-600">
              Monitor and manage all system transactions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Total: {filteredTransactions.length} transactions
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="transfer">Transfer</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="payment">Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
              }
              placeholder="$0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
              }
              placeholder="$10,000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                placeholder="Search by description, reference, or user ID..."
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  className="text-left p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("date")}>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700">
                      Date
                    </span>
                    {getSortIcon("date")}
                  </div>
                </th>
                <th className="text-left p-3">
                  <span className="text-sm font-medium text-gray-700">
                    Type
                  </span>
                </th>
                <th className="text-left p-3">
                  <span className="text-sm font-medium text-gray-700">
                    Description
                  </span>
                </th>
                <th
                  className="text-left p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("amount")}>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700">
                      Amount
                    </span>
                    {getSortIcon("amount")}
                  </div>
                </th>
                <th className="text-left p-3">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                </th>
                <th className="text-left p-3">
                  <span className="text-sm font-medium text-gray-700">
                    User
                  </span>
                </th>
                <th className="text-left p-3">
                  <span className="text-sm font-medium text-gray-700">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.date || transaction.createdAt)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <span className="text-sm capitalize text-gray-700">
                        {transaction.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description || "No description"}
                    </div>
                    {transaction.reference && (
                      <div className="text-xs text-gray-500">
                        Ref: {transaction.reference}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div
                      className={`text-sm font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {transaction.amount > 0 ? "+" : "-"}
                      {formatAmount(transaction.amount)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <span
                        className={`text-sm capitalize ${
                          transaction.status === "completed"
                            ? "text-green-700"
                            : transaction.status === "pending"
                              ? "text-yellow-700"
                              : transaction.status === "failed"
                                ? "text-red-700"
                                : "text-gray-700"
                        }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-gray-900">
                      {transaction.userId || "Unknown"}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="View Details">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">No transactions found</div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID
                  </label>
                  <div className="text-sm text-gray-900 font-mono">
                    {selectedTransaction.id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <div
                    className={`text-lg font-semibold ${
                      selectedTransaction.amount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                    {selectedTransaction.amount > 0 ? "+" : "-"}
                    {formatAmount(selectedTransaction.amount)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="text-sm capitalize">
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="text-sm capitalize">
                      {selectedTransaction.type}
                    </span>
                  </div>
                </div>

                {selectedTransaction.status === "pending" && (
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateTransactionStatus(
                            selectedTransaction.id,
                            "completed"
                          )
                        }
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateTransactionStatus(
                            selectedTransaction.id,
                            "failed"
                          )
                        }
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
