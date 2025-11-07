import React from "react";
import {
  FaCreditCard,
  FaLock,
  FaMobile,
  FaBell,
  FaCog,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";

const CardsServicesWidget = ({ onServiceClick }) => {
  const cardServices = [
    {
      id: "virtual-cards",
      icon: FaCreditCard,
      title: "Virtual Cards",
      description: "Create instant virtual cards for secure online purchases",
      color: "from-emerald-500 to-emerald-600",
      badge: "New",
    },
    {
      id: "debit-cards",
      icon: FaCreditCard,
      title: "Debit Cards",
      description: "Manage your physical and digital debit cards",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "manage-debit-card",
      icon: FaCog,
      title: "Manage Debit Card",
      description: "Lock/unlock, set limits, and customize your card settings",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "travel-notification",
      icon: FaBell,
      title: "Travel Notification",
      description: "Notify us of your travel plans to avoid card blocks",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "credit-card-repayment",
      icon: FaArrowRight,
      title: "Credit Card Repayment",
      description: "Make payments to your credit cards from any account",
      color: "from-red-500 to-red-600",
    },
    {
      id: "prepaid-card-topup",
      icon: FaPlus,
      title: "Prepaid Card TopUp",
      description: "Add funds to your prepaid cards and gift cards",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const handleServiceClick = (serviceId) => {
    if (onServiceClick) {
      onServiceClick(serviceId);
    } else {
      // Default behavior - show info about the service
      console.log(`${serviceId} clicked`);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaCreditCard className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Card Services</h2>
            <p className="text-gray-600 text-sm">
              Manage your cards and payments
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
          <FaLock className="text-green-500" />
          <span>Secure</span>
        </div>
      </div>

      {/* Mobile-First Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {cardServices.map((service) => {
          const IconComponent = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className={`group relative bg-gradient-to-r ${service.color} text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-left overflow-hidden`}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-6 translate-y-6"></div>
              </div>

              {/* Badge */}
              {service.badge && (
                <div className="absolute top-2 right-2">
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {service.badge}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                    <IconComponent className="text-lg" />
                  </div>
                  <FaArrowRight className="text-white/60 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <h3 className="font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">
                  {service.title}
                </h3>

                <p className="text-sm text-white/80 group-hover:text-white/90 transition-colors leading-relaxed">
                  {service.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Action Bar */}
      <div className="flex sm:hidden mt-6 pt-4 border-t border-gray-200">
        <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
          <FaMobile className="text-lg" />
          <span className="font-medium">Mobile App</span>
        </button>
      </div>

      {/* Quick Stats for larger screens */}
      <div className="hidden lg:flex mt-6 pt-4 border-t border-gray-200 justify-between text-center">
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-800">3</div>
          <div className="text-xs text-gray-600">Active Cards</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-800">$2,450</div>
          <div className="text-xs text-gray-600">Monthly Spend</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-green-600">2.5%</div>
          <div className="text-xs text-gray-600">Cashback Rate</div>
        </div>
      </div>
    </div>
  );
};

export default CardsServicesWidget;
