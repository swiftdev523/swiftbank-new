import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import DeveloperDashboard from "../../components/developer/DeveloperDashboard";
import AdminManagement from "../../components/developer/AdminManagement";
import CustomerOverview from "../../components/developer/CustomerOverview";
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
    setMobileMenuOpen(false); // Close mobile menu
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

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false); // Close mobile menu when section changes
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DeveloperDashboard />;
      case "admins":
        return <AdminManagement />;
      case "customers":
        return <CustomerOverview />;
      default:
        return <DeveloperDashboard />;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col md:flex-row"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/90"></div>

      {/* Mobile Header */}
      <div className="md:hidden relative z-20 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaCode className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">
                Developer Portal
              </h1>
              <p className="text-xs text-gray-600">
                {developer?.firstName || "System"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop and Mobile Overlay */}
      <AnimatePresence>
        {(mobileMenuOpen || window.innerWidth >= 768) && (
          <>
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 bg-black/50 z-30"
              />
            )}

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className={`
                fixed md:relative z-40 
                w-72 md:w-64 
                h-screen
                bg-white shadow-lg flex flex-col
                ${mobileMenuOpen ? "block" : "hidden md:flex"}
              `}>
              {/* Header - Desktop only */}
              <div className="hidden md:block p-6 border-b border-gray-200">
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
              <div className="p-4 border-b border-gray-200 mt-4 md:mt-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaCode className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {developer?.firstName || "System"}{" "}
                      {developer?.lastName || "Developer"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {developer?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {sidebarSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}>
                        <Icon
                          className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium truncate ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                            {section.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
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
                  onClick={() => {
                    setShowCreateModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <FaPlus className="flex-shrink-0" />
                  <span className="font-medium truncate">
                    Create Admin & Customer
                  </span>
                </button>

                <button
                  onClick={() => {
                    window.open("/", "_blank");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <FaHome className="flex-shrink-0" />
                  <span className="truncate">View Main Site</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <FaSignOutAlt className="flex-shrink-0" />
                  <span className="truncate">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col min-h-screen md:min-h-0">
        {/* Header - Desktop only */}
        <header className="hidden md:block bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 truncate">
                {sidebarSections.find((s) => s.id === activeSection)?.name ||
                  "Dashboard"}
              </h1>
              <p className="text-sm text-gray-600 truncate">
                {sidebarSections.find((s) => s.id === activeSection)
                  ?.description || "Manage your banking platform"}
              </p>
            </div>

            <div className="flex items-center space-x-4 ml-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {adminList.length}
                  </div>
                  <div className="text-xs text-gray-600">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {customerList.length}
                  </div>
                  <div className="text-xs text-gray-600">Customers</div>
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
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderActiveSection()}
        </main>
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
