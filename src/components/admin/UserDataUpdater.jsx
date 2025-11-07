import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import firestoreService from "../../services/firestoreService";
import { FaUser, FaSave } from "react-icons/fa";

const UserDataUpdater = () => {
  const { user, hasRole, updateUserData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [userNameData, setUserNameData] = useState({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Boseman",
  });

  const handleUpdateUserNames = async () => {
    setIsUpdating(true);
    setUpdateStatus(null);

    try {
      if (hasRole("admin")) {
        // Admin can update specific user by ID
        const johnBosemanId = "mYFGjRgsARS0AheCdYUkzhMRLkk2";

        const result = await firestoreService.updateUserNameFields(
          johnBosemanId,
          userNameData.firstName,
          userNameData.lastName
        );
      } else {
        // Regular user updates their own profile
        const result = await updateUserData({
          firstName: userNameData.firstName,
          lastName: userNameData.lastName,
          name: `${userNameData.firstName} ${userNameData.lastName}`,
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      setUpdateStatus({
        type: "success",
        message:
          "User name fields updated successfully! Changes should be visible immediately.",
      });
    } catch (error) {
      console.error("Error updating user names:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      setUpdateStatus({
        type: "error",
        message: `Failed to update user names: ${error.message}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Available to all users now

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <FaUser className="text-blue-600 text-xl mr-3" />
        <h3 className="text-xl font-bold text-gray-800">User Data Updater</h3>
      </div>

      <p className="text-gray-600 mb-4">
        {hasRole("admin")
          ? "Admin: Update user firstName and lastName fields for proper display in the application."
          : "Update your firstName and lastName for proper display throughout the application."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={userNameData.firstName}
            onChange={(e) =>
              setUserNameData((prev) => ({
                ...prev,
                firstName: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={userNameData.lastName}
            onChange={(e) =>
              setUserNameData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleUpdateUserNames}
        disabled={isUpdating}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {isUpdating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Updating...
          </>
        ) : (
          <>
            <FaSave className="mr-2" />
            Update User Names
          </>
        )}
      </button>

      {updateStatus && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            updateStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
          {updateStatus.message}
        </div>
      )}
    </div>
  );
};

export default UserDataUpdater;
