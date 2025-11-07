import React, { useState, useEffect } from "react";
import firestoreService from "../../services/firestoreService";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrash,
  FaCreditCard,
  FaPiggyBank,
  FaUniversity,
  FaBriefcase,
  FaWallet,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";

const AccountTypeManager = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  useEffect(() => {
    loadAccountTypes();
  }, []);

  const loadAccountTypes = async () => {
    try {
      setLoading(true);
      const types = await firestoreService.getCollection("accountTypes");
      setAccountTypes(types || []);
    } catch (error) {
      console.error("Error loading account types:", error);
      setMessage({
        type: "error",
        text: "Failed to load account types. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "primary":
        return <FaWallet className="text-indigo-400" />;
      case "savings":
        return <FaPiggyBank className="text-green-400" />;
      case "current":
        return <FaUniversity className="text-blue-400" />;
      case "checking":
        return <FaCreditCard className="text-blue-400" />;
      case "business":
        return <FaBriefcase className="text-orange-400" />;
      default:
        return <FaWallet className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Account Type Manager
          </h2>
          <p className="text-gray-400">
            Manage all account types available to customers - Primary, Savings,
            and Current accounts
          </p>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-900 text-green-100"
              : "bg-red-900 text-red-100"
          }`}>
          {message.text}
        </div>
      )}

      {/* Account Types List */}
      <div className="grid gap-6">
        {accountTypes.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <FaExclamationTriangle className="mx-auto w-12 h-12 mb-4" />
            <p>
              No account types found. Run the seeding script to create the
              standard account types.
            </p>
            <p className="text-sm mt-2">
              Use:{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">
                npm run seed:accountTypes
              </code>
            </p>
          </div>
        ) : (
          accountTypes
            .sort((a, b) => (a.priority || 999) - (b.priority || 999))
            .map((accountType) => (
              <div key={accountType.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      {getAccountTypeIcon(accountType.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-white">
                          {accountType.displayName || accountType.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            accountType.status === "active"
                              ? "bg-green-900 text-green-100"
                              : "bg-red-900 text-red-100"
                          }`}>
                          {accountType.status}
                        </span>
                        {accountType.isDefault && (
                          <span className="px-2 py-1 text-xs bg-blue-900 text-blue-100 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">
                        {accountType.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-400">Category:</span>
                          <span className="text-white ml-2 capitalize">
                            {accountType.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Balance:</span>
                          <span className="text-white ml-2">
                            {accountType.currency}{" "}
                            {accountType.currentBalance?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Account:</span>
                          <span className="text-white ml-2">
                            {accountType.accountNumberPrefix}
                            {accountType.accountNumberSuffix}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Interest:</span>
                          <span className="text-white ml-2">
                            {accountType.interestRate || 0}%
                          </span>
                        </div>
                      </div>
                      {accountType.features &&
                        accountType.features.length > 0 && (
                          <div className="mt-3">
                            <span className="text-gray-400 text-sm">
                              Features:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {accountType.features
                                .slice(0, 5)
                                .map((feature, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                    {feature}
                                  </span>
                                ))}
                              {accountType.features.length > 5 && (
                                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                  +{accountType.features.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
      />
    </div>
  );
};

export default AccountTypeManager;
