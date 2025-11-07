import React, { useEffect } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useMessages } from "../../context/MessageContext";

const CustomNotification = ({
  isOpen,
  onClose,
  messageId,
  title = "Unable to perform this action",
  message = "Contact the bank for further assistance",
  type = "warning",
}) => {
  const { getMessage } = useMessages();

  // If messageId is provided, get the message from context
  const contextMessage = messageId
    ? getMessage(messageId, "accountHolder")
    : null;

  // Use context message if available and active, otherwise use props
  const displayTitle = contextMessage?.isActive ? contextMessage.title : title;
  const displayMessage = contextMessage?.isActive
    ? contextMessage.message
    : message;
  const displayType = contextMessage?.isActive ? contextMessage.type : type;
  useEffect(() => {
    if (isOpen) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (displayType) {
      case "warning":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-600",
          titleColor: "text-amber-800",
          messageColor: "text-amber-700",
        };
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
        };
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          titleColor: "text-green-800",
          messageColor: "text-green-700",
        };
      default:
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-600",
          titleColor: "text-amber-800",
          messageColor: "text-amber-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200/50 transform transition-all duration-300 scale-100">
        {/* Header with close button */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 ${styles.bgColor} ${styles.borderColor} border rounded-full flex items-center justify-center`}>
              <FaExclamationTriangle
                className={`text-lg ${styles.iconColor}`}
              />
            </div>
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {displayTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Message */}
        <div
          className={`${styles.bgColor} ${styles.borderColor} border rounded-xl p-4 mb-6`}>
          <p className={`${styles.messageColor} text-sm leading-relaxed`}>
            {displayMessage}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer">
            Close
          </button>
          <button
            onClick={() => {
              // This could open a contact form or redirect to contact page
              alert("Redirecting to contact information...");
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
            Contact Bank
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomNotification;
