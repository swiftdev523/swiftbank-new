import React from "react";
import {
  FaShieldAlt,
  FaGem,
  FaPlane,
  FaStar,
  FaPercentage,
  FaPhone,
  FaGlobe,
  FaMobile,
} from "react-icons/fa";

const AccountBenefits = () => {
  const accountBenefits = [
    {
      icon: FaShieldAlt,
      title: "FDIC Insured",
      description: "Your deposits are protected up to $250,000",
      bgColor: "bg-green-50",
      color: "text-green-600",
    },
    {
      icon: FaGem,
      title: "Premium Rewards",
      description: "Earn 2% cash back on all purchases",
      bgColor: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      icon: FaPlane,
      title: "Travel Benefits",
      description: "No foreign transaction fees worldwide",
      bgColor: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      icon: FaStar,
      title: "VIP Status",
      description: "Priority customer service & perks",
      bgColor: "bg-yellow-50",
      color: "text-yellow-600",
    },
    {
      icon: FaPercentage,
      title: "High Interest",
      description: "Competitive savings rates up to 4.5% APY",
      bgColor: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      icon: FaPhone,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
      bgColor: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      icon: FaGlobe,
      title: "Global Access",
      description: "Access your money from anywhere",
      bgColor: "bg-cyan-50",
      color: "text-cyan-600",
    },
    {
      icon: FaMobile,
      title: "Mobile Banking",
      description: "Advanced mobile app features",
      bgColor: "bg-pink-50",
      color: "text-pink-600",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-100/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaShieldAlt className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Account Benefits</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accountBenefits.map((benefit, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl hover:scale-105 transition-all duration-300 ${benefit.bgColor} border border-gray-100/50`}>
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${benefit.bgColor.replace(
                  "50",
                  "100"
                )}`}>
                <benefit.icon className={`text-sm ${benefit.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm mb-1">
                  {benefit.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountBenefits;
