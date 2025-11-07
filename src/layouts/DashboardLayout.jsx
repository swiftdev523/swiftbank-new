import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import clbg1 from "../assets/images/clbg1.jpg";
import {
  MdHome,
  MdAnalytics,
  MdTrendingUp,
  MdPerson,
  MdAccountBalance,
  MdHistory,
  MdSettings,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { FaExchangeAlt, FaSignOutAlt } from "react-icons/fa";

const DashboardLayout = () => {
  const { user, hasRole, isLoading, isUserDataLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading spinner while data loads
  if (isLoading || isUserDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/95 flex items-center justify-center">
        <LoadingSpinner size="xl" message="Loading dashboard..." />
      </div>
    );
  }

  // Emergency redirect for admin users who shouldn't be here (should be caught by CustomerRoute)
  React.useEffect(() => {
    if (user && hasRole("admin")) {
      console.log(
        "🚨 EMERGENCY: Admin user detected in customer dashboard layout!"
      );
      console.log("Immediate redirect to admin dashboard...");
      navigate("/admin/account-holders", { replace: true });
    }
  }, [user, hasRole, navigate]);

  const navigationItems = [
    {
      id: "overview",
      name: "Overview",
      icon: MdHome,
      path: "/dashboard",
      description: "Main dashboard view",
    },
    {
      id: "accounts",
      name: "Accounts",
      icon: MdAccountBalance,
      path: "/dashboard/accounts",
      description: "Account management",
    },
    {
      id: "transactions",
      name: "Transactions",
      icon: FaExchangeAlt,
      path: "/dashboard/transactions",
      description: "Transaction history",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: MdAnalytics,
      path: "/dashboard/analytics",
      description: "Financial analytics",
    },
    {
      id: "profile",
      name: "Profile",
      icon: MdPerson,
      path: "/dashboard/profile",
      description: "Personal profile settings",
    },
  ];

  const currentPath = location.pathname;
  const activeItem =
    navigationItems.find((item) => item.path === currentPath) ||
    navigationItems[0];

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/95"></div>

      <Header
        customerName={
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.name || "User"
        }
      />

      <div className="relative z-10 pt-24 pb-12">
        {/* Desktop Navigation Sidebar */}
        <div className="hidden lg:block fixed left-0 top-24 h-full w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 z-20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPath === item.path
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}>
                  <item.icon className="text-xl" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div
                      className={`text-xs ${
                        currentPath === item.path
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden px-4 mb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4">
            {/* Clickable current section header with hamburger menu style */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between mb-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <activeItem.icon className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {activeItem.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activeItem.description}
                  </p>
                </div>
              </div>
              <div
                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                  mobileMenuOpen
                    ? "bg-blue-600 text-white shadow-lg rotate-180"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                <MdKeyboardArrowDown className="text-xl transition-transform duration-300" />
              </div>
            </button>

            {mobileMenuOpen && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                {navigationItems
                  .filter((item) => item.path !== currentPath)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 border cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-gray-200 hover:border-gray-300">
                      <item.icon className="text-xl flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm">{item.name}</div>
                        <div className="text-xs mt-1 text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}

                {/* Logout Button */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 border text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300 cursor-pointer">
                    <FaSignOutAlt className="text-xl flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">Sign Out</div>
                      <div className="text-xs mt-1 text-red-500">
                        Logout from your account
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Removed collapsed summary card on mobile to avoid duplicate section title; only dropdown remains */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:ml-64 px-3 sm:px-4 lg:px-8">
          <div className="w-full max-w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
