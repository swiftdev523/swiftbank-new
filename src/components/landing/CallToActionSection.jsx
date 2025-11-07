import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const CallToActionSection = () => {
  return (
    <motion.section
      className="relative z-10 py-20 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Transform Your Banking Experience?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers who have already made the switch
          to smarter banking
        </p>
        <div>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Open Your Account Today
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default CallToActionSection;
