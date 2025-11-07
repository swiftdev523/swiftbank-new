import React from "react";
import { motion } from "motion/react";
import { FaCreditCard, FaMobile, FaLock } from "react-icons/fa";

const FeaturesSection = () => {
  return (
    <motion.section
      id="services"
      className="relative z-10 py-20"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Banking Reimagined for the Digital Age
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover a suite of powerful financial tools designed to simplify
            your banking experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature-card bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <FaCreditCard className="text-white text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Cards
            </h3>
            <p className="text-blue-200">
              Advanced security with contactless payments and real-time
              notifications
            </p>
          </div>

          <div className="feature-card bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <FaMobile className="text-white text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Mobile Banking
            </h3>
            <p className="text-blue-200">
              Bank anywhere, anytime with our award-winning mobile application
            </p>
          </div>

          <div className="feature-card bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <FaLock className="text-white text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Security First
            </h3>
            <p className="text-blue-200">
              Military-grade encryption and biometric authentication for
              ultimate protection
            </p>
          </div>

          <div className="feature-card bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Analytics
            </h3>
            <p className="text-blue-200">
              AI-powered insights to help you make better financial decisions
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
