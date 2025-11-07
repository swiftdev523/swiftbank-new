import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
  FaUserShield,
} from "react-icons/fa";
import { useDeveloper } from "../../context/DeveloperContext";

const CustomerOverview = () => {
  const { customerList, toggleUserActiveStatus } = useDeveloper();
  const [togglingUserId, setTogglingUserId] = useState(null);

  const handleToggleActiveStatus = async (userId, currentStatus) => {
    console.log("🎯 CustomerOverview: handleToggleActiveStatus called", {
      userId,
      currentStatus,
      timestamp: new Date().toISOString(),
    });
    try {
      setTogglingUserId(userId);
      console.log(
        "📞 CustomerOverview: Calling toggleUserActiveStatus from context..."
      );
      await toggleUserActiveStatus(userId, currentStatus);
      console.log("✅ CustomerOverview: Toggle completed successfully");
    } catch (error) {
      console.error(
        "❌ CustomerOverview: Error toggling customer status:",
        error
      );
      alert("Failed to toggle customer status. Please try again.");
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaUsers className="mr-3 text-green-600" />
              Customer Overview
            </h2>
            <p className="text-gray-600 mt-1">View all customers</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {customerList.length}
            </div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      {customerList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Customers Yet
          </h3>
          <p className="text-gray-500">
            Create your first admin-customer pair to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerList.map((customer) => (
            <motion.div
              key={customer.uid}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              {/* Customer Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1">
                  {customer.firstName} {customer.lastName}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Admin */}
              {customer.adminData && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm">
                    <FaUserShield className="mr-2 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Admin: {customer.adminData.firstName}{" "}
                      {customer.adminData.lastName}
                    </span>
                  </div>
                </div>
              )}

              {/* Status and Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    customer.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {customer.isActive ? (
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
                  onClick={() =>
                    handleToggleActiveStatus(customer.uid, customer.isActive)
                  }
                  disabled={togglingUserId === customer.uid}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    customer.isActive
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                  title={
                    customer.isActive
                      ? "Deactivate Customer"
                      : "Activate Customer"
                  }>
                  {togglingUserId === customer.uid ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : customer.isActive ? (
                    <>
                      <FaToggleOn />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <FaToggleOff />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOverview;
