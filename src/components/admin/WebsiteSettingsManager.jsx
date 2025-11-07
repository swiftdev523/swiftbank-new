import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
  FaImage,
  FaDollarSign,
  FaShieldAlt,
  FaSpinner,
  FaCreditCard,
} from "react-icons/fa";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";
import AccountTypeManager from "./AccountTypeManager";

const WebsiteSettingsManager = () => {
  const {
    settings: websiteSettings,
    loading,
    saveSettings,
  } = useWebsiteSettings();
  const [settings, setSettings] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (websiteSettings) {
      setSettings({
        general: {
          bankName: websiteSettings.bankName || "Swift Bank",
          tagline: websiteSettings.tagline || "Online Banking Portal",
          description:
            websiteSettings.description ||
            "Your trusted financial partner for secure and convenient banking solutions.",
          website: websiteSettings.website || "https://www.swiftbank.com",
          logoUrl: websiteSettings.logoUrl || "/bank-logo.png",
          faviconUrl: "/vite.svg",
        },
        contact: {
          phone: websiteSettings.phone || "+1 (555) 123-4567",
          email: websiteSettings.email || "support@swiftbank.com",
          address:
            websiteSettings.address ||
            "123 Financial District, New York, NY 10001",
        },
        security: {
          sslEnabled: true,
          encryptionLevel: "256-bit",
          twoFactorAuth: true,
          fdic: true,
        },
      });
    }
  }, [websiteSettings]);

  const tabs = [
    { id: "general", label: "General", icon: FaBuilding },
    { id: "contact", label: "Contact", icon: FaPhone },
    { id: "accounts", label: "Account Types", icon: FaCreditCard },
    { id: "security", label: "Security", icon: FaShieldAlt },
  ];

  const updateSettingField = (path, value) => {
    if (!editMode) return;

    const keys = path.split(".");
    const newSettings = { ...settings };
    let current = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setSettings(newSettings);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Flatten the settings for saving to Firebase
      const flatSettings = {
        bankName: settings.general.bankName,
        tagline: settings.general.tagline,
        description: settings.general.description,
        website: settings.general.website,
        logoUrl: settings.general.logoUrl,
        phone: settings.contact.phone,
        email: settings.contact.email,
        address: settings.contact.address,
      };

      await saveSettings(flatSettings);

      setNotification({
        type: "success",
        message:
          "Website settings saved successfully! Changes will be reflected across the site.",
      });
      setEditMode(false);
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setNotification({
        type: "error",
        message: "Failed to save settings. Please try again.",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restore original settings
    if (websiteSettings) {
      setSettings({
        general: {
          bankName: websiteSettings.bankName || "Swift Bank",
          tagline: websiteSettings.tagline || "Online Banking Portal",
          description:
            websiteSettings.description ||
            "Your trusted financial partner for secure and convenient banking solutions.",
          website: websiteSettings.website || "https://www.swiftbank.com",
          logoUrl: websiteSettings.logoUrl || "/bank-logo.png",
          faviconUrl: "/vite.svg",
        },
        contact: {
          phone: websiteSettings.phone || "+1 (555) 123-4567",
          email: websiteSettings.email || "support@swiftbank.com",
          address:
            websiteSettings.address ||
            "123 Financial District, New York, NY 10001",
        },
        security: {
          sslEnabled: true,
          encryptionLevel: "256-bit",
          twoFactorAuth: true,
          fdic: true,
        },
      });
    }
    setEditMode(false);
  };

  if (loading || !settings) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Loading website settings from database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaBuilding className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Website Settings
            </h2>
            <p className="text-gray-500 text-sm">
              Manage bank information and website configuration
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 text-sm">
                <FaTimes />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 text-sm">
              <FaEdit />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-3 rounded-lg mb-4 bg-green-100 text-green-800">
          <div className="flex items-center space-x-2">
            <FaCheck className="text-sm" />
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <tab.icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={settings.general.bankName}
                  onChange={(e) =>
                    updateSettingField("general.bankName", e.target.value)
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.general.tagline}
                  onChange={(e) =>
                    updateSettingField("general.tagline", e.target.value)
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={settings.general.description}
                onChange={(e) =>
                  updateSettingField("general.description", e.target.value)
                }
                disabled={!editMode}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={settings.general.website}
                  onChange={(e) =>
                    updateSettingField("general.website", e.target.value)
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={settings.general.logoUrl}
                  onChange={(e) =>
                    updateSettingField("general.logoUrl", e.target.value)
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.contact.phone}
                  onChange={(e) =>
                    updateSettingField("contact.phone", e.target.value)
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.contact.email}
                  onChange={(e) =>
                    updateSettingField("contact.email", e.target.value)
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={settings.contact.address}
                onChange={(e) =>
                  updateSettingField("contact.address", e.target.value)
                }
                disabled={!editMode}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
              />
            </div>
          </div>
        )}

        {/* Account Types Tab */}
        {activeTab === "accounts" && <AccountTypeManager />}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  SSL Enabled
                </span>
                <div
                  className={`w-4 h-4 rounded-full ${settings.security.sslEnabled ? "bg-green-500" : "bg-red-500"}`}></div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Two Factor Auth
                </span>
                <div
                  className={`w-4 h-4 rounded-full ${settings.security.twoFactorAuth ? "bg-green-500" : "bg-red-500"}`}></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Encryption Level
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {settings.security.encryptionLevel}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  FDIC Insured
                </span>
                <div
                  className={`w-4 h-4 rounded-full ${settings.security.fdic ? "bg-green-500" : "bg-red-500"}`}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteSettingsManager;
