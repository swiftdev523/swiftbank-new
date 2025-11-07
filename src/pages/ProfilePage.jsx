import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import firestoreService from "../services/firestoreService";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaIdCard,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaShieldAlt,
  FaBell,
  FaCreditCard,
  FaHistory,
  FaDownload,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdSecurity, MdNotifications, MdAccountBalance } from "react-icons/md";
import { formatAddress, getAddressForEditing } from "../utils/addressUtils";

const ProfilePage = () => {
  const { user, updateProfileImage, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: getAddressForEditing(user?.address) || "",
    dateOfBirth: user?.dateOfBirth || "",
  });

  // Sync form with user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: getAddressForEditing(user.address) || "",
        dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Update user profile using auth context
      const result = await updateUserData({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        name: `${editForm.firstName} ${editForm.lastName}`, // Keep for backward compatibility
        phone: editForm.phone,
        address: editForm.address,
        dateOfBirth: editForm.dateOfBirth,
      });

      if (result.success) {
        setSaveStatus({
          type: "success",
          message: "Profile updated successfully!",
        });
        setIsEditing(false);
      } else {
        setSaveStatus({
          type: "error",
          message: `Failed to update profile: ${result.error}`,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus({
        type: "error",
        message: `Failed to update profile: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveStatus(null);
    // Reset form to original values
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: getAddressForEditing(user?.address) || "",
      dateOfBirth: user?.dateOfBirth || "",
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("File size must be less than 5MB");
        return;
      }

      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async () => {
    if (!profileImage) return;

    setUploadingImage(true);
    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;

        // Update the user's profile image in context
        updateProfileImage(imageData);

        // Success notification
        alert("Profile image updated successfully!");

        // Clear the upload state
        setProfileImage(null);
        setProfileImagePreview(null);
        setUploadingImage(false);
      };
      reader.readAsDataURL(profileImage);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
      setUploadingImage(false);
    }
  };

  const handleImageCancel = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const tabs = [
    { id: "personal", name: "Personal Info", icon: FaUser },
    { id: "security", name: "Security", icon: MdSecurity },
    { id: "notifications", name: "Notifications", icon: MdNotifications },
    { id: "accounts", name: "Accounts", icon: MdAccountBalance },
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.firstName?.charAt(0)?.toUpperCase() ||
                  user?.name?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer">
              <FaCamera className="text-sm" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">Profile Picture</h3>
            <p className="text-gray-600 text-sm mb-3">
              Click the camera icon to update your profile photo
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, GIF • Max size: 5MB
            </p>
          </div>
        </div>

        {/* Image Upload Actions */}
        {profileImage && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  New image selected: {profileImage.name}
                </p>
                <p className="text-xs text-blue-600">
                  File size: {(profileImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleImageCancel}
                  disabled={uploadingImage}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={handleImageSave}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                  {uploadingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="w-3 h-3" />
                      <span>Save Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personal Information Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUser className="inline mr-2" />
            First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
              {user?.firstName || "John"}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUser className="inline mr-2" />
            Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
              {user?.lastName || "Smith"}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaEnvelope className="inline mr-2" />
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
              {user?.email || "john.smith@email.com"}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPhone className="inline mr-2" />
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
              {user?.phone || "Not provided"}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaBirthdayCake className="inline mr-2" />
            Date of Birth
          </label>
          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
            {user?.dateOfBirth || "Not provided"}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            Address
          </label>
          {isEditing ? (
            <textarea
              value={editForm.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
              {formatAddress(user?.address)}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaIdCard className="inline mr-2" />
            Social Security Number
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono">
              {showSSN ? "***-**-1234" : "***-**-****"}
            </div>
            <button
              onClick={() => setShowSSN(!showSSN)}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              {showSSN ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <FaShieldAlt className="text-yellow-600 text-xl" />
          <div>
            <h4 className="font-bold text-yellow-800">Security Notice</h4>
            <p className="text-yellow-700 text-sm">
              For security changes, please visit your nearest Swift Bank branch
              or call customer service.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3">Password Security</h4>
          <p className="text-gray-600 text-sm mb-4">
            Last changed: 30 days ago
          </p>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Change Password
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3">
            Two-Factor Authentication
          </h4>
          <p className="text-gray-600 text-sm mb-4">Status: Enabled</p>
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            Manage 2FA
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4">
          Notification Preferences
        </h4>
        <div className="space-y-4">
          {[
            { id: "email", label: "Email Notifications", enabled: true },
            { id: "sms", label: "SMS Alerts", enabled: true },
            { id: "push", label: "Push Notifications", enabled: false },
            {
              id: "marketing",
              label: "Marketing Communications",
              enabled: false,
            },
          ].map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <span className="text-gray-700">{setting.label}</span>
              <div
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  setting.enabled ? "bg-blue-600" : "bg-gray-300"
                }`}>
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    setting.enabled ? "translate-x-6" : "translate-x-1"
                  } mt-0.5`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccountInfo = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4">Account Summary</h4>
        <div className="space-y-4">
          {user?.accounts?.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">
                  {account.type} Account
                </p>
                <p className="text-gray-600 text-sm">
                  Account: {account.accountNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  ${account.balance?.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">Available Balance</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your personal information and account settings
            </p>
          </div>

          {activeTab === "personal" && (
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}

          {/* Status Message */}
          {saveStatus && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                saveStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
              {saveStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}>
                <tab.icon className="text-lg" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === "personal" && renderPersonalInfo()}
          {activeTab === "security" && renderSecuritySettings()}
          {activeTab === "notifications" && renderNotificationSettings()}
          {activeTab === "accounts" && renderAccountInfo()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
