import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaSearch,
  FaEdit,
  FaSave,
  FaTimes,
  FaDollarSign,
  FaEye,
  FaPlus,
  FaMinus,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import firestoreService from "../../services/firestoreService";

const AdminAccountManagement = () => {
  const { user } = useAuth(); // Get current authenticated admin user
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAccount, setEditingAccount] = useState(null);
  const [newBalance, setNewBalance] = useState("");
  const [editFields, setEditFields] = useState({}); // { [accountId]: { accountName, type, status } }
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});

  // Load accounts and user data
  useEffect(() => {
    loadAccountsData();
  }, [user?.uid]); // Re-load when admin user changes

  const loadAccountsData = async () => {
    try {
      setIsLoading(true);

      // Get the current admin user's UID
      if (!user || !user.uid) {
        console.error("❌ No current admin user found");
        setAccounts([]);
        setFilteredAccounts([]);
        return;
      }

      console.log("✅ Current admin user:", user.uid);

      // Find admin assignments where this admin is the adminId
      const assignmentsSnapshot =
        await firestoreService.list("adminAssignments");
      const adminAssignments = assignmentsSnapshot.filter(
        (assignment) =>
          assignment.adminId === user.uid && assignment.isActive !== false
      );

      if (adminAssignments.length === 0) {
        console.log("⚠️ No customers assigned to this admin");
        setAccounts([]);
        setFilteredAccounts([]);
        return;
      }

      // Get the assigned customers
      const assignedCustomerIds = adminAssignments.map((a) => a.customerId);
      console.log("🔗 Assigned customer IDs:", assignedCustomerIds);

      // Load accounts only for assigned customers
      const allAccounts = await firestoreService.list("accounts");
      const adminSpecificAccounts = allAccounts.filter((account) => {
        const userId = account.userId || account.customerUID;
        return assignedCustomerIds.includes(userId);
      });

      // Load user profiles only for assigned customers
      const allUsers = await firestoreService.list("users");
      const assignedCustomers = allUsers.filter(
        (user) =>
          assignedCustomerIds.includes(user.id) && user.role === "customer"
      );

      const usersMap = {};
      assignedCustomers.forEach((user) => {
        usersMap[user.id] = user;
        usersMap[user.uid] = user; // Also map by uid for backward compatibility
      });

      setAccounts(adminSpecificAccounts);
      setFilteredAccounts(adminSpecificAccounts);
      setUsers(usersMap);

      console.log(
        `✅ Loaded ${adminSpecificAccounts.length} accounts for ${assignedCustomers.length} assigned customers`
      );
    } catch (error) {
      console.error("Error loading accounts:", error);
      showNotification("Error loading accounts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter accounts based on search
  useEffect(() => {
    const filtered = accounts.filter((account) => {
      // Check both userId and customerUID fields for user lookup
      const userId = account.userId || account.customerUID;
      const user = users[userId];
      const userName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.name ||
          user.email
        : "";
      const accountName = account.accountName || account.accountType || "";
      const accountNumber = account.accountNumber || "";

      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountNumber.includes(searchTerm) ||
        (account.type || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts, users]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditBalance = (account) => {
    setEditingAccount(account.id);
    setNewBalance(account.balance.toString());
    setEditFields((prev) => ({
      ...prev,
      [account.id]: {
        accountName: account.accountName || "",
        type: account.type || "checking",
        status: account.status || "active",
      },
    }));
  };

  const handleSaveBalance = async (accountId) => {
    try {
      const balance = parseFloat(newBalance);
      if (isNaN(balance)) {
        showNotification("Invalid balance amount", "error");
        return;
      }

      const meta = editFields[accountId] || {};

      // Prepare update data with proper validation
      const updateData = {
        balance: balance,
        lastTransaction: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add account name if provided
      if (meta.accountName && meta.accountName.trim()) {
        updateData.accountName = meta.accountName.trim();
        updateData.accountType = meta.accountName.trim(); // Also update accountType for compatibility
      }

      // Add type if provided
      if (meta.type) {
        updateData.type = meta.type;
      }

      // Add status if provided
      if (meta.status) {
        updateData.status = meta.status;
        updateData.isActive = meta.status === "active"; // Update isActive flag for compatibility
      }

      console.log("Updating account with data:", updateData);

      await firestoreService.update("accounts", accountId, updateData);

      // Update local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                balance,
                accountName: meta.accountName || acc.accountName,
                accountType: meta.accountName || acc.accountType,
                type: meta.type || acc.type,
                status: meta.status || acc.status,
                isActive: meta.status === "active",
              }
            : acc
        )
      );

      setEditingAccount(null);
      setNewBalance("");
      setEditFields((prev) => {
        const clone = { ...prev };
        delete clone[accountId];
        return clone;
      });
      showNotification("Account updated successfully");
    } catch (error) {
      console.error("Error updating account:", error);
      showNotification(`Error updating account: ${error.message}`, "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setNewBalance("");
  };

  // Function to add missing account
  const addMissingAccount = async () => {
    try {
      const customerUID = "mYFGjRgsARS0AheCdYUkzhMRLkk2"; // John Boseman's UID

      // Generate account number
      const generateAccountNumber = () => {
        return (
          "4" +
          Math.floor(Math.random() * 1000000000000000)
            .toString()
            .padStart(15, "0")
        );
      };

      // Primary Checking Account data
      const primaryCheckingData = {
        accountType: "Primary Checking",
        accountNumber: generateAccountNumber(),
        balance: 15750.5,
        isActive: true,
        createdAt: new Date(),
        lastTransactionDate: new Date(),
        interestRate: 0.01,
        minimumBalance: 100,
        customerUID: customerUID,
        accountStatus: "active",
        accountFeatures: {
          overdraftProtection: true,
          directDeposit: true,
          onlineBanking: true,
          mobileApp: true,
          atmAccess: true,
          checksEnabled: true,
        },
      };

      // Add to Firestore
      await firestoreService.create("accounts", primaryCheckingData);

      // Reload accounts data
      await loadAccountsData();

      showNotification("Primary Checking account added successfully!");
    } catch (error) {
      console.error("Error adding account:", error);
      showNotification("Error adding account", "error");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case "checking":
        return "bg-blue-100 text-blue-800";
      case "savings":
        return "bg-green-100 text-green-800";
      case "credit":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "frozen":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MdAccountBalance className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <MdAccountBalance className="mr-3 text-blue-600" />
              Account Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage customer accounts and balances
            </p>
          </div>
          <button
            onClick={addMissingAccount}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <FaPlus className="text-sm" />
            Add Missing Account
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts by user, account name, number, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <MdAccountBalance className="text-2xl text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Accounts
                </p>
                <p className="text-xl font-bold text-blue-800">
                  {accounts.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaDollarSign className="text-2xl text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Total Value
                </p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(
                    accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaUsers className="text-2xl text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Active Accounts
                </p>
                <p className="text-xl font-bold text-purple-800">
                  {accounts.filter((acc) => acc.status === "active").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-2xl text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Credit Accounts
                </p>
                <p className="text-xl font-bold text-orange-800">
                  {accounts.filter((acc) => acc.type === "credit").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${notification.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
          {notification.message}
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Holder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => {
                const user = users[account.userId];
                const isEditing = editingAccount === account.id;

                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                              user.name ||
                              "Unknown User"
                            : "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {account.accountName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.accountNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.type)}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                          <input
                            type="text"
                            value={editFields[account.id]?.accountName || ""}
                            onChange={(e) =>
                              setEditFields((prev) => ({
                                ...prev,
                                [account.id]: {
                                  ...prev[account.id],
                                  accountName: e.target.value,
                                },
                              }))
                            }
                            className="w-48 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Account name"
                          />
                          <select
                            value={editFields[account.id]?.type || "checking"}
                            onChange={(e) =>
                              setEditFields((prev) => ({
                                ...prev,
                                [account.id]: {
                                  ...prev[account.id],
                                  type: e.target.value,
                                },
                              }))
                            }
                            className="px-2 py-1 border border-gray-300 rounded">
                            <option value="checking">checking</option>
                            <option value="savings">savings</option>
                            <option value="credit">credit</option>
                          </select>
                          <select
                            value={editFields[account.id]?.status || "active"}
                            onChange={(e) =>
                              setEditFields((prev) => ({
                                ...prev,
                                [account.id]: {
                                  ...prev[account.id],
                                  status: e.target.value,
                                },
                              }))
                            }
                            className="px-2 py-1 border border-gray-300 rounded">
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                            <option value="frozen">frozen</option>
                            <option value="closed">closed</option>
                          </select>
                          <button
                            onClick={() => handleSaveBalance(account.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Save">
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Cancel">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-medium ${account.balance < 0 ? "text-red-600" : "text-gray-900"}`}>
                            {formatCurrency(account.balance || 0)}
                          </span>
                          <button
                            onClick={() => handleEditBalance(account)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit Balance">
                            <FaEdit />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="View Details">
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <MdAccountBalance className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No accounts found</p>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccountManagement;
