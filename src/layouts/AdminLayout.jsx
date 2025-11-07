import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import clbg1 from "../assets/images/clbg1.jpg";
import {
  FaUsers,
  FaExchangeAlt,
  FaCog,
  FaBell,
  FaChartBar,
  FaShieldAlt,
  FaHome,
  FaKey,
} from "react-icons/fa";
import { MdAccountBalance, MdDashboard } from "react-icons/md";

const AdminLayout = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect non-admin users to customer dashboard
  React.useEffect(() => {
    if (user && !hasRole("admin")) {
      console.log(
        "Non-admin user detected in admin area, redirecting to customer dashboard"
      );
      navigate("/dashboard", { replace: true });
    }
  }, [user, hasRole, navigate]);

  const adminNavigationItems = [
    {
      id: "account-holders",
      name: "Account Holders",
      icon: FaUsers,
      path: "/admin/account-holders",
      description: "Manage customer profiles and details",
    },
    {
      id: "messages",
      name: "Message Manager",
      icon: FaBell,
      path: "/admin/messages",
      description: "Manage notifications and alerts",
    },
    {
      id: "transactions",
      name: "Transactions",
      icon: FaExchangeAlt,
      path: "/admin/transactions",
      description: "Review and control transactions",
    },
    {
      id: "authentication",
      name: "Authentication",
      icon: FaKey,
      path: "/admin/authentication",
      description: "Manage user credentials and access",
    },
  ];

  const currentPath = location.pathname;
  const activeItem =
    adminNavigationItems.find((item) => item.path === currentPath) ||
    adminNavigationItems[0];

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Dark overlay for admin interface */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-indigo-900/95"></div>

      <Header
        customerName={
          user?.firstName && user?.lastName
            ? `Admin - ${user.firstName} ${user.lastName}`
            : `Admin - ${user?.name || "Administrator"}`
        }
        isAdmin={true}
      />

      <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 pb-6 sm:pb-12">
        {/* Desktop Navigation Sidebar */}
        <div className="hidden lg:block fixed left-0 top-24 h-full w-64 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700/50 z-20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {adminNavigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPath === item.path
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}>
                  <item.icon className="text-xl" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg">
            <div className="px-4 py-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-between w-full text-white hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <activeItem.icon className="text-lg text-blue-400 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">
                    {activeItem.name}
                  </span>
                </div>
                <div
                  className={`transform transition-all duration-200 ${
                    mobileMenuOpen
                      ? "rotate-180 text-blue-400"
                      : "text-gray-400"
                  }`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu with Animation */}
          <div
            className={`bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}>
            <nav className="px-4 py-2 space-y-1">
              {adminNavigationItems
                .filter((item) => item.path !== currentPath)
                .map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] text-gray-300 hover:bg-gray-800/70 hover:text-white hover:border hover:border-gray-600/50"
                    style={{
                      animationDelay: mobileMenuOpen
                        ? `${index * 50}ms`
                        : "0ms",
                    }}>
                    <item.icon className="text-lg flex-shrink-0 text-blue-400" />
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {item.name}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:ml-64 px-3 sm:px-4 lg:px-8 pt-0">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <activeItem.icon className="text-white text-lg sm:text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                      {activeItem.name}
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base hidden sm:block">
                      {activeItem.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Content */}
            {/* Page Content */}
            <div className="space-y-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
