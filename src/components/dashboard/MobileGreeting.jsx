import React from "react";

const MobileGreeting = ({ userName }) => {
  const getGreeting = () => {
    // Get current time in US Eastern Time (ET)
    const now = new Date();
    const usEasternTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(now);

    const hour = parseInt(usEasternTime);

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  return (
    <div className="block sm:hidden mb-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 font-medium">{getGreeting()},</p>
        <p className="font-bold text-lg text-gray-800">{userName}</p>
      </div>
    </div>
  );
};

export default MobileGreeting;
