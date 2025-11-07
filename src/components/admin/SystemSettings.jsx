import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaSave,
  FaTimes,
  FaUndo,
  FaBuilding,
  FaDollarSign,
  FaPercent,
  FaClock,
  FaShieldAlt,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUsers,
  FaKey,
  FaDatabase,
  FaServer,
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import {
  MdSecurity,
  MdNotifications,
  MdAccountBalance,
  MdBusinessCenter,
  MdAttachMoney,
  MdSchedule,
  MdVpnKey,
  MdStorage,
} from "react-icons/md";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Mock settings data
  useEffect(() => {
    const mockSettings = {
      general: {
        bankName: "Swift Bank",
        bankCode: "CLB001",
        routingNumber: "123456789",
        swiftCode: "CLBKUS33",
        customerServicePhone: "1-800-CL-BANK",
        customerServiceEmail: "support@clbank.com",
        headquartersAddress: "123 Financial District, Banking City, BC 12345",
        timeZone: "America/New_York",
        operatingHours: {
          weekdays: "9:00 AM - 5:00 PM",
          weekends: "10:00 AM - 3:00 PM",
        },
        maintenanceWindow: "2:00 AM - 4:00 AM EST",
      },
      financial: {
        defaultInterestRate: 2.5,
        savingsInterestRate: 3.0,
        checkingInterestRate: 0.1,
        premiumInterestRate: 4.5,
        transferFee: 3.0,
        wireTransferFeeDomestic: 25.0,
        wireTransferFeeInternational: 50.0,
        overdraftFee: 35.0,
        monthlyMaintenanceFee: 12.0,
        minimumBalance: 100.0,
        dailyWithdrawalLimit: 5000.0,
        dailyTransferLimit: 10000.0,
        monthlyTransferLimit: 50000.0,
        fdicInsuranceLimit: 250000.0,
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 3,
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        passwordExpirationDays: 90,
        twoFactorRequired: true,
        ipWhitelistEnabled: false,
        encryptionLevel: "AES-256",
        sslRequired: true,
        suspiciousActivityThreshold: 5000.0,
        highValueTransactionLimit: 100000.0,
        fraudDetectionEnabled: true,
      },
      notifications: {
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        transactionAlerts: true,
        securityAlerts: true,
        marketingEmails: false,
        maintenanceNotifications: true,
        lowBalanceAlerts: true,
        lowBalanceThreshold: 100.0,
        largeTransactionAlert: true,
        largeTransactionThreshold: 10000.0,
      },
      system: {
        maxConcurrentUsers: 10000,
        databaseBackupFrequency: "daily",
        logRetentionDays: 365,
        cacheExpirationHours: 24,
        apiRateLimit: 1000,
        maintenanceMode: false,
        debugMode: false,
        analyticsEnabled: true,
        performanceMonitoring: true,
        errorReporting: true,
      },
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const settingsTabs = [
    {
      id: "general",
      name: "General",
      icon: FaBuilding,
      description: "Basic bank information and settings",
    },
    {
      id: "financial",
      name: "Financial",
      icon: FaDollarSign,
      description: "Interest rates, fees, and limits",
    },
    {
      id: "security",
      name: "Security",
      icon: FaShieldAlt,
      description: "Security policies and authentication",
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: FaBell,
      description: "Notification settings and alerts",
    },
    {
      id: "system",
      name: "System",
      icon: FaServer,
      description: "System configuration and performance",
    },
  ];

  const handleSettingChange = (category, field, value) => {
    setHasChanges(true);
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleNestedSettingChange = (category, parentField, field, value) => {
    setHasChanges(true);
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentField]: {
          ...prev[category][parentField],
          [field]: value,
        },
      },
    }));
  };

  const saveSettings = () => {
    // In real app, this would save to backend
    console.log("Saving settings:", settings);
    setHasChanges(false);

    // Show success notification
    setNotifications((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "success",
        title: "Settings Saved",
        message: "All settings have been saved successfully.",
      },
    ]);
  };

  const discardChanges = () => {
    // In real app, this would reload from backend
    setHasChanges(false);

    // Show info notification
    setNotifications((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "info",
        title: "Changes Discarded",
        message: "All unsaved changes have been discarded.",
      },
    ]);
  };

  const renderGeneralSettings = () => {
    const generalSettings = settings.general || {};

    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Bank Information */}
          <div className="bg-white/5 rounded-lg p-4 sm:p-6">
            <h4 className="text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <FaBuilding className="mr-2" />
              Bank Information
            </h4>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={generalSettings.bankName || ""}
                  onChange={(e) =>
                    handleSettingChange("general", "bankName", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Bank Code
                  </label>
                  <input
                    type="text"
                    value={generalSettings.bankCode || ""}
                    onChange={(e) =>
                      handleSettingChange("general", "bankCode", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    SWIFT Code
                  </label>
                  <input
                    type="text"
                    value={generalSettings.swiftCode || ""}
                    onChange={(e) =>
                      handleSettingChange(
                        "general",
                        "swiftCode",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={generalSettings.routingNumber || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "routingNumber",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaPhone className="mr-2" />
              Contact Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Customer Service Phone
                </label>
                <input
                  type="text"
                  value={generalSettings.customerServicePhone || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "customerServicePhone",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Customer Service Email
                </label>
                <input
                  type="email"
                  value={generalSettings.customerServiceEmail || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "customerServiceEmail",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Headquarters Address
                </label>
                <textarea
                  value={generalSettings.headquartersAddress || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "headquartersAddress",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaClock className="mr-2" />
              Operating Hours
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Weekdays
                </label>
                <input
                  type="text"
                  value={generalSettings.operatingHours?.weekdays || ""}
                  onChange={(e) =>
                    handleNestedSettingChange(
                      "general",
                      "operatingHours",
                      "weekdays",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Weekends
                </label>
                <input
                  type="text"
                  value={generalSettings.operatingHours?.weekends || ""}
                  onChange={(e) =>
                    handleNestedSettingChange(
                      "general",
                      "operatingHours",
                      "weekends",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Maintenance Window
                </label>
                <input
                  type="text"
                  value={generalSettings.maintenanceWindow || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "maintenanceWindow",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Time Zone
                </label>
                <select
                  value={generalSettings.timeZone || ""}
                  onChange={(e) =>
                    handleSettingChange("general", "timeZone", e.target.value)
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialSettings = () => {
    const financialSettings = settings.financial || {};

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interest Rates */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaPercent className="mr-2" />
              Interest Rates (%)
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Default Interest Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.defaultInterestRate || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "defaultInterestRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Savings Interest Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.savingsInterestRate || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "savingsInterestRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Checking Interest Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.checkingInterestRate || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "checkingInterestRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Premium Interest Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.premiumInterestRate || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "premiumInterestRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaDollarSign className="mr-2" />
              Fees ($)
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Transfer Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.transferFee || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "transferFee",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Wire Transfer Fee (Domestic)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.wireTransferFeeDomestic || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "wireTransferFeeDomestic",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Wire Transfer Fee (International)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.wireTransferFeeInternational || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "wireTransferFeeInternational",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Overdraft Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.overdraftFee || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "overdraftFee",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Monthly Maintenance Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.monthlyMaintenanceFee || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "monthlyMaintenanceFee",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MdAccountBalance className="mr-2" />
              Account Limits ($)
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Minimum Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.minimumBalance || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "minimumBalance",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Daily Withdrawal Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.dailyWithdrawalLimit || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "dailyWithdrawalLimit",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Daily Transfer Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.dailyTransferLimit || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "dailyTransferLimit",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Monthly Transfer Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.monthlyTransferLimit || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "monthlyTransferLimit",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  FDIC Insurance Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financialSettings.fdicInsuranceLimit || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "financial",
                      "fdicInsuranceLimit",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSecuritySettings = () => {
    const securitySettings = settings.security || {};

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaKey className="mr-2" />
              Authentication
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={securitySettings.maxLoginAttempts || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "maxLoginAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Password Min Length
                </label>
                <input
                  type="number"
                  value={securitySettings.passwordMinLength || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "passwordMinLength",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Password Expiration (days)
                </label>
                <input
                  type="number"
                  value={securitySettings.passwordExpirationDays || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "passwordExpirationDays",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password Policy */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MdSecurity className="mr-2" />
              Password Policy
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Require Special Characters</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      securitySettings.passwordRequireSpecialChars || false
                    }
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "passwordRequireSpecialChars",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Require Numbers</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireNumbers || false}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "passwordRequireNumbers",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Require Uppercase</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireUppercase || false}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "passwordRequireUppercase",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">
                  Two-Factor Authentication Required
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorRequired || false}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "twoFactorRequired",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">SSL Required</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.sslRequired || false}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "sslRequired",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Fraud Detection Enabled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.fraudDetectionEnabled || false}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "fraudDetectionEnabled",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Thresholds */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Security Thresholds ($)
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Suspicious Activity Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={securitySettings.suspiciousActivityThreshold || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "suspiciousActivityThreshold",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  High Value Transaction Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={securitySettings.highValueTransactionLimit || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "highValueTransactionLimit",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Encryption Level
                </label>
                <select
                  value={securitySettings.encryptionLevel || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "encryptionLevel",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="AES-128">AES-128</option>
                  <option value="AES-192">AES-192</option>
                  <option value="AES-256">AES-256</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveSettings = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "financial":
        return renderFinancialSettings();
      case "security":
        return renderSecuritySettings();
      default:
        return (
          <div className="text-center py-12">
            <FaCog className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-300">
              Select a settings category to configure
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            System Settings
          </h2>
          <p className="text-blue-200 text-sm sm:text-base">
            Configure bank-wide settings and parameters
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {hasChanges && (
            <>
              <button
                onClick={discardChanges}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all text-base font-medium min-h-[44px]">
                <FaTimes />
                <span>Discard</span>
              </button>
              <button
                onClick={saveSettings}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all text-base font-medium min-h-[44px]">
                <FaSave />
                <span>Save Settings</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {/* Mobile Tab Dropdown */}
        <div className="sm:hidden p-4">
          <label htmlFor="settings-tab-select" className="sr-only">
            Select a settings tab
          </label>
          <select
            id="settings-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
            {settingsTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:flex overflow-x-auto scrollbar-hide">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap min-w-0 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}>
              <tab.icon className="text-lg flex-shrink-0" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-white/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading settings...</div>
          </div>
        ) : (
          <>
            <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {settingsTabs.find((tab) => tab.id === activeTab)?.name}{" "}
                  Settings
                </h3>
                <p className="text-blue-200 mt-1 text-sm sm:text-base">
                  {
                    settingsTabs.find((tab) => tab.id === activeTab)
                      ?.description
                  }
                </p>
              </div>

              {hasChanges && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-300 text-sm">
                    Unsaved changes
                  </span>
                </div>
              )}
            </div>

            {renderActiveSettings()}
          </>
        )}
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : notification.type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }`}>
          <div className="flex items-center space-x-2">
            {notification.type === "success" && <FaCheckCircle />}
            {notification.type === "error" && <FaExclamationTriangle />}
            {notification.type === "info" && <FaInfoCircle />}
            <div>
              <div className="font-medium">{notification.title}</div>
              <div className="text-sm opacity-90">{notification.message}</div>
            </div>
            <button
              onClick={() =>
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id)
                )
              }
              className="ml-4 text-white hover:text-gray-200">
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemSettings;
