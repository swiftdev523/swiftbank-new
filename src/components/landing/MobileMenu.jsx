import React from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaTimes, FaCreditCard, FaLock } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

const MobileMenu = ({ isOpen, onClose }) => {
  const { settings } = useWebsiteSettings();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Menu Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 max-w-sm bg-white/95 backdrop-blur-md shadow-xl"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between p-6 border-b border-gray-200"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaBuilding className="text-white text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {settings?.bankName || "Swift Bank"}
                    </h2>
                    <p className="text-xs text-gray-600">
                      {settings?.tagline || "Digital Banking"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaTimes className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Menu Items */}
              <div className="flex-1 py-6">
                <div className="space-y-1 px-6">
                  <motion.a
                    href="#services"
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}>
                    <FaCreditCard className="w-5 h-5" />
                    <span className="font-medium">Services</span>
                  </motion.a>
                  <motion.a
                    href="#about"
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}>
                    <FaCreditCard className="w-5 h-5" />
                    <span className="font-medium">About</span>
                  </motion.a>
                </div>
              </div>

              {/* Login Button */}
              <motion.div
                className="p-6 border-t border-gray-200"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                  <FaLock className="w-4 h-4" />
                  <span>Login to Banking</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
