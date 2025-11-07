import React, { useState } from "react";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaKey,
  FaMobile,
  FaFingerprint,
  FaChevronRight,
} from "react-icons/fa";

const SecurityStatusWidget = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Mock security data - in real app this would come from backend
  const securityStatus = {
    overallScore: 92,
    lastLoginTime: "2025-09-19 14:30:00",
    lastLoginLocation: "New York, NY",
    twoFactorEnabled: true,
    biometricEnabled: false,
    recentSecurityAlerts: 0,
    accountVerified: true,
    deviceTrusted: true,
    sessionActive: true,
  };

  const getSecurityLevel = (score) => {
    if (score >= 90)
      return { level: "Excellent", color: "green", icon: FaShieldAlt };
    if (score >= 75) return { level: "Good", color: "blue", icon: FaShieldAlt };
    if (score >= 60)
      return { level: "Fair", color: "yellow", icon: FaExclamationTriangle };
    return {
      level: "Needs Attention",
      color: "red",
      icon: FaExclamationTriangle,
    };
  };

  const security = getSecurityLevel(securityStatus.overallScore);
  const SecurityIcon = security.icon;

  const securityFeatures = [
    {
      name: "Two-Factor Authentication",
      enabled: securityStatus.twoFactorEnabled,
      icon: FaKey,
      priority: "high",
    },
    {
      name: "Biometric Login",
      enabled: securityStatus.biometricEnabled,
      icon: FaFingerprint,
      priority: "medium",
    },
    {
      name: "Device Recognition",
      enabled: securityStatus.deviceTrusted,
      icon: FaMobile,
      priority: "medium",
    },
    {
      name: "Account Verification",
      enabled: securityStatus.accountVerified,
      icon: FaCheckCircle,
      priority: "high",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full bg-${security.color}-100 flex items-center justify-center`}>
            <SecurityIcon className={`w-5 h-5 text-${security.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Security Status</h3>
            <p className={`text-sm text-${security.color}-600 font-medium`}>
              {security.level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold text-${security.color}-600`}>
            {securityStatus.overallScore}%
          </div>
          <div className="text-xs text-gray-500">Security Score</div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last Login</span>
          <span className="font-medium text-gray-800">
            {new Date(securityStatus.lastLoginTime).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Location</span>
          <span className="font-medium text-gray-800">
            {securityStatus.lastLoginLocation}
          </span>
        </div>
        {securityStatus.recentSecurityAlerts > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Security Alerts</span>
            <span className="font-medium text-red-600 flex items-center">
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              {securityStatus.recentSecurityAlerts}
            </span>
          </div>
        )}
      </div>

      {/* Security Features */}
      <div className="space-y-2 mb-4">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <feature.icon
                className={`w-4 h-4 ${feature.enabled ? "text-green-600" : "text-gray-400"}`}
              />
              <span className="text-sm text-gray-700">{feature.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {feature.enabled ? (
                <FaCheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <FaClock className="w-4 h-4 text-gray-400" />
              )}
              {!feature.enabled && feature.priority === "high" && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
        <span>Security Settings</span>
        <FaChevronRight className="w-3 h-3" />
      </button>

      {/* Quick Tips */}
      {!securityStatus.twoFactorEnabled && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <FaShieldAlt className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Security Tip</p>
              <p className="text-xs text-blue-600">
                Enable two-factor authentication to increase your security score
                and protect your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityStatusWidget;
