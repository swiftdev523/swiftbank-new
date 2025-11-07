import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FaUserShield,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaExclamationTriangle,
} from "react-icons/fa";
import clbg3 from "../assets/images/clbg3.jpg";
import bankLogo from "/bank-logo.png";
import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

const AdminLoginPage = () => {
  const { settings } = useWebsiteSettings();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const { login, user, hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && hasRole("admin")) {
      const from = location.state?.from?.pathname || "/admin/account-holders";
      navigate(from, { replace: true });
    } else if (isAuthenticated && !hasRole("admin")) {
      // User is logged in but doesn't have admin access
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, hasRole, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(username, password);

      if (success) {
        // Check if the logged-in user has admin access
        // Note: We need to check after login since the user context updates
        setTimeout(() => {
          const from =
            location.state?.from?.pathname || "/admin/account-holders";
          navigate(from, { replace: true });
        }, 100);
      } else {
        setAttempts((prev) => prev + 1);
        setError(
          "Invalid admin credentials. Please check your username and password."
        );
      }
    } catch (err) {
      setAttempts((prev) => prev + 1);
      setError("Login failed. Please try again.");
      console.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${clbg3})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-indigo-900/90"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img
              src={bankLogo}
              alt={settings?.bankName || "Swift Bank"}
              className="h-16 w-16 mr-3"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {settings?.bankName || "Swift Bank"}
              </h1>
              <p className="text-blue-200 text-sm">
                {settings?.adminTagline || settings?.tagline || "Admin Portal"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
              <FaUserShield className="text-white text-2xl" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Administrator Access
          </h2>
          <p className="text-blue-200">Secure portal for bank administrators</p>
        </div>

        {/* Login form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Security warning */}
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-yellow-100 text-sm font-medium">
                Authorized personnel only
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter admin username"
                  disabled={isLoading}
                />
                <FaUserShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter admin password"
                  disabled={isLoading}
                />
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                  disabled={isLoading}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
                {attempts >= 3 && (
                  <p className="text-red-300 text-xs mt-1">
                    Multiple failed attempts detected. Please contact system
                    administrator.
                  </p>
                )}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Access Admin Panel"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            © {new Date().getFullYear()} {settings?.bankName || "Swift Bank"}.
            All rights reserved.
          </p>
          <p className="text-blue-300 text-xs mt-1">
            Secured by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
