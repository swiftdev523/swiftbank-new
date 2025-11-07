import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import firestoreService from "../../services/firestoreService";
import authService from "../../services/authService";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaUserShield,
  FaKey,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

const AuthenticationManager = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingEntity, setEditingEntity] = useState(null); // 'customer' or 'admin'
  const [showPasswordField, setShowPasswordField] = useState(false);
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
    loadAuthenticationData();
  }, []);

  const loadAuthenticationData = async () => {
    try {
      setLoading(true);

      // Load all users to identify customer and admin
      const users = await firestoreService.list("users");

      if (users && users.length > 0) {
        const admin = users.find((u) => u.role === "admin");
        const customer = users.find((u) => u.role === "customer");

        setAdminData(admin || null);
        setCustomerData(customer || null);
      }
    } catch (error) {
      console.error("Error loading authentication data:", error);
      setMessage({
        type: "error",
        text: "Failed to load authentication data. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntity = (entity, entityData) => {
    setEditingEntity(entity);
    setFormData({
      firstName: entityData.firstName || "",
      lastName: entityData.lastName || "",
      email: entityData.email || "",
      isActive: entityData.isActive !== false,
      currentPassword: "",
      newPassword: "",
    });
    setShowPasswordField(false);
  };

  const handleSaveEntity = () => {
    if (!editingEntity) return;

    const hasPasswordChange =
      formData.newPassword && formData.newPassword.length >= 6;
    const entityName = editingEntity === "admin" ? "Administrator" : "Customer";

    // Check if this is a critical change that needs confirmation
    if (hasPasswordChange) {
      setConfirmationModal({
        isOpen: true,
        title: `Update ${entityName} Credentials`,
        message: `Are you sure you want to update ${formData.firstName} ${formData.lastName}?\n\n• Password will be reset`,
        type: "warning",
        confirmText: `Update ${entityName}`,
        onConfirm: () => confirmSaveEntity(),
      });
    } else {
      // For non-critical changes, save directly
      confirmSaveEntity();
    }
  };

  const confirmSaveEntity = async () => {
    if (!editingEntity) return;

    setActionLoading(true);
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

    const entityData = editingEntity === "admin" ? adminData : customerData;

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        isActive: formData.isActive,
        updatedAt: new Date(),
      };

      // Update Firebase Auth password if new password is provided
      if (formData.newPassword && formData.newPassword.length >= 6) {
        if (formData.currentPassword) {
          // Use updateUserPassword with re-authentication if current password provided
          await authService.updateUserPassword(
            formData.currentPassword,
            formData.newPassword
          );
        } else {
          // Use simple updatePassword (admin override)
          await authService.updatePassword(formData.newPassword);
        }

        updateData.passwordUpdatedAt = new Date();
        updateData.passwordUpdatedBy = user.uid;
      }

      await firestoreService.update("users", entityData.id, updateData);

      setMessage({
        type: "success",
        text: `${editingEntity === "admin" ? "Administrator" : "Customer"} updated successfully!${formData.newPassword ? " Password has been changed." : ""}`,
      });

      // Refresh data
      await loadAuthenticationData();
      setEditingEntity(null);
      setFormData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Error updating entity:", error);
      let errorMessage = "Failed to update credentials. Please try again.";

      if (error.message?.includes("auth/requires-recent-login")) {
        errorMessage =
          "Recent authentication required. Please provide current password or re-login.";
      } else if (error.message?.includes("auth/wrong-password")) {
        errorMessage = "Current password is incorrect. Please try again.";
      } else if (error.message?.includes("auth/weak-password")) {
        errorMessage =
          "New password is too weak. Please use at least 6 characters.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (entityType) => {
    const entityData = entityType === "admin" ? adminData : customerData;
    const entityName = entityType === "admin" ? "Administrator" : "Customer";

    setConfirmationModal({
      isOpen: true,
      title: `Reset ${entityName} Password`,
      message: `Are you sure you want to reset the password for ${entityData.firstName} ${entityData.lastName} (${entityData.email})?`,
      type: "warning",
      confirmText: "Reset Password",
      onConfirm: () =>
        confirmResetPassword(entityData.id, entityData.email, entityName),
    });
  };

  const confirmResetPassword = async (userId, userEmail, entityName) => {
    setActionLoading(true);
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

    try {
      await firestoreService.update("users", userId, {
        passwordResetRequested: true,
        passwordResetRequestedAt: new Date(),
        passwordResetRequestedBy: user.uid,
        updatedAt: new Date(),
      });

      setMessage({
        type: "success",
        text: `Password reset initiated for ${entityName}. User will receive reset instructions.`,
      });

      await loadAuthenticationData();
    } catch (error) {
      console.error("Error initiating password reset:", error);
      setMessage({
        type: "error",
        text: "Failed to initiate password reset.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="xl" message="Loading authentication data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-2">
          Authentication Management
        </h2>
        <p className="text-gray-300">
          Manage administrator and customer login credentials
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === "error"
              ? "bg-red-900/20 border-red-500/30 text-red-200"
              : "bg-green-900/20 border-green-500/30 text-green-200"
          }`}>
          {message.text}
        </div>
      )}

      {/* Authentication Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaUserShield className="text-blue-400 text-2xl" />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Administrator
                  </h3>
                  <p className="text-gray-300 text-sm">
                    System administrator account
                  </p>
                </div>
              </div>
              {adminData && !editingEntity && (
                <button
                  onClick={() => handleEditEntity("admin", adminData)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  disabled={actionLoading}>
                  <FaEdit />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {adminData ? (
              editingEntity === "admin" ? (
                <AdminEditForm />
              ) : (
                <AdminDisplayInfo />
              )
            ) : (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-yellow-400 text-3xl mb-3 mx-auto" />
                <p className="text-gray-300">No administrator account found</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-green-400 text-2xl" />
                <div>
                  <h3 className="text-xl font-bold text-white">Customer</h3>
                  <p className="text-gray-300 text-sm">
                    Primary account holder
                  </p>
                </div>
              </div>
              {customerData && !editingEntity && (
                <button
                  onClick={() => handleEditEntity("customer", customerData)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  disabled={actionLoading}>
                  <FaEdit />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {customerData ? (
              editingEntity === "customer" ? (
                <CustomerEditForm />
              ) : (
                <CustomerDisplayInfo />
              )
            ) : (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-yellow-400 text-3xl mb-3 mx-auto" />
                <p className="text-gray-300">No customer account found</p>
              </div>
            )}
          </div>
        </div>
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

  // Helper Components
  function AdminEditForm() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowPasswordField(!showPasswordField)}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-2">
            <FaKey />
            <span>{showPasswordField ? "Hide" : "Change"} Password</span>
          </button>

          {showPasswordField && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password (for security)"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty for admin override (may require recent login)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="adminActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="adminActive" className="text-gray-300">
            Account Active
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSaveEntity();
            }}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50">
            <FaSave />
            <span>Save Changes</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setEditingEntity(null);
              setFormData({ currentPassword: "", newPassword: "" });
              setShowPasswordField(false);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
            <FaTimes />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  function CustomerEditForm() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowPasswordField(!showPasswordField)}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 mb-2">
            <FaKey />
            <span>{showPasswordField ? "Hide" : "Change"} Password</span>
          </button>

          {showPasswordField && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password (for security)"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty for admin override (may require recent login)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>{" "}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="customerActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
          />
          <label htmlFor="customerActive" className="text-gray-300">
            Account Active
          </label>
        </div>
        <div className="flex space-x-3 pt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSaveEntity();
            }}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50">
            <FaSave />
            <span>Save Changes</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setEditingEntity(null);
              setFormData({ currentPassword: "", newPassword: "" });
              setShowPasswordField(false);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
            <FaTimes />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  function AdminDisplayInfo() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-white font-medium">
              {adminData.firstName} {adminData.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white font-medium">{adminData.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${adminData.isActive ? "bg-green-400" : "bg-red-400"}`}></div>
            <span
              className={`text-sm ${adminData.isActive ? "text-green-400" : "text-red-400"}`}>
              {adminData.isActive ? "Active" : "Disabled"}
            </span>
          </div>

          <button
            onClick={() => handleResetPassword("admin")}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
            disabled={actionLoading}>
            <FaKey className="text-xs" />
            <span>Reset Password</span>
          </button>
        </div>
      </div>
    );
  }

  function CustomerDisplayInfo() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-white font-medium">
              {customerData.firstName} {customerData.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white font-medium">{customerData.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${customerData.isActive ? "bg-green-400" : "bg-red-400"}`}></div>
            <span
              className={`text-sm ${customerData.isActive ? "text-green-400" : "text-red-400"}`}>
              {customerData.isActive ? "Active" : "Disabled"}
            </span>
          </div>

          <button
            onClick={() => handleResetPassword("customer")}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
            disabled={actionLoading}>
            <FaKey className="text-xs" />
            <span>Reset Password</span>
          </button>
        </div>
      </div>
    );
  }
};

export default AuthenticationManager;
