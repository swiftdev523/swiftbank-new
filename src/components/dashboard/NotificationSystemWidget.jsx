import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaCreditCard,
  FaShieldAlt,
  FaMoneyBillWave,
  FaUserPlus,
  FaCog,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaFilter,
} from "react-icons/fa";

const NotificationSystemWidget = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - in real app this would come from backend
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: "security",
        priority: "high",
        title: "New Device Login",
        message: "Login from Windows PC in New York, NY",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        icon: FaShieldAlt,
        color: "red",
        action: "Review Login",
      },
      {
        id: 2,
        type: "transaction",
        priority: "medium",
        title: "Payment Received",
        message: "$2,450.00 deposited to your checking account",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        icon: FaMoneyBillWave,
        color: "green",
        action: "View Transaction",
      },
      {
        id: 3,
        type: "account",
        priority: "low",
        title: "Monthly Statement Ready",
        message: "Your November statement is now available",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        icon: FaInfoCircle,
        color: "blue",
        action: "Download PDF",
      },
      {
        id: 4,
        type: "security",
        priority: "medium",
        title: "Password Expires Soon",
        message: "Your password will expire in 7 days",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        icon: FaExclamationTriangle,
        color: "yellow",
        action: "Change Password",
      },
      {
        id: 5,
        type: "service",
        priority: "low",
        title: "New Feature Available",
        message: "Try our new mobile check deposit feature",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: false,
        icon: FaCreditCard,
        color: "purple",
        action: "Learn More",
      },
      {
        id: 6,
        type: "account",
        priority: "high",
        title: "Low Balance Alert",
        message: "Checking account balance is below $100",
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        read: false,
        icon: FaExclamationTriangle,
        color: "red",
        action: "Add Funds",
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter((n) => !n.read).length);
  }, []);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "security":
        return FaShieldAlt;
      case "transaction":
        return FaMoneyBillWave;
      case "account":
        return FaInfoCircle;
      case "service":
        return FaCog;
      default:
        return FaBell;
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const displayedNotifications = showAll
    ? filteredNotifications
    : filteredNotifications.slice(0, 3);

  const filterOptions = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    {
      key: "security",
      label: "Security",
      count: notifications.filter((n) => n.type === "security").length,
    },
    {
      key: "transaction",
      label: "Transactions",
      count: notifications.filter((n) => n.type === "transaction").length,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FaBell className="w-5 h-5 text-blue-600" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
            <p className="text-sm text-gray-500">
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Mark all read
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <FaCog className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === option.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 mb-4">
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaBell className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No notifications to show</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  notification.read
                    ? "bg-white border-gray-200"
                    : getPriorityColor(notification.priority)
                }`}>
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-${notification.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <IconComponent
                      className={`w-4 h-4 text-${notification.color}-600`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-semibold ${
                            notification.read
                              ? "text-gray-800"
                              : "text-gray-900"
                          }`}>
                          {notification.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Mark as read">
                            <FaEye className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete notification">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {notification.action && (
                      <button
                        className={`text-xs text-${notification.color}-600 hover:text-${notification.color}-700 font-medium mt-2`}>
                        {notification.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View More/Less Button */}
      {filteredNotifications.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm">
          {showAll
            ? "Show Less"
            : `View All ${filteredNotifications.length} Notifications`}
        </button>
      )}
    </div>
  );
};

export default NotificationSystemWidget;
