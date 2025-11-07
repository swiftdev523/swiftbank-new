import React from "react";
import { motion } from "motion/react";
import { FaLock } from "react-icons/fa";

const TechnologyShowcase = () => {
  return (
    <motion.section
      className="relative z-10 py-20"
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Cutting-Edge Banking Technology
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Experience the latest in financial technology with our
            state-of-the-art banking solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Modern mobile banking app interface"
              className="rounded-2xl shadow-2xl w-full h-80 object-cover"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white">
              Revolutionary Mobile Banking
            </h3>
            <p className="text-blue-100 text-lg leading-relaxed">
              Experience banking like never before with our intuitive mobile app
              that puts the power of a full-service bank in your pocket.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✓</span>
                <span className="text-white">
                  Instant transfers and payments
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✓</span>
                <span className="text-white">Mobile check deposit</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✓</span>
                <span className="text-white">Biometric security</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h3 className="text-3xl font-bold text-white">
              Advanced Security & Analytics
            </h3>
            <p className="text-blue-100 text-lg leading-relaxed">
              Stay protected with our military-grade security and gain insights
              into your spending patterns with AI-powered financial analytics.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaLock className="text-blue-400" />
                <span className="text-white">256-bit encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">📊</span>
                <span className="text-white">Smart spending insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">🛡️</span>
                <span className="text-white">Fraud protection</span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Advanced banking security and analytics dashboard"
              className="rounded-2xl shadow-2xl w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TechnologyShowcase;
