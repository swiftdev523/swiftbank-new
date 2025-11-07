import React from "react";

const NotificationModal = ({ title, message, icon: Icon, type, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold">
          ×
        </button>
        <div className="flex items-center space-x-3 mb-4">
          {Icon && <Icon className="text-2xl text-blue-600" />}
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-700 text-sm leading-relaxed mb-2">
          {message}
        </div>
        {type === "info" && (
          <div className="mt-2 text-xs text-blue-500 font-medium">Info</div>
        )}
        {type === "success" && (
          <div className="mt-2 text-xs text-green-500 font-medium">Success</div>
        )}
        {type === "error" && (
          <div className="mt-2 text-xs text-red-500 font-medium">Error</div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;