import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDeveloper } from "../../context/DeveloperContext";
import { FaCode, FaEye, FaEyeSlash, FaShieldAlt, FaLock } from "react-icons/fa";
import clbg2 from "../../assets/images/clbg2.jpg";

const DeveloperLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loginDeveloper,
    isDeveloperAuthenticated,
    isLoading,
    isLocked,
    remainingAttempts,
  } = useDeveloper();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isDeveloperAuthenticated) {
      const from = location.state?.from?.pathname || "/developer/dashboard";
      navigate(from, { replace: true });
    }
  }, [isDeveloperAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setErrors({ submit: "Account is locked. Please try again later." });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await loginDeveloper(formData.email, formData.password);
      const from = location.state?.from?.pathname || "/developer/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Developer login error:", error);
      setErrors({ submit: error.message || "Login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${clbg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-xl"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-xl"
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaCode className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Developer Portal
            </h1>
            <p className="text-gray-300">Access the developer dashboard</p>
          </div>

          {/* Account Lockout Warning */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center text-red-300">
                <FaLock className="mr-2" />
                <span className="font-medium">Account Locked</span>
              </div>
              <p className="text-red-200 text-sm mt-1">
                Too many failed attempts. Please try again later.
              </p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Developer Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLocked || isSubmitting}
                className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-lg rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-white/20"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="developer@company.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLocked || isSubmitting}
                  className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-lg rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${
                    errors.password ? "border-red-500" : "border-white/20"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </motion.div>
            )}

            {/* Login Attempts Warning */}
            {!isLocked && remainingAttempts < 3 && remainingAttempts > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  Warning: {remainingAttempts} attempt
                  {remainingAttempts !== 1 ? "s" : ""} remaining
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {isSubmitting || isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FaShieldAlt />
                  <span>Access Developer Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-gray-400 text-sm">
              Need access?{" "}
              <Link
                to="/"
                className="text-blue-400 hover:text-blue-300 transition-colors">
                Return to main site
              </Link>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Developer authentication required
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeveloperLoginPage;
