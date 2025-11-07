import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useWebsiteSettings } from "../context/WebsiteSettingsContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaInfoCircle,
  FaClock,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import { MdDashboard, MdAccountBalance, MdHome } from "react-icons/md";
import clbg5 from "../assets/images/clbg5.jpg";
import bankLogo from "/bank-logo.png";

const Header = ({
  customerName,
  adminSections,
  activeSection,
  setActiveSection,
  setMobileMenuOpen,
  mobileMenuOpen,
  disableMobileMenu = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const dropdownRef = useRef(null);
  const { logout, user, getSessionInfo, sessionTimeRemaining, hasRole } =
    useAuth();
  const { settings } = useWebsiteSettings();
  const location = useLocation();
  const navigate = useNavigate();

  // Removed admin emergency redirect from Header; AdminRedirectGuard handles this globally

  // Session timeout warning
  useEffect(() => {
    if (!user || !sessionTimeRemaining) return;

    const checkSessionWarning = () => {
      const timeLeft = sessionTimeRemaining;
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (timeLeft <= fiveMinutes && timeLeft > 0) {
        setSessionWarning(true);
      } else {
        setSessionWarning(false);
      }
    };

    checkSessionWarning();
    const interval = setInterval(checkSessionWarning, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, sessionTimeRemaining]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const showNotification = (
    title,
    message,
    type = "info",
    icon = FaInfoCircle
  ) => {
    setNotification({
      title,
      message,
      type,
      icon,
      id: Date.now(),
    });

    // Auto-close after 6 seconds
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const getTimeBasedGreeting = () => {
    // Get current time in US Eastern Time (ET)
    const now = new Date();
    const usEasternTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(now);

    const hour = parseInt(usEasternTime);

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 23) return "Good Evening"; // Extended evening until 11 PM
    return "Good Night";
  };

  // Show navigation buttons without Profile (it's in user dropdown)
  // For admin users, route to admin panel; for customers, route to customer dashboard
  const navigation = hasRole("admin")
    ? [{ name: "Admin", href: "/admin/account-holders", icon: MdDashboard }]
    : [{ name: "Dashboard", href: "/dashboard", icon: MdDashboard }];

  const handleHomeNavigation = () => {
    navigate("/");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 text-white shadow-2xl border-b border-blue-800/50"
      style={{
        backgroundImage: `url(${clbg5})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-blue-900/90 to-slate-900/95"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                <img
                  src={settings?.logoUrl || bankLogo}
                  alt={`${settings?.bankName || "Swift Bank"} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {settings?.bankName || "Swift Bank"}
                </h1>
                <p className="text-blue-200 text-xs sm:text-sm font-medium">
                  {settings?.tagline || "Online Banking Portal"}
                </p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {settings?.bankName || "Swift Bank"}
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {/* Home button for navigation */}
              <button
                onClick={handleHomeNavigation}
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 text-blue-100 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                <MdHome className="text-lg" />
                <span>Home</span>
              </button>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    (item.name === "Dashboard" &&
                      location.pathname.startsWith("/dashboard")) ||
                    location.pathname === item.href
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105"
                      : "text-blue-100 hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  }`}>
                  <item.icon className="text-lg" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button - only show if not disabled */}
            {!disableMobileMenu && (
              <button
                onClick={() => {
                  const currentMenuOpen =
                    mobileMenuOpen !== undefined
                      ? mobileMenuOpen
                      : localMobileMenuOpen;
                  const newMenuOpen = !currentMenuOpen;

                  console.log(
                    `Hamburger menu clicked. Current state: ${currentMenuOpen}, New state: ${newMenuOpen}`
                  );

                  if (setMobileMenuOpen) {
                    setMobileMenuOpen(newMenuOpen);
                  } else {
                    setLocalMobileMenuOpen(newMenuOpen);
                  }
                }}
                className="md:hidden w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                {(
                  mobileMenuOpen !== undefined
                    ? mobileMenuOpen
                    : localMobileMenuOpen
                ) ? (
                  <FaTimes className="text-white text-lg" />
                ) : (
                  <FaBars className="text-white text-lg" />
                )}
              </button>
            )}

            {/* Desktop user info and dropdown */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-blue-200 font-medium">
                  {hasRole("admin") && location.pathname.startsWith("/admin")
                    ? "Admin Dashboard"
                    : `${getTimeBasedGreeting()},`}
                </p>
                <p className="font-bold text-sm sm:text-lg text-white">
                  {customerName}
                </p>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      "Profile button clicked - current showDropdown:",
                      showDropdown
                    );
                    setShowDropdown(!showDropdown);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 shadow-lg transform hover:scale-105 border-2 border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 overflow-hidden"
                  style={{ cursor: "pointer" }}
                  type="button"
                  aria-label="User menu">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full pointer-events-none select-none"
                    />
                  ) : (
                    <span className="text-sm sm:text-lg font-bold text-white pointer-events-none select-none">
                      {customerName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-200"
                    style={{
                      position: "absolute",
                      zIndex: 10000,
                      right: 0,
                      top: "100%",
                      marginTop: "8px",
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}>
                    <div className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">
                        {hasRole("admin") &&
                        location.pathname.startsWith("/admin")
                          ? "Admin Dashboard"
                          : `${getTimeBasedGreeting()},`}
                      </p>
                      <p className="font-bold text-gray-900">{customerName}</p>
                      <p className="text-gray-500 text-xs">
                        {hasRole("admin") &&
                        location.pathname.startsWith("/admin")
                          ? "Administrator"
                          : "Premium Account Holder"}
                      </p>
                    </div>

                    {/* Home button for all users */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Home button clicked");
                        setShowDropdown(false);
                        handleHomeNavigation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="flex items-center space-x-3 w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors font-medium focus:outline-none focus:bg-blue-50"
                      style={{ cursor: "pointer" }}>
                      <MdHome className="text-gray-500 pointer-events-none" />
                      <span className="pointer-events-none">Home</span>
                    </button>

                    {/* Dashboard/Admin button based on role */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Dashboard/Admin button clicked");
                        setShowDropdown(false);
                        if (hasRole("admin")) {
                          navigate("/admin/account-holders");
                        } else {
                          navigate("/dashboard");
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="flex items-center space-x-3 w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors font-medium focus:outline-none focus:bg-blue-50"
                      style={{ cursor: "pointer" }}>
                      <MdDashboard className="text-gray-500 pointer-events-none" />
                      <span className="pointer-events-none">
                        {hasRole("admin") ? "Admin" : "Dashboard"}
                      </span>
                    </button>

                    {/* Profile/Settings button - only for regular users */}
                    {!hasRole("admin") && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Profile/Settings button clicked");
                          setShowDropdown(false);
                          navigate("/dashboard/profile");
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-center space-x-3 w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors font-medium focus:outline-none focus:bg-blue-50"
                        style={{ cursor: "pointer" }}>
                        <FaUser className="text-gray-500 pointer-events-none" />
                        <span className="pointer-events-none">
                          Profile Settings
                        </span>
                      </button>
                    )}

                    {/* Regular user options */}
                    {!hasRole("admin") && <></>}

                    <div className="border-t border-gray-100 mt-2">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Sign Out button clicked");
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-center space-x-3 w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium focus:outline-none focus:bg-red-50"
                        style={{ cursor: "pointer" }}>
                        <FaSignOutAlt className="text-red-500 pointer-events-none" />
                        <span className="pointer-events-none">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - only render if not disabled */}
        {!disableMobileMenu &&
          (mobileMenuOpen !== undefined
            ? mobileMenuOpen
            : localMobileMenuOpen) && (
            <div className="md:hidden mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative z-50">
              {/* Mobile User Info */}
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {customerName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-blue-200 font-medium">
                    {getTimeBasedGreeting()},
                  </p>
                  <p className="font-bold text-lg text-white">{customerName}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Home button for mobile */}
                <button
                  onClick={() => {
                    console.log("Mobile home button clicked");
                    if (setMobileMenuOpen) {
                      setMobileMenuOpen(false);
                    } else {
                      setLocalMobileMenuOpen(false);
                    }
                    handleHomeNavigation();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-blue-100 hover:bg-white/20 hover:text-white w-full text-left border border-white/10 hover:border-white/30">
                  <MdHome className="text-lg" />
                  <span>Home</span>
                </button>

                {/* Dashboard button for mobile */}
                <button
                  onClick={() => {
                    console.log("Mobile dashboard button clicked");
                    if (setMobileMenuOpen) {
                      setMobileMenuOpen(false);
                    } else {
                      setLocalMobileMenuOpen(false);
                    }
                    // Proper routing for admin vs customer
                    if (hasRole("admin")) {
                      navigate("/admin/account-holders");
                    } else {
                      navigate("/dashboard");
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left border hover:border-white/30 ${
                    location.pathname === "/dashboard"
                      ? "bg-gradient-to-r from-blue-600/50 to-cyan-600/50 text-white border-white/30"
                      : "text-blue-100 hover:bg-white/20 hover:text-white border-white/10"
                  }`}>
                  <MdDashboard className="text-lg" />
                  <span>Dashboard</span>
                </button>

                {/* Profile Settings button for mobile */}
                <button
                  onClick={() => {
                    console.log("Mobile profile settings button clicked");
                    if (setMobileMenuOpen) {
                      setMobileMenuOpen(false);
                    } else {
                      setLocalMobileMenuOpen(false);
                    }
                    navigate("/dashboard/profile");
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left border hover:border-white/30 ${
                    location.pathname === "/dashboard/profile"
                      ? "bg-gradient-to-r from-blue-600/50 to-cyan-600/50 text-white border-white/30"
                      : "text-blue-100 hover:bg-white/20 hover:text-white border-white/10"
                  }`}>
                  <FaUser className="text-lg" />
                  <span>Profile Settings</span>
                </button>

                {/* Admin sections for admin users */}
                {hasRole("admin") && adminSections && (
                  <div className="pt-2 border-t border-white/20 mt-2">
                    <h3 className="text-xs font-semibold text-blue-200 mb-2 uppercase tracking-wide px-4">
                      Admin Panel
                    </h3>
                    {adminSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          console.log(
                            `Mobile: Clicked ${section.name} (${section.id})`
                          );
                          // Call the setActiveSection function passed from AdminPage
                          setActiveSection(section.id);
                          // Close the mobile menu
                          if (setMobileMenuOpen) {
                            setMobileMenuOpen(false);
                          } else {
                            setLocalMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-left ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                        }`}>
                        <section.icon className="text-lg" />
                        <div>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs opacity-75">
                            {section.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Note: Removed duplicate navigation list for non-admin users to avoid showing Dashboard twice in mobile menu */}
              </div>

              {/* Logout button for admin users in mobile menu */}
              {hasRole("admin") && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      console.log("Mobile logout button clicked");
                      if (setMobileMenuOpen) {
                        setMobileMenuOpen(false);
                      } else {
                        setLocalMobileMenuOpen(false);
                      }
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-red-100 hover:bg-red-500/20 hover:text-red-300 w-full text-left">
                    <FaSignOutAlt className="text-lg" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Removed duplicate bottom greeting block to prevent repeated greeting in mobile menu */}
            </div>
          )}
      </div>

      {/* Session Warning Banner */}
      {sessionWarning && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500 text-yellow-900 px-4 py-2 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaClock className="animate-pulse" />
              <span className="text-sm font-medium">
                Session expires in {Math.ceil(sessionTimeRemaining / 60000)}{" "}
                minutes. Click anywhere to extend your session.
              </span>
            </div>
            <button
              onClick={() => setSessionWarning(false)}
              className="text-yellow-900 hover:text-yellow-700">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Custom Notification Modal */}
      {notification && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[10001] p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200/50 transform transition-all duration-300 scale-100">
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-600"
                    : notification.type === "warning"
                      ? "bg-yellow-100 text-yellow-600"
                      : notification.type === "error"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                }`}>
                <notification.icon className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={closeNotification}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <FaTimes className="text-lg" />
              </button>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeNotification}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
