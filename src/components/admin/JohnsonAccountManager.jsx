import React, { useState, useEffect } from "react";
import { firestoreService } from "../../services/firestoreService";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../common/ConfirmationModal";

const JohnsonAccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAccount, setEditingAccount] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all accounts from Firestore
      const accountsData = await firestoreService.getAllDocuments("accounts");

      // Sort accounts by type (primary first)
      const sortedAccounts = accountsData.sort((a, b) => {
        const order = { primary: 1, savings: 2, checking: 3 };
        return (order[a.accountType] || 999) - (order[b.accountType] || 999);
      });

      setAccounts(sortedAccounts);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount({ ...account });
  };

  const handleSaveAccount = async () => {
    if (!editingAccount) return;

    try {
      setLoading(true);

      const updateData = {
        ...editingAccount,
        updatedAt: new Date(),
      };

      await firestoreService.updateDocument(
        "accounts",
        editingAccount.id,
        updateData
      );

      // Update local state
      setAccounts(
        accounts.map((acc) => (acc.id === editingAccount.id ? updateData : acc))
      );

      setEditingAccount(null);
      setError("");
    } catch (err) {
      console.error("Error saving account:", err);
      setError("Failed to save account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!editingAccount) return;

    setEditingAccount({
      ...editingAccount,
      [field]: value,
    });
  };

  const handleArrayFieldChange = (field, values) => {
    if (!editingAccount) return;

    const arrayValues =
      typeof values === "string"
        ? values
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v)
        : values;

    setEditingAccount({
      ...editingAccount,
      [field]: arrayValues,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatAccountNumber = (prefix, suffix, full) => {
    if (suffix) return `${prefix || "****"}${suffix}`;
    if (full) return `****${full.slice(-4)}`;
    return "Not set";
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Johnson Boseman Account Management
        </h1>
        <p className="text-gray-600">
          Manage all account details, balances, and settings for Johnson
          Boseman's accounts
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Account Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {account.displayName || account.accountName}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {account.accountType} Account
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    account.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {account.status}
                </span>
              </div>

              {/* Account Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">
                    {formatAccountNumber(
                      account.accountNumberPrefix,
                      account.accountNumberSuffix,
                      account.accountNumber
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(account.balance)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Interest Rate</p>
                    <p className="font-medium">{account.interestRate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Fee</p>
                    <p className="font-medium">
                      {formatCurrency(account.monthlyFee)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Features</p>
                  <p className="text-sm">
                    {account.features?.length || 0} features configured
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditAccount(account)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Account
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit {editingAccount.displayName}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editingAccount.displayName || ""}
                      onChange={(e) =>
                        handleFieldChange("displayName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={editingAccount.accountName || ""}
                      onChange={(e) =>
                        handleFieldChange("accountName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nickname
                    </label>
                    <input
                      type="text"
                      value={editingAccount.nickname || ""}
                      onChange={(e) =>
                        handleFieldChange("nickname", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingAccount.description || ""}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Financial Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Financial Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Balance ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAccount.balance || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "balance",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAccount.interestRate || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "interestRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Fee ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAccount.monthlyFee || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "monthlyFee",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Balance ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAccount.minimumBalance || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "minimumBalance",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Account Numbers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Numbers
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number Suffix (last 4 digits)
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      value={editingAccount.accountNumberSuffix || ""}
                      onChange={(e) =>
                        handleFieldChange("accountNumberSuffix", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={editingAccount.routingNumber || ""}
                      onChange={(e) =>
                        handleFieldChange("routingNumber", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Limits and Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Limits & Settings
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Withdrawal Limit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAccount.dailyWithdrawalLimit || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "dailyWithdrawalLimit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Transfer Limit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAccount.dailyTransferLimit || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "dailyTransferLimit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editingAccount.status || "active"}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Features
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Features (comma-separated)
                    </label>
                    <textarea
                      value={editingAccount.features?.join(", ") || ""}
                      onChange={(e) =>
                        handleArrayFieldChange("features", e.target.value)
                      }
                      rows={3}
                      placeholder="Online Banking, Mobile Banking, ATM Access, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Benefits (comma-separated)
                    </label>
                    <textarea
                      value={editingAccount.benefits?.join(", ") || ""}
                      onChange={(e) =>
                        handleArrayFieldChange("benefits", e.target.value)
                      }
                      rows={3}
                      placeholder="No monthly fees, Free ATM withdrawals, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingAccount(null)}
                  className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveAccount}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={confirmationConfig.onConfirm}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          confirmText={confirmationConfig.confirmText}
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default JohnsonAccountManager;
