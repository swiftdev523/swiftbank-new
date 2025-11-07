import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEye, FaEyeSlash, FaBullseye } from "react-icons/fa";
import { motion } from "framer-motion";

const HeroSection = ({ heroRef }) => {
  const navigate = useNavigate();
  const { login, hasRole } = useAuth();

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [isLogging, setIsLogging] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    setLoginError("");

    const result = await login(loginForm.username, loginForm.password);

    if (result.success) {
      // Wait a moment for auth context to update, then check role and redirect appropriately
      setTimeout(() => {
        if (hasRole("admin")) {
          console.log(
            "HeroSection - Admin user detected, redirecting to admin area"
          );
          navigate("/admin");
        } else {
          console.log(
            "HeroSection - Customer user, redirecting to customer dashboard"
          );
          navigate("/dashboard");
        }
      }, 100);
    } else {
      setLoginError(result.error);
    }
    setIsLogging(false);
  };

  const handleOpenAccount = () => {
    const accountInfo = `
�️ Open Your Swift Bank Account Today!

To get started, visit any Swift Bank branch near you:

📍 Available Locations:
• Downtown Branch - 123 Main Street
• Westside Branch - 456 Oak Avenue  
• Northtown Branch - 789 Pine Road

📋 What to Bring:
✓ Valid Government ID
✓ Social Security Card
✓ Proof of Address (utility bill/lease)
✓ Initial Deposit ($25 minimum)

� Account Types Available:
• Checking Accounts (Free with direct deposit)
• Savings Accounts (High interest rates)
• Business Banking Solutions
• Student Accounts (No monthly fees)

Our friendly staff will help you choose the perfect account for your needs!

Call 1-800-CL-BANK or visit any branch today!
    `.trim();
    alert(accountInfo);
  };

  const scrollToLogin = () => {
    document.querySelector(".login-card").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={heroRef}
      className="relative z-10 container mx-auto px-4 py-20 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        transition={{ duration: 1.0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Main Content */}
        <div>
          <div className="space-y-6">
            <div className="hero-badge inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <FaShieldAlt className="text-blue-300" />
              <span className="text-blue-100 text-sm font-medium">
                FDIC Insured • Secure Banking
              </span>
            </div>

            <h1 className="hero-title text-5xl lg:text-6xl font-bold text-white leading-tight">
              Your Money,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>

            <p className="hero-subtitle text-xl text-blue-100 max-w-2xl leading-relaxed">
              Experience the future of banking with our intelligent platform.
              Manage your finances with precision, security, and style.
            </p>
          </div>

          <div className="hero-cta flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleOpenAccount}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
              Open New Account
            </button>
            <button
              onClick={scrollToLogin}
              className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer">
              Existing Customer Login
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center space-x-8 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">256-bit</div>
              <div className="text-blue-300 text-sm">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">FDIC</div>
              <div className="text-blue-300 text-sm">Insured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-blue-300 text-sm">Support</div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Card */}
        <div>
          <div className="login-card bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Quick Login
              </h3>
              <p className="text-gray-600">Access your account instantly</p>
            </div>

            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLogging}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50">
                {isLogging ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
