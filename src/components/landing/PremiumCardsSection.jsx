import React from "react";
import { motion } from "motion/react";
import clbg6 from "../../assets/images/clbg6.jpg";
import { FaCreditCard, FaLock, FaGift } from "react-icons/fa";

const PremiumCardsSection = () => {
  const handleApplyForCards = () => {
    alert(
      "To apply for our premium banking cards, please visit any Swift Bank branch. Our card specialists will help you choose the perfect card for your lifestyle and needs!"
    );
  };

  return (
    <motion.section
      className="relative z-10 py-20 overflow-hidden"
      style={{
        backgroundImage: `url(${clbg6})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Premium Banking Cards
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Experience the convenience of modern banking with our range of
              premium debit and credit cards, featuring contactless payments and
              advanced security features.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaCreditCard className="text-yellow-400" />
                <span className="text-white">Contactless payments</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaLock className="text-yellow-400" />
                <span className="text-white">Advanced chip technology</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCreditCard className="text-yellow-400" />
                <span className="text-white">Global acceptance</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaGift className="text-yellow-400" />
                <span className="text-white">Exclusive rewards program</span>
              </div>
            </div>
            <button
              onClick={handleApplyForCards}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
              Apply for Cards
            </button>
          </div>
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Premium banking credit and debit cards"
              className="rounded-2xl shadow-2xl w-full max-w-md h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PremiumCardsSection;
