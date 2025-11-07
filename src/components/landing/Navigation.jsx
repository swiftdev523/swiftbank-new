import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import MobileMenu from "./MobileMenu";
import bankLogo from "/bank-logo.png";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

const Navigation = () => {
  const { settings } = useWebsiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAboutClick = () => {
    alert(
      "For detailed information about Swift Bank, our history, mission, and values, please visit any of our branch locations or call 1-800-SWIFT-BANK. Our staff will be happy to provide you with comprehensive information about our institution!"
    );
  };

  return (
    <>
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5">
                <img
                  src={bankLogo}
                  alt={`${settings?.bankName || "Swift Bank"} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {settings?.bankName || "Swift Bank"}
                </h1>
                <p className="text-xs text-blue-200">
                  {settings?.tagline || "Digital Banking"}
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}>
              <a
                href="#services"
                className="text-white/80 hover:text-white transition-colors cursor-pointer">
                Services
              </a>
              <a
                href="#about"
                className="text-white/80 hover:text-white transition-colors cursor-pointer">
                About
              </a>

              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
                Login
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                <FaBars className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

export default Navigation;
