import React from "react";
import { motion } from "motion/react";
import clbg3 from "../../assets/images/clbg3.jpg";
import { FaBuilding, FaStar, FaPhone } from "react-icons/fa";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

const AboutSection = () => {
  const { settings } = useWebsiteSettings();
  const handleContactCorporate = () => {
    alert(
      "For comprehensive company information, annual reports, investor relations, and detailed corporate data, please visit any Swift Bank branch or call 1-800-CL-BANK. Our representatives will provide you with all the information you need about our institution."
    );
  };

  return (
    <section
      id="about"
      className="relative z-10 py-20 overflow-hidden"
      style={{
        backgroundImage: `url(${clbg3})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-slate-100/95"></div>
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            About {settings?.bankName || "Swift Bank"}
          </h2>
          <p className="text-xl text-slate-700 mb-8 leading-relaxed">
            For over 15 years, {settings?.bankName || "Swift Bank"} has been at
            the forefront of digital banking innovation, serving customers with
            integrity, security, and excellence.
          </p>

          {/* Professional Banking Team Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80"
              alt="Professional banking team and modern office"
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">
                Our Mission
              </h3>
              <p className="text-gray-500">
                To provide exceptional banking services with cutting-edge
                technology and personalized customer care.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">
                Our Values
              </h3>
              <p className="text-gray-500">
                Security, transparency, and innovation drive everything we do
                for our valued customers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">
                Our Promise
              </h3>
              <p className="text-gray-500">
                To deliver world-class banking experiences that exceed
                expectations and build lasting relationships.
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <p className="text-blue-100 mb-4">
              <strong className="text-gray-600">
                For detailed company information, annual reports, and investor
                relations,
              </strong>
            </p>
            <button
              onClick={handleContactCorporate}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center gap-2 mx-auto">
              <FaPhone /> Contact Our Corporate Office
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
