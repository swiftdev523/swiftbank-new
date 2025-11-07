import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaLock,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";
import { useWebsiteSettings } from "../context/WebsiteSettingsContext";
import clbg4 from "../assets/images/clbg4.jpg";
import bankLogo from "/bank-logo.png";

const LoginPage = () => {
  const { settings } = useWebsiteSettings();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, login, isLoading, hasRole } = useAuth();
  // Create mock sessionData for backward compatibility
  const sessionData = { isLocked: false, loginAttempts: 0 };
  // Normalize lockout/session flags from AuthContext
  const isLocked = Boolean(sessionData?.isLocked);
  const loginAttempts = Number(sessionData?.loginAttempts || 0);
  const location = useLocation();
  const navigate = useNavigate();

  // Get the intended destination after login
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Clear any previous errors when component mounts
    setError("");
  }, []);

  // Redirect if already authenticated - let route protection handle the specific routing
  if (user) {
    console.log(
      "LoginPage - User already authenticated, redirecting to appropriate dashboard"
    );
    // Let CustomerRoute and AdminRoute components handle the role-based routing
    if (hasRole("admin")) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Enhanced client-side validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Wait a moment for auth context to update, then check role
        setTimeout(() => {
          if (hasRole("admin")) {
            navigate("/admin", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }, 100);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      // Clear password on failed attempt for security
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${clbg4})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Professional Banking Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90"></div>

      {/* Remove old Unsplash background */}
      {/* <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="Modern banking building and financial district"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90"></div>
      </div> */}

      {/* Background animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7,
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.4,
          }}
        />
      </div>

      {/* Back to Home Link */}
      <div className="absolute top-8 left-8 z-50">
        <Link
          to="/"
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="login-container max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}>
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-2xl p-4">
              <img
                src={bankLogo}
                alt={`${settings?.bankName || "Swift Bank"} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {settings?.bankName || "Swift Bank"}
            </h1>
            <p className="text-blue-200">
              {settings?.tagline || "Secure Online Banking Portal"}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Sign in to access your account
            </p>

            {/* Account Lockout Warning */}
            {isLocked && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                <FaExclamationTriangle className="text-red-600" />
                <div>
                  <p className="font-semibold">Account Temporarily Locked</p>
                  <p className="text-sm">
                    Too many failed login attempts. Please wait 15 minutes
                    before trying again.
                  </p>
                </div>
              </div>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && !isLocked && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                <FaExclamationTriangle className="text-yellow-600" />
                <div>
                  <p className="text-sm">
                    {loginAttempts} failed attempt{loginAttempts > 1 ? "s" : ""}
                    .{3 - loginAttempts} attempt
                    {3 - loginAttempts !== 1 ? "s" : ""} remaining before
                    account lockout.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                <FaExclamationTriangle className="text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80"
                  placeholder="Enter your email address"
                  disabled={isLoading || isLocked}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80"
                    placeholder="Enter your password"
                    disabled={isLoading || isLocked}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    disabled={isLoading || isLocked}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLocked || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center space-x-2">
                {isLoading || isSubmitting ? (
                  <>
                    <LoadingSpinner
                      size="sm"
                      showMessage={false}
                      variant="white"
                    />
                    <span>Authenticating...</span>
                  </>
                ) : isLocked ? (
                  <>
                    <FaLock />
                    <span>Account Locked</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                  </>
                )}
              </button>
              {error && (
                <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* Additional Links */}
            <div className="mt-8 text-center space-y-4">
              <a
                href="#"
                className="block text-sm text-blue-600 hover:text-blue-800 font-medium">
                Forgot your password?
              </a>

              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <span>🔒</span>
                <span>Your connection is secure and encrypted</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
