import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const NotificationSystem = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const { title, message, type, icon: IconComponent } = notification;

  const getNotificationStyles = (type) => {
    const styles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };
    return styles[type] || styles.info;
  };

  const getIconStyles = (type) => {
    const styles = {
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-yellow-600",
      info: "text-blue-600",
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-in">
      <div
        className={`border rounded-lg shadow-lg p-4 ${getNotificationStyles(
          type
        )} backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          {IconComponent && (
            <div className={`flex-shrink-0 mt-0.5 ${getIconStyles(type)}`}>
              <IconComponent className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-sm mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;
