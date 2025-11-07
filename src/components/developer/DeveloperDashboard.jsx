import React from "react";
import { motion } from "motion/react";
import {
  FaUsers,
  FaUserTie,
  FaLink,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { useDeveloper } from "../../context/DeveloperContext";

const DeveloperDashboard = () => {
  const { stats, developer, adminList, customerList, assignmentList } =
    useDeveloper();

  const formatDate = (timestamp) => {
    if (!timestamp) return "Never";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Create admin-customer pairs from assignments
  const adminCustomerPairs =
    assignmentList
      ?.map((assignment) => {
        const admin = adminList.find(
          (a) => a.id === assignment.adminId || a.uid === assignment.adminId
        );
        const customer = customerList.find(
          (c) =>
            c.id === assignment.customerId || c.uid === assignment.customerId
        );

        return {
          assignment,
          admin,
          customer,
        };
      })
      .filter((pair) => pair.admin && pair.customer) || [];

  const AdminCustomerCard = ({ pair }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaLink className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Admin-Customer Assignment
            </h3>
            <p className="text-sm text-gray-500">
              Created {formatDate(pair.assignment.createdAt)}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Active
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Admin Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-blue-600 font-medium">
            <FaUserTie />
            <span>Administrator</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="font-medium text-gray-800">
              {pair.admin.firstName} {pair.admin.lastName}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaEnvelope className="text-xs" />
              <span>{pair.admin.email}</span>
            </div>
            <div className="text-xs text-blue-600">
              Admin ID: {pair.admin.id}
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-600 font-medium">
            <FaUsers />
            <span>Customer</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <div className="font-medium text-gray-800">
              {pair.customer.firstName} {pair.customer.lastName}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaEnvelope className="text-xs" />
              <span>{pair.customer.email}</span>
            </div>
            {pair.customer.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaPhone className="text-xs" />
                <span>{pair.customer.phone}</span>
              </div>
            )}
            <div className="text-xs text-green-600">
              Customer ID: {pair.customer.id}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {developer?.firstName || "Developer"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your banking platform from the developer dashboard
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Last Activity</div>
            <div className="text-lg font-semibold">
              {developer?.lastActivity
                ? formatDate(developer.lastActivity)
                : "Now"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Administrators
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {adminList.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <FaUserTie className="text-white text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Customers
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {customerList.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <FaUsers className="text-white text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Active Assignments
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {assignmentList.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <FaLink className="text-white text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin-Customer Assignments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaCalendarAlt className="mr-3 text-blue-600" />
            Admin-Customer Assignments
          </h2>
          <div className="text-sm text-gray-500">
            {adminCustomerPairs.length} active pair
            {adminCustomerPairs.length !== 1 ? "s" : ""}
          </div>
        </div>

        {adminCustomerPairs.length > 0 ? (
          <div className="space-y-4">
            {adminCustomerPairs.map((pair, index) => (
              <AdminCustomerCard key={index} pair={pair} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Admin-Customer Assignments
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first admin and customer pair to get started
            </p>
            <button
              onClick={() => (window.location.hash = "#create")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create Admin & Customer
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DeveloperDashboard;
