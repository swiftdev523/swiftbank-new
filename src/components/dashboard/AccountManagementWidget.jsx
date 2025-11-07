import React, { useState } from "react";
import {
  FaUserPlus,
  FaCalendarAlt,
  FaCog,
  FaFileAlt,
  FaCreditCard,
  FaShieldAlt,
  FaBell,
  FaMoneyBillWave,
  FaUserFriends,
  FaHistory,
  FaDownload,
  FaEdit,
  FaPlus,
  FaArrowRight,
  FaCheck,
  FaClock,
} from "react-icons/fa";

const AccountManagementWidget = ({ user }) => {
  const [activeTab, setActiveTab] = useState("beneficiaries");
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  // Mock data - in real app this would come from backend
  const beneficiaries = [
    {
      id: 1,
      name: "Sarah Johnson",
      accountNumber: "****4567",
      bankName: "Swift Bank",
      relationship: "Family",
      verified: true,
      addedDate: "2025-08-15",
    },
    {
      id: 2,
      name: "Michael Chen",
      accountNumber: "****8901",
      bankName: "First National",
      relationship: "Friend",
      verified: true,
      addedDate: "2025-07-22",
    },
    {
      id: 3,
      name: "Business Services LLC",
      accountNumber: "****2345",
      bankName: "Commerce Bank",
      relationship: "Business",
      verified: false,
      addedDate: "2025-09-10",
    },
  ];

  const automaticPayments = [
    {
      id: 1,
      payee: "Electric Company",
      amount: 125.5,
      frequency: "Monthly",
      nextDate: "2025-10-01",
      status: "Active",
      category: "Utilities",
    },
    {
      id: 2,
      payee: "Internet Provider",
      amount: 79.99,
      frequency: "Monthly",
      nextDate: "2025-09-25",
      status: "Active",
      category: "Utilities",
    },
    {
      id: 3,
      payee: "Insurance Premium",
      amount: 245.0,
      frequency: "Monthly",
      nextDate: "2025-09-30",
      status: "Pending",
      category: "Insurance",
    },
  ];

  const documents = [
    {
      id: 1,
      name: "August 2025 Statement",
      type: "Statement",
      date: "2025-09-01",
      size: "2.4 MB",
      format: "PDF",
    },
    {
      id: 2,
      name: "Tax Document 1099-INT",
      type: "Tax Form",
      date: "2025-01-31",
      size: "1.2 MB",
      format: "PDF",
    },
    {
      id: 3,
      name: "Account Terms & Conditions",
      type: "Agreement",
      date: "2025-01-15",
      size: "3.8 MB",
      format: "PDF",
    },
  ];

  const preferences = {
    notifications: {
      transactionAlerts: true,
      securityAlerts: true,
      promotionalEmails: false,
      monthlyStatements: true,
    },
    security: {
      twoFactorAuth: true,
      biometricLogin: true,
      sessionTimeout: "30 minutes",
      loginNotifications: true,
    },
    display: {
      theme: "Light",
      language: "English",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
    },
  };

  const tabs = [
    {
      key: "beneficiaries",
      label: "Beneficiaries",
      icon: FaUserFriends,
      count: beneficiaries.length,
    },
    {
      key: "autopay",
      label: "Auto Pay",
      icon: FaCalendarAlt,
      count: automaticPayments.filter((p) => p.status === "Active").length,
    },
    {
      key: "documents",
      label: "Documents",
      icon: FaFileAlt,
      count: documents.length,
    },
    { key: "preferences", label: "Preferences", icon: FaCog, count: null },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Inactive":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderBeneficiaries = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Saved Beneficiaries
        </h4>
        <button
          onClick={() => setShowAddBeneficiary(true)}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <FaPlus className="w-3 h-3" />
          <span>Add New</span>
        </button>
      </div>

      {beneficiaries.map((beneficiary) => (
        <div
          key={beneficiary.id}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h5 className="font-medium text-gray-800">
                  {beneficiary.name}
                </h5>
                {beneficiary.verified && (
                  <FaCheck className="w-3 h-3 text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {beneficiary.bankName} • {beneficiary.accountNumber}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {beneficiary.relationship} • Added{" "}
                {new Date(beneficiary.addedDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer">
                <FaEdit className="w-3 h-3" />
              </button>
              <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Send Money
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAutoPay = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Automatic Payments
        </h4>
        <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
          <FaPlus className="w-3 h-3" />
          <span>Set Up</span>
        </button>
      </div>

      {automaticPayments.map((payment) => (
        <div
          key={payment.id}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h5 className="font-medium text-gray-800">{payment.payee}</h5>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                ${payment.amount.toFixed(2)} • {payment.frequency}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                <FaClock className="w-3 h-3" />
                <span>
                  Next: {new Date(payment.nextDate).toLocaleDateString()}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer">
                <FaEdit className="w-3 h-3" />
              </button>
              <button className="px-3 py-1 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer">
                {payment.status === "Active" ? "Pause" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">Account Documents</h4>

      {documents.map((document) => (
        <div
          key={document.id}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <FaFileAlt className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h5 className="font-medium text-gray-800 text-sm">
                  {document.name}
                </h5>
                <p className="text-xs text-gray-500">
                  {document.type} •{" "}
                  {new Date(document.date).toLocaleDateString()} •{" "}
                  {document.size}
                </p>
              </div>
            </div>
            <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              <FaDownload className="w-3 h-3" />
              <span>Download</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Notification Settings
        </h4>
        <div className="space-y-3">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-gray-600 capitalize">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  value ? "bg-blue-600" : "bg-gray-300"
                } relative`}>
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    value ? "translate-x-5" : "translate-x-1"
                  }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Security Settings
        </h4>
        <div className="space-y-3">
          {Object.entries(preferences.security).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-gray-600 capitalize">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              {typeof value === "boolean" ? (
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    value ? "bg-green-600" : "bg-gray-300"
                  } relative`}>
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      value ? "translate-x-5" : "translate-x-1"
                    }`}></div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">{value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "beneficiaries":
        return renderBeneficiaries();
      case "autopay":
        return renderAutoPay();
      case "documents":
        return renderDocuments();
      case "preferences":
        return renderPreferences();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <FaCog className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Account Management
            </h3>
            <p className="text-sm text-gray-500">
              Manage your banking preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}>
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">{renderContent()}</div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
            <FaShieldAlt className="w-4 h-4" />
            <span>Security Center</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 font-medium cursor-pointer">
            <span>View All Settings</span>
            <FaArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementWidget;
