import React, { useState, useEffect } from "react";
import firestoreService from "../../services/firestoreService";
import { useAuth } from "../../context/AuthContext";
import { generateRealisticTransactions } from "../../utils/transactionGenerator";

const AccountHolderDetails = () => {
  const { user } = useAuth(); // Get current authenticated user
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountType: "checking",
    accountName: "",
    balance: 0,
    currency: "USD",
    interestRate: 0,
    minimumBalance: 0,
  });

  useEffect(() => {
    loadUsers();

    // For real-time updates, we'd need to subscribe to both users and assignments
    // For now, we'll just do the initial load and manual refresh
    // TODO: Implement real-time subscription to assignments and users

    return () => {
      // Cleanup if needed
    };
  }, [user?.uid]); // Re-load when admin user changes

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading users from Firebase...");

      // Get the current admin user's UID
      if (!user || !user.uid) {
        console.error("❌ No current user found");
        console.error("User object:", user);
        setUsers([]);
        return;
      }

      console.log("✅ Current admin user:", user.uid);
      console.log("📧 Current admin email:", user.email);

      // Find admin assignments where this admin is the adminId
      console.log("🔍 Fetching admin assignments...");
      const assignmentsSnapshot =
        await firestoreService.list("adminAssignments");
      console.log("📋 All assignments:", assignmentsSnapshot);

      const adminAssignments = assignmentsSnapshot.filter(
        (assignment) =>
          assignment.adminId === user.uid && assignment.isActive !== false
      );
      console.log("🎯 Admin's assignments:", adminAssignments);

      if (adminAssignments.length === 0) {
        console.log("⚠️ No customers assigned to this admin");
        console.log("Expected adminId:", user.uid);
        console.log(
          "All assignment adminIds:",
          assignmentsSnapshot.map((a) => a.adminId)
        );
        setUsers([]);
        return;
      }

      // Get the assigned customers
      const assignedCustomerIds = adminAssignments.map((a) => a.customerId);
      console.log("🔗 Assigned customer IDs:", assignedCustomerIds);

      // Load all users and filter for assigned customers
      console.log("👥 Loading all users...");
      const allUsers = await firestoreService.list("users");
      console.log("📊 Total users found:", allUsers.length);

      const assignedCustomers = allUsers.filter(
        (user) =>
          assignedCustomerIds.includes(user.id) && user.role === "customer"
      );
      console.log("✅ Assigned customers found:", assignedCustomers);

      // Attach accounts for each customer and ensure all fields have defaults
      const usersWithAccounts = [];
      for (const customer of assignedCustomers) {
        console.log(
          `💳 Loading accounts for customer ${customer.id} (${customer.name})...`
        );
        const accounts = await firestoreService.getAccountsForUser(customer.id);
        console.log(`💰 Accounts for customer ${customer.id}:`, accounts);

        // Ensure all required fields have default values
        const customerWithDefaults = {
          ...customer,
          uid: customer.id,
          accounts,
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          dateOfBirth: customer.dateOfBirth || "",
        };

        usersWithAccounts.push(customerWithDefaults);
      }

      console.log("🏁 Final users with accounts:", usersWithAccounts);
      setUsers(usersWithAccounts);
      if (usersWithAccounts.length > 0) {
        setSelectedUser(usersWithAccounts[0]);
        console.log("✅ Selected first user:", usersWithAccounts[0].name);
      }
    } catch (error) {
      console.error("❌ Error loading users:", error);
      console.error("Error details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      // Ensure no undefined values are sent to Firestore
      const updateData = {
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        name: `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim(),
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
        address: selectedUser.address || "",
        dateOfBirth: selectedUser.dateOfBirth || "",
      };

      await firestoreService.update("users", selectedUser.uid, updateData);

      // Update accounts (balances and basic fields)
      if (selectedUser.accounts && selectedUser.accounts.length > 0) {
        await Promise.all(
          selectedUser.accounts.map(async (account) => {
            try {
              const accountUpdateData = {
                accountType: account.accountType,
                accountNumber: account.accountNumber,
                routingNumber: account.routingNumber,
                balance: Number(account.balance) || 0,
                status: account.status || "active",
                userId: account.userId || selectedUser.uid,
              };

              if (account.id) {
                await firestoreService.update(
                  "accounts",
                  account.id,
                  accountUpdateData
                );
              }
            } catch (error) {
              console.error(`Error updating account ${account.id}:`, error);
            }
          })
        );
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === selectedUser.uid ? { ...user, ...updateData } : user
        )
      );

      setEditMode(false);
      showNotification(
        "Customer information and accounts updated successfully!"
      );
    } catch (error) {
      console.error("Error updating customer:", error);
      showNotification("Failed to update customer information", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (selectedUser) {
      const originalUser = users.find((u) => u.uid === selectedUser.uid);
      if (originalUser) {
        setSelectedUser({ ...originalUser });
      }
    }
    setEditMode(false);
  };

  const updateField = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  const updateAccountField = (accountIndex, field, value) => {
    setSelectedUser((prev) => {
      const updatedAccounts = [...(prev.accounts || [])];
      updatedAccounts[accountIndex] = {
        ...updatedAccounts[accountIndex],
        [field]: value,
      };
      return { ...prev, accounts: updatedAccounts };
    });
  };

  // Generate account number
  const generateAccountNumber = () => {
    const prefix = {
      checking: "3001",
      savings: "2001",
      credit: "4001",
      investment: "5001",
    };
    const accountPrefix = prefix[newAccount.accountType] || "1001";
    const randomSuffix = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");
    return accountPrefix + randomSuffix;
  };

  const handleAddAccount = () => {
    setShowAddAccountModal(true);
    setNewAccount({
      accountType: "checking",
      accountName: "",
      balance: 0,
      currency: "USD",
      interestRate: 0,
      minimumBalance: 0,
    });
  };

  const handleSaveNewAccount = async () => {
    if (!selectedUser || !newAccount.accountName.trim()) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSaving(true);

      const accountData = {
        accountType: newAccount.accountType,
        accountName: newAccount.accountName.trim(),
        accountNumber: generateAccountNumber(),
        customerUID: selectedUser.uid,
        userId: selectedUser.uid,
        balance: Number(newAccount.balance) || 0,
        currency: newAccount.currency,
        status: "active",
        isActive: true,
        interestRate: Number(newAccount.interestRate) || 0,
        minimumBalance: Number(newAccount.minimumBalance) || 0,
        accountFeatures: {
          onlineBanking: true,
          mobileApp: true,
          atmAccess: true,
          overdraftProtection: newAccount.accountType === "checking",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid, // Admin who created the account
      };

      // Add to Firestore
      const newAccountId = await firestoreService.create(
        "accounts",
        accountData
      );

      // Generate realistic transaction history for the account
      const accountBalance = Number(newAccount.balance) || 0;
      if (accountBalance > 0) {
        const accountWithId = { ...accountData, id: newAccountId };
        const transactions = generateRealisticTransactions(
          accountWithId,
          accountBalance
        );

        // Save transactions to Firestore
        const transactionPromises = transactions.map((transaction) =>
          firestoreService.create("transactions", {
            ...transaction,
            accountId: newAccountId,
            fromAccount: newAccountId,
            toAccount: transaction.type === "deposit" ? newAccountId : null,
          })
        );

        await Promise.all(transactionPromises);

        console.log(
          `✅ Generated ${transactions.length} transactions for account ${newAccountId}`
        );
      }

      // Update local state
      const newAccountWithId = { ...accountData, id: newAccountId };
      setSelectedUser((prev) => ({
        ...prev,
        accounts: [...(prev.accounts || []), newAccountWithId],
      }));

      // Update users list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === selectedUser.uid
            ? {
                ...user,
                accounts: [...(user.accounts || []), newAccountWithId],
              }
            : user
        )
      );

      setShowAddAccountModal(false);
      showNotification(
        `New bank account created successfully with ${accountBalance > 0 ? "realistic transaction history" : "no initial balance"}!`
      );
    } catch (error) {
      console.error("Error creating account:", error);
      showNotification("Failed to create account", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAddAccount = () => {
    setShowAddAccountModal(false);
    setNewAccount({
      accountType: "checking",
      accountName: "",
      balance: 0,
      currency: "USD",
      interestRate: 0,
      minimumBalance: 0,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300">
        Loading customer data...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-300">No customers found</div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Select User ({users.length} total)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {users.map((user) => (
            <button
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors truncate ${
                selectedUser?.uid === user.uid
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={
                user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name || user.email || "Unknown User"
              }>
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.name || user.email || "Unknown User"}
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="space-y-6">
          {/* Header with Edit Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="hidden lg:block">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                Account Holder Details
              </h2>
              <p className="text-gray-300 mt-1 text-sm sm:text-base">
                {editMode ? "Editing" : "Viewing"}{" "}
                {selectedUser.firstName && selectedUser.lastName
                  ? `${selectedUser.firstName} ${selectedUser.lastName}'s`
                  : "customer"}{" "}
                information
              </p>
            </div>
            <div className="flex items-center justify-end sm:space-x-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm sm:text-base">
                  <span className="hidden sm:inline">✏️ </span>Edit Details
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base">
                    {saving ? "💾 Saving..." : "💾 Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base">
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`p-4 rounded-lg ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
              <div className="flex items-center">
                {notification.type === "success" ? "✅" : "⚠️"}{" "}
                {notification.message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      First Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={selectedUser.firstName || ""}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {selectedUser.firstName || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Last Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={selectedUser.lastName || ""}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {selectedUser.lastName || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email Address
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={selectedUser.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {selectedUser.email || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={selectedUser.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {selectedUser.phone || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Address
                  </label>
                  {editMode ? (
                    <textarea
                      value={
                        typeof selectedUser.address === "object"
                          ? `${selectedUser.address?.street || ""}\n${selectedUser.address?.city || ""}, ${selectedUser.address?.state || ""} ${selectedUser.address?.zipCode || ""}\n${selectedUser.address?.country || ""}`
                          : selectedUser.address || ""
                      }
                      onChange={(e) => updateField("address", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter address"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {selectedUser.address
                        ? typeof selectedUser.address === "object"
                          ? `${selectedUser.address.street || ""}, ${selectedUser.address.city || ""}, ${selectedUser.address.state || ""} ${selectedUser.address.zipCode || ""}, ${selectedUser.address.country || ""}`
                          : selectedUser.address
                        : "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date of Birth
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      value={selectedUser.dateOfBirth || ""}
                      onChange={(e) =>
                        updateField("dateOfBirth", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {selectedUser.dateOfBirth
                        ? new Date(
                            selectedUser.dateOfBirth
                          ).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Bank Accounts
                </h3>
                <button
                  onClick={handleAddAccount}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  title="Add new bank account">
                  <span className="text-lg">➕</span>
                  Add Account
                </button>
              </div>
              {selectedUser.accounts && selectedUser.accounts.length > 0 ? (
                <div className="space-y-4">
                  {selectedUser.accounts.map((account, index) => (
                    <div
                      key={account.id || index}
                      className="bg-gray-50 p-4 rounded-lg border">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Account Type
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            value={account.accountType || ""}
                            onChange={(e) =>
                              updateAccountField(
                                index,
                                "accountType",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. savings, checking, primary"
                          />
                        ) : (
                          <h4 className="font-medium text-gray-900">
                            {account.accountType || "Bank Account"}
                          </h4>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Account Number
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={account.accountNumber || ""}
                              onChange={(e) =>
                                updateAccountField(
                                  index,
                                  "accountNumber",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter account number"
                            />
                          ) : (
                            <p className="text-gray-600 break-all">
                              {account.accountNumber || "Not provided"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Routing Number
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={account.routingNumber || ""}
                              onChange={(e) =>
                                updateAccountField(
                                  index,
                                  "routingNumber",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter routing number"
                            />
                          ) : (
                            <p className="text-gray-600">
                              {account.routingNumber || "Not provided"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Balance
                          </label>
                          {editMode ? (
                            <input
                              type="number"
                              step="0.01"
                              value={account.balance || ""}
                              onChange={(e) =>
                                updateAccountField(
                                  index,
                                  "balance",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter balance"
                            />
                          ) : (
                            <div className="text-base sm:text-lg font-semibold text-gray-900">
                              $
                              {account.balance
                                ? Number(account.balance).toLocaleString()
                                : "0.00"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No bank accounts found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Bank Account
                </h3>
                <button
                  onClick={handleCancelAddAccount}
                  className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={newAccount.accountType}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        accountType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="checking">Checking Account</option>
                    <option value="savings">Savings Account</option>
                    <option value="credit">Credit Account</option>
                    <option value="investment">Investment Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountName}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        accountName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Primary Checking, High Yield Savings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        balance: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={newAccount.currency}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.interestRate}
                      onChange={(e) =>
                        setNewAccount((prev) => ({
                          ...prev,
                          interestRate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.minimumBalance}
                      onChange={(e) =>
                        setNewAccount((prev) => ({
                          ...prev,
                          minimumBalance: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelAddAccount}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={saving}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewAccount}
                  disabled={saving || !newAccount.accountName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? "Creating..." : "Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountHolderDetails;
