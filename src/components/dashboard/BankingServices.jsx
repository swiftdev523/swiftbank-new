import React from "react";
import {
  FaCreditCard,
  FaShieldAlt,
  FaFileAlt,
  FaMobile,
  FaCalculator,
  FaPhone,
  FaBell,
  FaLock,
  FaHistory,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaPercentage,
  FaHandshake,
  FaGlobe,
} from "react-icons/fa";

const BankingServices = ({ onServiceClick }) => {
  const bankingServices = [
    {
      icon: FaCreditCard,
      title: "Card Controls",
      description: "Manage your debit/credit cards",
      action: "card-controls",
      color: "blue",
    },
    {
      icon: FaShieldAlt,
      title: "Security Center",
      description: "Account security & alerts",
      action: "security",
      color: "green",
    },
    {
      icon: FaFileAlt,
      title: "Statements",
      description: "Download monthly statements",
      action: "statements",
      color: "purple",
    },
    {
      icon: FaMobile,
      title: "Mobile Banking",
      description: "Download our mobile app",
      action: "mobile-app",
      color: "indigo",
    },
    {
      icon: FaCalculator,
      title: "Loan Calculator",
      description: "Calculate loan payments",
      action: "loan-calculator",
      color: "yellow",
    },
    {
      icon: FaPhone,
      title: "Customer Support",
      description: "24/7 customer service",
      action: "support",
      color: "red",
    },
    {
      icon: FaBell,
      title: "Notifications",
      description: "Manage account alerts",
      action: "notifications",
      color: "pink",
    },
    {
      icon: FaLock,
      title: "Account Details",
      description: "View routing & account numbers",
      action: "account-details",
      color: "gray",
    },
    {
      icon: FaHistory,
      title: "Transaction Export",
      description: "Export transaction history",
      action: "export-transactions",
      color: "teal",
    },
    {
      icon: FaDownload,
      title: "Tax Documents",
      description: "Download tax forms",
      action: "tax-documents",
      color: "orange",
    },
    {
      icon: FaEye,
      title: "Account Monitoring",
      description: "Real-time account monitoring",
      action: "monitoring",
      color: "cyan",
    },
    {
      icon: FaCalendarAlt,
      title: "Schedule Transfer",
      description: "Set up recurring transfers",
      action: "schedule-transfer",
      color: "emerald",
    },
    {
      icon: FaPercentage,
      title: "Interest Rates",
      description: "View current rates",
      action: "interest-rates",
      color: "lime",
    },
    {
      icon: FaHandshake,
      title: "Personal Banker",
      description: "Connect with your banker",
      action: "personal-banker",
      color: "amber",
    },
    {
      icon: FaGlobe,
      title: "International",
      description: "International banking services",
      action: "international",
      color: "rose",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      green:
        "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      purple:
        "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      indigo:
        "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      yellow:
        "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
      red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
      gray: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
      teal: "from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
      orange:
        "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      cyan: "from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700",
      emerald:
        "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      lime: "from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700",
      amber:
        "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      rose: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700",
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Banking Services</h2>
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <FaCreditCard className="text-white text-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankingServices.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <button
              key={index}
              onClick={() => onServiceClick(service.action)}
              className={`bg-gradient-to-r ${getColorClasses(
                service.color
              )} text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg group text-left`}>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <IconComponent className="text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white mb-1 group-hover:text-gray-100">
                    {service.title}
                  </h3>
                  <p className="text-xs text-white/80 group-hover:text-white/90 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BankingServices;
