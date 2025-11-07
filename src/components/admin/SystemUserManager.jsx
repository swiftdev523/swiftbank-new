import React, { useState, useEffect } from "react";
import { firestoreService } from "../../services/firestoreService";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../common/ConfirmationModal";

const SystemUserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all users from Firestore
      const usersData = await firestoreService.getAllDocuments("users");

      // Sort users by role (admin first)
      const sortedUsers = usersData.sort((a, b) => {
        const roleOrder = { admin: 1, customer: 2, manager: 3, support: 4 };
        return (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setActiveTab("basic");
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);

      const updateData = {
        ...editingUser,
        updatedAt: new Date(),
        lastModifiedBy: "admin_dashboard",
      };

      await firestoreService.updateDocument(
        "users",
        editingUser.id,
        updateData
      );

      // Update local state
      setUsers(
        users.map((user) => (user.id === editingUser.id ? updateData : user))
      );

      setEditingUser(null);
      setError("");
    } catch (err) {
      console.error("Error saving user:", err);
      setError("Failed to save user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!editingUser) return;

    setEditingUser({
      ...editingUser,
      [field]: value,
    });
  };

  const handleNestedFieldChange = (parent, field, value) => {
    if (!editingUser) return;

    setEditingUser({
      ...editingUser,
      [parent]: {
        ...editingUser[parent],
        [field]: value,
      },
    });
  };

  const handleArrayFieldChange = (field, values) => {
    if (!editingUser) return;

    const arrayValues =
      typeof values === "string"
        ? values
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v)
        : values;

    setEditingUser({
      ...editingUser,
      [field]: arrayValues,
    });
  };

  const handleToggleStatus = (user) => {
    setConfirmationConfig({
      title: `${user.isActive ? "Deactivate" : "Activate"} User`,
      message: `Are you sure you want to ${user.isActive ? "deactivate" : "activate"} ${user.fullName}?`,
      confirmText: user.isActive ? "Deactivate" : "Activate",
      onConfirm: () => toggleUserStatus(user),
    });
    setShowConfirmation(true);
  };

  const toggleUserStatus = async (user) => {
    try {
      setLoading(true);

      const updateData = {
        isActive: !user.isActive,
        updatedAt: new Date(),
        lastModifiedBy: "admin_dashboard",
      };

      await firestoreService.updateDocument("users", user.id, updateData);

      // Update local state
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, ...updateData } : u))
      );

      setShowConfirmation(false);
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError("Failed to update user status.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      customer: "bg-blue-100 text-blue-800",
      manager: "bg-green-100 text-green-800",
      support: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    const dateObj = date.seconds
      ? new Date(date.seconds * 1000)
      : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const predefinedPermissions = {
    admin: [
      "user_management",
      "account_management",
      "transaction_management",
      "message_management",
      "settings_management",
      "audit_access",
      "full_admin_access",
    ],
    customer: [
      "account_view",
      "transaction_create",
      "profile_edit",
      "support_contact",
    ],
  };

  if (loading && users.length === 0) {
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
          System User Management
        </h1>
        <p className="text-gray-600">
          Manage the two system users: Admin and Customer (Johnson Boseman)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* User Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.fullName || user.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone || "Not provided"}</p>
                </div>

                {user.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">
                      {user.address.street}, {user.address.city},{" "}
                      {user.address.state}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Permissions</p>
                  <p className="text-sm">
                    {user.permissions?.length || 0} permissions configured
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Sign In</p>
                  <p className="text-sm">{formatDate(user.lastSignIn)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Edit User
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    user.isActive
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}>
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit {editingUser.fullName}
              </h2>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {["basic", "contact", "security", "permissions"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.firstName || ""}
                      onChange={(e) =>
                        handleFieldChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.lastName || ""}
                      onChange={(e) =>
                        handleFieldChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.displayName || ""}
                      onChange={(e) =>
                        handleFieldChange("displayName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editingUser.username || ""}
                      onChange={(e) =>
                        handleFieldChange("username", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingUser.email || ""}
                      onChange={(e) =>
                        handleFieldChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={editingUser.role || "customer"}
                      onChange={(e) =>
                        handleFieldChange("role", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                      <option value="admin">Admin</option>
                      <option value="customer">Customer</option>
                      <option value="manager">Manager</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editingUser.phone || ""}
                      onChange={(e) =>
                        handleFieldChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editingUser.address?.street || ""}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "address",
                          "street",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editingUser.address?.city || ""}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "address",
                          "city",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={editingUser.address?.state || ""}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "address",
                          "state",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={editingUser.address?.zipCode || ""}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "address",
                          "zipCode",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editingUser.address?.country || ""}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "address",
                          "country",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={editingUser.security?.sessionTimeout || ""}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "security",
                          "sessionTimeout",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Two-Factor Authentication
                    </label>
                    <select
                      value={editingUser.preferences?.twoFactorEnabled || false}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          "preferences",
                          "twoFactorEnabled",
                          e.target.value === "true"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                      <option value="false">Disabled</option>
                      <option value="true">Enabled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={editingUser.isActive || false}
                      onChange={(e) =>
                        handleFieldChange("isActive", e.target.value === "true")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "permissions" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permission Presets
                    </label>
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() =>
                          handleArrayFieldChange(
                            "permissions",
                            predefinedPermissions.admin
                          )
                        }
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                        Admin Permissions
                      </button>
                      <button
                        onClick={() =>
                          handleArrayFieldChange(
                            "permissions",
                            predefinedPermissions.customer
                          )
                        }
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                        Customer Permissions
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permissions (comma-separated)
                    </label>
                    <textarea
                      value={editingUser.permissions?.join(", ") || ""}
                      onChange={(e) =>
                        handleArrayFieldChange("permissions", e.target.value)
                      }
                      rows={4}
                      placeholder="user_management, account_management, transaction_management, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
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

export default SystemUserManager;
