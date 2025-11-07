import React from "react";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="text-green-400 text-3xl" />;
      case "error":
        return <FaTimes className="text-red-400 text-3xl" />;
      default:
        return <FaExclamationTriangle className="text-yellow-400 text-3xl" />;
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-yellow-600 hover:bg-yellow-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">{getIcon()}</div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

          {/* Message */}
          <p className="text-gray-300 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${getButtonColors()}`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
