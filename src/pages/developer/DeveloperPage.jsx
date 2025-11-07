import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useDeveloper } from "../../context/DeveloperContext";
import {
  FaCode,
  FaUserTie,
  FaUsers,
  FaPlus,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaChartLine,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import DeveloperDashboard from "../../components/developer/DeveloperDashboard";
import AdminManagement from "../../components/developer/AdminManagement";
import CreateAdminCustomerModal from "../../components/developer/CreateAdminCustomerModal";
import clbg1 from "../../assets/images/clbg1.jpg";

const DeveloperPage = () => {
  const {
    developer,
    logoutDeveloper,
    refreshData,
    isLoading,
    adminList,
    customerList,
    stats,
  } = useDeveloper();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("🏠 DeveloperPage - Current State:", {
      developer,
      adminListLength: adminList?.length || 0,
      customerListLength: customerList?.length || 0,
      stats,
      isLoading,
    });
  }, [developer, adminList, customerList, stats, isLoading]);

  // Load data on component mount
  useEffect(() => {
    if (developer?.uid) {
      console.log(
        "🔄 DeveloperPage - Triggering data refresh for developer UID:",
        developer.uid
      );
      refreshData();
    }
  }, [developer?.uid, refreshData]);

  const handleLogout = async () => {
    try {
      await logoutDeveloper();
      window.location.href = "/developer/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refreshData(); // Refresh all data after successful creation
  };

  const sidebarSections = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: MdDashboard,
      description: "Overview and statistics",
    },
    {
      id: "admins",
      name: "Admin Management",
      icon: FaUserTie,
      description: "Manage administrators",
    },
    {
      id: "customers",
      name: "Customer Overview",
      icon: FaUsers,
      description: "View all customers",
    },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DeveloperDashboard />;
      case "admins":
        return <AdminManagement />;
      case "customers":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-3 text-green-600" />
                Customer Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerList.map((customer) => (
                  <div
                    key={customer.uid}
                    className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-sm text-green-600">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-sm text-green-600">{customer.phone}</p>
                    )}
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {customer.adminData && (
                      <div className="mt-2 text-xs text-green-700">
                        Admin: {customer.adminData.firstName}{" "}
                        {customer.adminData.lastName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {customerList.length === 0 && (
                <div className="text-center py-12">
                  <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Customers Yet
                  </h3>
                  <p className="text-gray-500">
                    Create your first admin-customer pair to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <DeveloperDashboard />;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/90"></div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaCode className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Developer Portal
              </h1>
              <p className="text-sm text-gray-600">Banking Platform</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaCode className="text-blue-600 text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {developer?.firstName || "Developer"}
              </p>
              <p className="text-xs text-gray-600">{developer?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}>
                  <Icon
                    className={`${isActive ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                      {section.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <FaPlus />
            <span className="font-medium">Create Admin & Customer</span>
          </button>

          <button
            onClick={() => window.open("/", "_blank")}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FaHome />
            <span>View Main Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {sidebarSections.find((s) => s.id === activeSection)?.name ||
                  "Dashboard"}
              </h1>
              <p className="text-gray-600">
                {sidebarSections.find((s) => s.id === activeSection)
                  ?.description || "Manage your banking platform"}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {adminList.length}
                  </div>
                  <div className="text-gray-600">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {customerList.length}
                  </div>
                  <div className="text-gray-600">Customers</div>
                </div>
              </div>

              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Data">
                <motion.div
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={{
                    duration: 1,
                    repeat: isLoading ? Infinity : 0,
                    ease: "linear",
                  }}>
                  <FaCog />
                </motion.div>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 max-w-7xl mx-auto">{renderActiveSection()}</main>
      </div>

      {/* Create Admin Customer Modal */}
      <CreateAdminCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default DeveloperPage;
