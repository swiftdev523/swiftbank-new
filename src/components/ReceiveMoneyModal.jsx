import React, { useState } from "react";
import { FaTimes, FaCopy, FaCheck, FaQrcode, FaShareAlt } from "react-icons/fa";
import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

const ReceiveMoneyModal = ({ isOpen, onClose, bankingDetails, account }) => {
  const { settings } = useWebsiteSettings();
  const [copied, setCopied] = useState({
    routing: false,
    account: false,
    swift: false,
  });

  if (!isOpen) return null;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true });
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 2000);
    });
  };

  const shareAccountDetails = () => {
    const details = `Bank Account Details:
Routing Number: ${bankingDetails.routingNumber}
Account Number: ${account?.accountNumber || "****1234"}
SWIFT Code: ${bankingDetails.swiftCode}
Bank Name: ${settings?.bankName || "Swift Bank"}`;

    if (navigator.share) {
      navigator.share({
        title: "Bank Account Details",
        text: details,
      });
    } else {
      copyToClipboard(details, "all");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Receive Money</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-center">
            Share these details with someone who wants to send you money
          </p>

          {/* Account Details */}
          <div className="space-y-4">
            {/* Routing Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Routing Number
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-gray-800">
                  {bankingDetails.routingNumber}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(bankingDetails.routingNumber, "routing")
                  }
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                  {copied.routing ? (
                    <FaCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FaCopy className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {copied.routing ? "Copied!" : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-gray-800">
                  {account?.accountNumber || "****1234"}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      account?.accountNumber || "****1234",
                      "account"
                    )
                  }
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                  {copied.account ? (
                    <FaCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FaCopy className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {copied.account ? "Copied!" : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            {/* SWIFT Code */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SWIFT Code (International)
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-gray-800">
                  {bankingDetails.swiftCode}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(bankingDetails.swiftCode, "swift")
                  }
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                  {copied.swift ? (
                    <FaCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FaCopy className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {copied.swift ? "Copied!" : "Copy"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={shareAccountDetails}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <FaShareAlt className="w-4 h-4" />
              <span>Share Details</span>
            </button>
            <button
              onClick={() => alert("QR Code feature coming soon!")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <FaQrcode className="w-4 h-4" />
              <span>QR Code</span>
            </button>
          </div>

          {/* Security Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              <strong>Security Note:</strong> Only share these details with
              trusted individuals. Never share your login credentials or PIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoneyModal;
