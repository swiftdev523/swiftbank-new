import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import firestoreService from "../../services/firestoreService";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaSave,
  FaPlus,
} from "react-icons/fa";
import {
  normalizeTransactionArray,
  filterTransactions,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  formatTransactionAmount,
} from "../../utils/transactionUtils";

const EditableTransactionManagement = () => {
  const { user } = useAuth(); // Get current authenticated admin user
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: 0,
    date: "",
    status: "pending",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    type: "deposit",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Load transactions for admin's assigned customers only
  useEffect(() => {
    const loadAdminSpecificTransactions = async () => {
      try {
        setIsLoading(true);

        // Get the current admin user's UID
        if (!user || !user.uid) {
          console.error("❌ No current admin user found");
          setTransactions([]);
          setFilteredTransactions([]);
          return;
        }

        console.log("✅ Loading transactions for admin:", user.uid);

        // Find admin assignments where this admin is the adminId
        const assignmentsSnapshot =
          await firestoreService.list("adminAssignments");
        const adminAssignments = assignmentsSnapshot.filter(
          (assignment) =>
            assignment.adminId === user.uid && assignment.isActive !== false
        );

        if (adminAssignments.length === 0) {
          console.log("⚠️ No customers assigned to this admin");
          setTransactions([]);
          setFilteredTransactions([]);
          return;
        }

        // Get the assigned customers
        const assignedCustomerIds = adminAssignments.map((a) => a.customerId);
        console.log("🔗 Assigned customer IDs:", assignedCustomerIds);

        // Load all transactions and filter for assigned customers
        const allTransactions =
          await firestoreService.getAllTransactionsForAdmin(1000);
        const adminSpecificTransactions = allTransactions.filter(
          (transaction) => {
            // Check if transaction belongs to any of the assigned customers
            return (
              assignedCustomerIds.includes(transaction.userId) ||
              assignedCustomerIds.includes(transaction.fromUserId) ||
              assignedCustomerIds.includes(transaction.toUserId)
            );
          }
        );

        if (adminSpecificTransactions.length > 0) {
          const normalized = normalizeTransactionArray(
            adminSpecificTransactions,
            {
              includeUserInfo: true,
              includeAccountInfo: true,
              defaultStatus: "completed",
            }
          );
          setTransactions(normalized);
          setFilteredTransactions(normalized);
          console.log(
            `✅ Loaded ${adminSpecificTransactions.length} transactions for assigned customers`
          );
        } else {
          setTransactions([]);
          setFilteredTransactions([]);
        }
      } catch (error) {
        console.error("❌ Error loading admin transactions:", error);
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAdminSpecificTransactions();
  }, [user?.uid]); // Re-load when admin user changes

  // Filter transactions using standardized utility
  useEffect(() => {
    const filtered = filterTransactions(
      transactions,
      searchTerm,
      filterType,
      dateRange
    );
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, dateRange]);

  // Utility functions
  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit":
        return <FaArrowDown className="text-green-400" />;
      case "withdrawal":
        return <FaArrowUp className="text-red-400" />;
      case "transfer":
        return <FaExchangeAlt className="text-blue-400" />;
      default:
        return <FaExchangeAlt className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "border-green-500/30 bg-green-500/20 text-green-300";
      case "pending":
        return "border-yellow-500/30 bg-yellow-500/20 text-yellow-300";
      case "processing":
        return "border-blue-500/30 bg-blue-500/20 text-blue-300";
      case "failed":
        return "border-red-500/30 bg-red-500/20 text-red-300";
      default:
        return "border-gray-500/30 bg-gray-500/20 text-gray-300";
    }
  };

  // Date formatting helpers
  const formatDate = (d) => {
    try {
      const date = d instanceof Date ? d : new Date(d);
      return date.toLocaleDateString();
    } catch {
      return String(d);
    }
  };

  const toDateInputValue = (d) => {
    try {
      const date = d instanceof Date ? d : new Date(d);
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Edit functions
  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      amount: transaction.amount,
      date: toDateInputValue(transaction.date),
      status: transaction.status,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      description: "",
      amount: 0,
      date: "",
      status: "pending",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const saveEdit = async (id) => {
    try {
      // optimistic UI update
      setTransactions((prev) =>
        prev.map((txn) => (txn.id === id ? { ...txn, ...editForm } : txn))
      );
      setEditingId(null);
      setSuccessMessage("Transaction updated successfully");

      // persist to Firestore
      const updates = {
        description: editForm.description,
        amount: Number(editForm.amount) || 0,
        status: editForm.status,
        // keep a client-visible date string; serverTimestamp handled by service's updatedAt
        date: editForm.date,
      };
      await firestoreService.update("transactions", id, updates);
    } catch (e) {
      console.error("Failed to update transaction:", e);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      // optimistic UI remove; subscription will also reflect deletion
      setTransactions((prev) => prev.filter((txn) => txn.id !== id));
      await firestoreService.delete("transactions", id);
      setSuccessMessage("Transaction deleted successfully");
    } catch (e) {
      console.error("Failed to delete transaction:", e);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Add transaction
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const addTransaction = async () => {
    try {
      const payload = {
        type: newTransaction.type,
        description: newTransaction.description,
        amount: Number(newTransaction.amount) || 0,
        status: "pending",
        date: newTransaction.date, // keep user-friendly date; serverTimestamp stored by service in createdAt/updatedAt
      };
      await firestoreService.create("transactions", payload);
      setShowAddModal(false);
      setNewTransaction({
        description: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        type: "deposit",
      });
      setSuccessMessage("Transaction added successfully");
    } catch (e) {
      console.error("Failed to add transaction:", e);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Render add transaction modal
  const AddTransactionModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Add New Transaction
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-white p-1">
              <FaTimes className="text-lg" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-white text-sm mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={newTransaction.description}
                onChange={handleAddChange}
                placeholder="Enter transaction description"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-white text-sm mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleAddChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Type</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleAddChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base">
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleAddChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base">
                Cancel
              </button>
              <button
                onClick={addTransaction}
                className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-all text-sm sm:text-base">
                <FaSave className="mr-2 text-sm" />
                <span>Save Transaction</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
            Transaction Management
          </h2>
          <p className="text-blue-200 text-sm sm:text-base">
            Monitor and manage all transactions
          </p>
        </div>
        <button
          onClick={() => {
            setNewTransaction({
              description: "",
              amount: 0,
              date: new Date().toISOString().split("T")[0],
              type: "deposit",
            });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-300 self-start sm:self-auto">
          <FaPlus className="text-sm sm:text-base" />
          <span className="text-sm sm:text-base font-medium">
            Add Transaction
          </span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg p-4">
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base">
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Display */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 sm:h-64">
            <div className="text-white text-sm sm:text-base">
              Loading transactions...
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <FaExchangeAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <div className="text-white text-lg mb-2">No transactions found</div>
            <div className="text-gray-400 text-sm">
              {searchTerm || filterType !== "all" || dateRange !== "all"
                ? "Try adjusting your filters to see more results"
                : "Add your first transaction to get started"}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {transaction.id}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {typeof transaction.userName === "object"
                              ? transaction.userName?.name ||
                                transaction.userName?.firstName +
                                  " " +
                                  transaction.userName?.lastName ||
                                "Unknown"
                              : transaction.userName || "Unknown"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold text-sm">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(
                            transaction.status
                          )}`}>
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    {editingId === transaction.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">
                              Amount
                            </label>
                            <input
                              type="number"
                              name="amount"
                              value={editForm.amount}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">
                              Status
                            </label>
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white text-sm">
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="processing">Processing</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-gray-300 text-sm">
                          {typeof transaction.description === "object"
                            ? JSON.stringify(transaction.description)
                            : transaction.description || "No description"}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {typeof transaction.fromAccount === "object"
                            ? transaction.fromAccount?.accountNumber ||
                              transaction.fromAccount?.accountName ||
                              "Unknown"
                            : transaction.fromAccount || "Unknown"}{" "}
                          →{" "}
                          {typeof transaction.toAccount === "object"
                            ? transaction.toAccount?.accountNumber ||
                              transaction.toAccount?.accountName ||
                              "Unknown"
                            : transaction.toAccount || "Unknown"}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {formatDate(transaction.date)} •{" "}
                          {typeof transaction.time === "object"
                            ? JSON.stringify(transaction.time)
                            : transaction.time || ""}
                        </div>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-white/10">
                      {editingId === transaction.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(transaction.id)}
                            className="flex items-center space-x-1 px-3 py-2 text-green-400 hover:text-green-300 hover:bg-white/10 rounded text-sm transition-all">
                            <FaSave className="text-xs" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center space-x-1 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded text-sm transition-all">
                            <FaTimes className="text-xs" />
                            <span>Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(transaction)}
                            className="flex items-center space-x-1 px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded text-sm transition-all">
                            <FaEdit className="text-xs" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="flex items-center space-x-1 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded text-sm transition-all">
                            <FaTrash className="text-xs" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-white/5 transition-colors">
                        {/* Transaction ID & Description */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getTypeIcon(transaction.type)}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {transaction.id}
                              </div>
                              {editingId === transaction.id ? (
                                <input
                                  type="text"
                                  name="description"
                                  value={editForm.description}
                                  onChange={handleEditChange}
                                  className="mt-1 w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-sm"
                                />
                              ) : (
                                <div className="text-gray-400 text-sm">
                                  {typeof transaction.description === "object"
                                    ? JSON.stringify(transaction.description)
                                    : transaction.description ||
                                      "No description"}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="text-white">
                            {typeof transaction.userName === "object"
                              ? transaction.userName?.name ||
                                transaction.userName?.firstName +
                                  " " +
                                  transaction.userName?.lastName ||
                                "Unknown"
                              : transaction.userName || "Unknown"}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {typeof transaction.fromAccount === "object"
                              ? transaction.fromAccount?.accountNumber ||
                                transaction.fromAccount?.accountName ||
                                "Unknown"
                              : transaction.fromAccount || "Unknown"}{" "}
                            →{" "}
                            {typeof transaction.toAccount === "object"
                              ? transaction.toAccount?.accountNumber ||
                                transaction.toAccount?.accountName ||
                                "Unknown"
                              : transaction.toAccount || "Unknown"}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          {editingId === transaction.id ? (
                            <input
                              type="number"
                              name="amount"
                              value={editForm.amount}
                              onChange={handleEditChange}
                              className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-white"
                            />
                          ) : (
                            <div className="text-white font-semibold">
                              {formatCurrency(transaction.amount)}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {editingId === transaction.id ? (
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                              className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-white">
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="processing">Processing</option>
                              <option value="failed">Failed</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                                transaction.status
                              )}`}>
                              {transaction.status.charAt(0).toUpperCase() +
                                transaction.status.slice(1)}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          {editingId === transaction.id ? (
                            <input
                              type="date"
                              name="date"
                              value={editForm.date}
                              onChange={handleEditChange}
                              className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-white"
                            />
                          ) : (
                            <div className="text-white">
                              <div>{formatDate(transaction.date)}</div>
                              <div className="text-gray-400 text-sm">
                                {typeof transaction.time === "object"
                                  ? JSON.stringify(transaction.time)
                                  : transaction.time || ""}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {editingId === transaction.id ? (
                              <>
                                <button
                                  onClick={() => saveEdit(transaction.id)}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-white/10 rounded transition-all">
                                  <FaSave />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all">
                                  <FaTimes />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(transaction)}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded transition-all">
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteTransaction(transaction.id)
                                  }
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all">
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && <AddTransactionModal />}
    </div>
  );
};

export default EditableTransactionManagement;
