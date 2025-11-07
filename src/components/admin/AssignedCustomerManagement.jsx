import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import adminService from "../../services/adminService";
import { formatAddress, getAddressForEditing } from "../../utils/addressUtils";

const AssignedCustomerManagement = () => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Load assigned customer data
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        const dashboardData = await adminService.getAdminDashboardData(
          user.uid
        );

        if (dashboardData.customer) {
          setCustomer(dashboardData.customer);
          setCustomerStats(dashboardData.stats);

          // Initialize edit form
          setEditForm({
            firstName: dashboardData.customer.firstName || "",
            lastName: dashboardData.customer.lastName || "",
            email: dashboardData.customer.email || "",
            phone: dashboardData.customer.phone || "",
            address: getAddressForEditing(dashboardData.customer.address) || "",
            dateOfBirth: dashboardData.customer.dateOfBirth || "",
          });
        }
      } catch (error) {
        console.error("Error loading customer data:", error);
        showNotification("Error loading customer data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerData();
  }, [user?.uid]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data
      setEditForm({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: getAddressForEditing(customer.address) || "",
        dateOfBirth: customer.dateOfBirth || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!customer?.uid || !user?.uid) return;

    try {
      setSaving(true);

      // Prepare update data
      const updateData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        dateOfBirth: editForm.dateOfBirth,
      };

      // Update customer profile
      await adminService.updateCustomerProfile(
        customer.uid,
        updateData,
        user.uid
      );

      // Update local state
      setCustomer((prev) => ({ ...prev, ...updateData }));
      setIsEditing(false);
      showNotification("Customer profile updated successfully!");
    } catch (error) {
      console.error("Error updating customer:", error);
      showNotification(
        error.message || "Error updating customer profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not provided";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading customer data...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center py-12">
          <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Customer Assigned
          </h3>
          <p className="text-gray-500">
            You don't have any customer assigned to your admin account yet.
          </p>
          <p className="text-gray-500 mt-2">
            Please contact the developer to assign a customer to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
          <div className="flex items-center">
            {notification.type === "error" ? (
              <FaExclamationTriangle className="mr-2" />
            ) : (
              <FaCheckCircle className="mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Customer Overview */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Assigned Customer
              </h2>
              <p className="text-gray-500">
                Manage your assigned customer's profile
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                  <FaSave />
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2 text-gray-400" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {customer.firstName || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2 text-gray-400" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {customer.lastName || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaEnvelope className="inline mr-2 text-gray-400" />
                Email Address
              </label>
              <p className="text-gray-900">{customer.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaPhone className="inline mr-2 text-gray-400" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              ) : (
                <p className="text-gray-900">
                  {customer.phone || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full address"
                />
              ) : (
                <p className="text-gray-900">
                  {customer.address
                    ? formatAddress(customer.address)
                    : "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaBirthdayCake className="inline mr-2 text-gray-400" />
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {customer.dateOfBirth || "Not provided"}
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Account Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaIdCard className="inline mr-2 text-gray-400" />
                Customer ID
              </label>
              <p className="text-gray-900 font-mono text-sm">{customer.uid}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  customer.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                {customer.isActive ? (
                  <>
                    <FaCheckCircle className="mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="mr-1" />
                    Inactive
                  </>
                )}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">{formatDate(customer.updatedAt)}</p>
            </div>

            {/* Account Statistics */}
            {customerStats && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <MdAccountBalance className="mr-2" />
                  Account Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      Total Balance:
                    </span>
                    <div className="text-blue-900 font-bold text-lg">
                      {formatCurrency(customerStats.totalBalance)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Bank Accounts:
                    </span>
                    <div className="text-blue-900 font-bold text-lg">
                      {customerStats.accountsCount}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Recent Transactions:
                    </span>
                    <div className="text-blue-900 font-bold">
                      {customerStats.recentTransactionsCount}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Last Activity:
                    </span>
                    <div className="text-blue-900 text-xs">
                      {customerStats.lastTransactionDate
                        ? formatDate(customerStats.lastTransactionDate)
                        : "No transactions"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedCustomerManagement;
