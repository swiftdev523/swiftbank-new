import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaUsers, FaExchangeAlt, FaCog, FaBell } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import clbg1 from "../assets/images/clbg1.jpg";

// Import admin components (we'll create these)
import AssignedCustomerManagement from "../components/admin/AssignedCustomerManagement";
import TransactionManagement from "../components/admin/TransactionManagement";
import EditableTransactionManagement from "../components/admin/EditableTransactionManagement";
import TransactionMessageManager from "../components/admin/TransactionMessageManager";
import AdminAccountManagement from "../components/admin/AdminAccountManagement";

const AdminPage = () => {
  const { user, hasRole } = useAuth();
  const [activeSection, setActiveSection] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Enhanced setActiveSection with logging and forcing re-render
  const handleSetActiveSection = useCallback(
    (sectionId) => {
      console.log(
        `AdminPage: Setting active section to: ${sectionId}, current: ${activeSection}`
      );

      // Force state update
      setActiveSection(sectionId);

      // Double-check the state was set
      setTimeout(() => {
        console.log(
          `AdminPage: After timeout, activeSection should be: ${sectionId}`
        );
      }, 50);
    },
    [activeSection]
  );

  // Check if user has admin privileges
  const isAdmin = hasRole("admin");

  useEffect(() => {
    // Simulate loading admin data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [activeSection]);

  // Debug useEffect to track activeSection changes
  useEffect(() => {
    console.log(`AdminPage: activeSection state changed to: ${activeSection}`);
  }, [activeSection]);

  if (!user) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      id: "customer",
      name: "Assigned Customer",
      icon: FaUsers,
      description: "Manage your assigned customer",
    },
    {
      id: "accounts",
      name: "Account Management",
      icon: MdAccountBalance,
      description: "Manage customer accounts and balances",
    },
    {
      id: "messages",
      name: "Message Manager",
      icon: FaBell,
      description: "Edit pop-ups & notifications",
    },
    {
      id: "transactions",
      name: "Transactions",
      icon: FaExchangeAlt,
      description: "Monitor and manage transactions",
    },
  ];

  const renderActiveSection = () => {
    console.log(`AdminPage: Rendering section: ${activeSection}`);
    switch (activeSection) {
      case "customer":
        return <AssignedCustomerManagement />;
      case "accounts":
        return <AdminAccountManagement />;
      case "messages":
        return <TransactionMessageManager />;
      case "transactions":
        return <EditableTransactionManagement />;
      default:
        console.log(
          `AdminPage: Unknown section ${activeSection}, defaulting to customer`
        );
        return <AssignedCustomerManagement />;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-indigo-900/95"></div>

      {/* Fixed Header */}
      <div className="z-50 fixed top-0 left-0 right-0">
        <Header
          customerName={`Admin - ${user.name}`}
          adminSections={adminSections}
          activeSection={activeSection}
          setActiveSection={handleSetActiveSection}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 flex pt-20 h-screen overflow-hidden">
        {/* Fixed Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 bg-white/10 backdrop-blur-md border-r border-white/20 h-[calc(100vh-5rem)]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Admin Panel
              </h2>
              <p className="text-blue-200">Manage your banking platform</p>
            </div>

            {/* Desktop Navigation */}
            <nav className="space-y-2">
              {adminSections
                .filter(
                  (section) =>
                    section.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    section.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSetActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}>
                    <section.icon className="text-xl" />
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs opacity-75">
                        {section.description}
                      </div>
                    </div>
                  </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-5rem)]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 sm:p-6 lg:p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div key={activeSection}>{renderActiveSection()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
