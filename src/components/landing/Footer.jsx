import React from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaBriefcase,
} from "react-icons/fa";
import bankLogo from "/bank-logo.png";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

const Footer = () => {
  const { settings } = useWebsiteSettings();
  const handleHelpCenter = () => {
    alert(
      "For comprehensive help and support, please visit any Swift Bank branch where our trained staff can assist you with all your banking needs. You can also call our 24/7 support line at 1-800-CL-BANK."
    );
  };

  const handleBranchLocations = () => {
    const supportInfo = `
�️ Swift Bank Customer Support

For the best service, we recommend visiting our branches:

📍 Branch Locations & Hours:

Downtown Branch
123 Main Street, City Center
📞 (555) 123-4567
⏰ Mon-Fri: 9:00 AM - 5:00 PM, Sat: 9:00 AM - 2:00 PM

Westside Branch
456 Oak Avenue, Westside Mall  
📞 (555) 234-5678
⏰ Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 3:00 PM

Northtown Branch
789 Pine Road, Northtown Plaza
📞 (555) 345-6789
⏰ Mon-Fri: 8:30 AM - 5:30 PM, Sat: 9:00 AM - 2:00 PM

Our branch staff can help with:
✓ Account opening & management
✓ Loan applications & approvals
✓ Investment planning
✓ Technical support
✓ Personalized financial advice

📞 24/7 Phone Support: 1-800-CL-BANK
    `.trim();
    alert(supportInfo);
  };

  const handleSecurity = () => {
    alert(
      "For detailed security information, fraud protection resources, and security best practices, please visit any Swift Bank branch or call 1-800-CL-BANK. Our security specialists can provide you with comprehensive guidance on keeping your accounts safe."
    );
  };

  const handlePrivacyPolicy = () => {
    alert(
      "Our Privacy Policy and terms of service documents are available at all Swift Bank branch locations. Please visit your nearest branch or call 1-800-CL-BANK to request these important documents and learn about how we protect your personal information."
    );
  };

  return (
    <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                <img
                  src={bankLogo}
                  alt={`${settings?.bankName || "Swift Bank"} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white font-bold">
                {settings?.bankName || "Swift Bank"}
              </span>
            </div>
            <p className="text-blue-200 text-sm">
              {settings?.description ||
                "Your trusted partner in digital banking innovation."}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>Personal Banking</li>
              <li>Business Solutions</li>
              <li>Investment Services</li>
              <li>Loans & Credit</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>
                <button
                  onClick={handleHelpCenter}
                  className="text-blue-200 hover:text-white transition-colors text-left cursor-pointer">
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={handleBranchLocations}
                  className="text-blue-200 hover:text-white transition-colors text-left cursor-pointer">
                  Visit Nearest Branch
                </button>
              </li>
              <li>
                <button
                  onClick={handleSecurity}
                  className="text-blue-200 hover:text-white transition-colors text-left cursor-pointer">
                  Security
                </button>
              </li>
              <li>
                <button
                  onClick={handlePrivacyPolicy}
                  className="text-blue-200 hover:text-white transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <Link
                  to="/developer/setup"
                  className="text-blue-200 hover:text-white transition-colors text-left cursor-pointer opacity-70 text-xs">
                  Developer Setup
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/test"
                  className="text-blue-200 hover:text-white transition-colors text-left cursor-pointer opacity-70 text-xs">
                  Test Authentication
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">New Customers</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li className="flex items-center gap-2">
                <FaBuilding className="text-blue-400" /> Visit Any{" "}
                {settings?.bankName || "Swift Bank"} Branch
              </li>
              <li className="flex items-center gap-2">
                <FaBuilding className="text-blue-400" /> Find Locations Near You
              </li>
              <li className="flex items-center gap-2">
                <FaBriefcase className="text-blue-400" /> Personal Banking
                Services
              </li>
              <li className="flex items-center gap-2">
                <FaBuilding className="text-blue-400" /> Expert Financial Advice
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-blue-200 text-sm">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {settings?.bankName || "Swift Bank"}. All rights reserved. Member
            FDIC.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
