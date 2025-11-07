import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaUsers,
  FaUserTie,
  FaEye,
  FaTrash,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useDeveloper } from "../../context/DeveloperContext";

const AdminManagement = () => {
  const { adminList, customerList, deactivateAdminCustomerPair, isLoading } =
    useDeveloper();
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [adminToDeactivate, setAdminToDeactivate] = useState(null);

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
  };

  const handleDeactivateAdmin = (admin) => {
    setAdminToDeactivate(admin);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!adminToDeactivate) return;

    try {
      await deactivateAdminCustomerPair(
        adminToDeactivate.uid,
        adminToDeactivate.assignedCustomer
      );
      setShowDeactivateModal(false);
      setAdminToDeactivate(null);
    } catch (error) {
      console.error("Error deactivating admin:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaUserTie className="mr-3 text-blue-600" />
              Admin Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage administrators and their assigned customers
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {adminList.length}
            </div>
            <div className="text-sm text-gray-600">Total Admins</div>
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Active Administrators
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-2">Loading administrators...</p>
          </div>
        ) : adminList.length === 0 ? (
          <div className="p-8 text-center">
            <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Administrators Yet
            </h3>
            <p className="text-gray-500">
              Create your first admin-customer pair to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {adminList.map((admin) => (
              <motion.div
                key={admin.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserTie className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {admin.firstName} {admin.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaEnvelope className="mr-1" />
                          {admin.email}
                        </span>
                        <span className="flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          Created {formatDate(admin.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {admin.isActive ? (
                        <>
                          <FaCheckCircle className="inline mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="inline mr-1" />
                          Inactive
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => handleViewAdmin(admin)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details">
                      <FaEye />
                    </button>

                    {admin.isActive && (
                      <button
                        onClick={() => handleDeactivateAdmin(admin)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                {/* Assigned Customer Info */}
                {admin.customerData && (
                  <div className="mt-4 ml-16 p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2 flex items-center">
                      <FaUsers className="mr-2" />
                      Assigned Customer
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">
                          Name:
                        </span>
                        <span className="ml-2 text-green-600">
                          {admin.customerData.firstName}{" "}
                          {admin.customerData.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          Email:
                        </span>
                        <span className="ml-2 text-green-600">
                          {admin.customerData.email}
                        </span>
                      </div>
                      {admin.customerData.phone && (
                        <div>
                          <span className="font-medium text-green-700">
                            Phone:
                          </span>
                          <span className="ml-2 text-green-600">
                            {admin.customerData.phone}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-green-700">
                          Accounts:
                        </span>
                        <span className="ml-2 text-green-600">
                          {admin.customerData.accounts?.length || 0} accounts
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Details Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Admin Details
                </h2>
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaTimesCircle className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Admin Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Administrator Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <p className="text-gray-900">
                      {selectedAdmin.firstName} {selectedAdmin.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedAdmin.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <FaShieldAlt className="mr-2 text-blue-600" />
                      Administrator
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p
                      className={`font-medium ${selectedAdmin.isActive ? "text-green-600" : "text-red-600"}`}>
                      {selectedAdmin.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedAdmin.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Updated
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedAdmin.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {selectedAdmin.customerData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Assigned Customer
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700">
                          Full Name
                        </label>
                        <p className="text-green-900">
                          {selectedAdmin.customerData.firstName}{" "}
                          {selectedAdmin.customerData.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700">
                          Email
                        </label>
                        <p className="text-green-900">
                          {selectedAdmin.customerData.email}
                        </p>
                      </div>
                      {selectedAdmin.customerData.phone && (
                        <div>
                          <label className="block text-sm font-medium text-green-700">
                            Phone
                          </label>
                          <p className="text-green-900">
                            {selectedAdmin.customerData.phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-green-700">
                          Accounts
                        </label>
                        <p className="text-green-900">
                          {selectedAdmin.customerData.accounts?.length || 0}{" "}
                          bank accounts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && adminToDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <FaTrash className="text-6xl text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Deactivate Admin
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to deactivate{" "}
                  <strong>
                    {adminToDeactivate.firstName} {adminToDeactivate.lastName}
                  </strong>
                  and their assigned customer? This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={confirmDeactivate}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                  {isLoading ? "Deactivating..." : "Deactivate"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
