import React, { memo } from "react";
import { MdHome, MdAccountBalance, MdPerson } from "react-icons/md";
import { useMobileViewport } from "../../hooks/usePerformance";

const MobileNavigation = memo(({ handleMobileNavigation }) => {
  const { isMobile } = useMobileViewport();
  const navigationItems = [
    {
      icon: MdHome,
      label: "Home",
      color: "blue",
    },
    {
      icon: MdAccountBalance,
      label: "Cards",
      color: "green",
    },
    {
      icon: MdPerson,
      label: "Profile",
      color: "gray",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      gray: "text-gray-600 bg-gray-50",
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-30 lg:hidden mobile-navigation gpu-accelerated">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleMobileNavigation(item.label)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 touch-target ${getColorClasses(
                item.color
              )}`}
              style={{
                transform: "translateZ(0)",
                willChange: "transform",
                touchAction: "manipulation",
              }}>
              <div className="p-2 rounded-full gpu-accelerated">
                <IconComponent className="text-xl" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

MobileNavigation.displayName = "MobileNavigation";

export default MobileNavigation;
