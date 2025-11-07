import React, { createContext, useContext, useCallback, useState } from "react";
import firestoreService from "../services/firestoreService";
import authService from "../services/authService";

const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Find user by credentials using Firebase Authentication
  const findUserByCredentials = useCallback(async (email, password) => {
    try {
      const result = await authService.signInWithEmail(email, password);
      if (result.success && result.user) {
        const userProfile = await firestoreService.getUserProfile(
          result.user.uid
        );
        return userProfile ? { ...result.user, ...userProfile } : null;
      }
      return null;
    } catch (error) {
      console.error("Error finding user by credentials:", error);
      return null;
    }
  }, []);

  // Find user by ID
  const findUserById = useCallback(async (userId) => {
    try {
      const userProfile = await firestoreService.getUserProfile(userId);
      return userProfile;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }, []);

  // Find user by email
  const findUserByIdentifier = useCallback(async (identifier) => {
    try {
      // For email identifiers, get user profiles and search
      const profiles = await firestoreService.getAllUserProfiles();
      return (
        profiles.find(
          (profile) =>
            profile.email === identifier || profile.username === identifier
        ) || null
      );
    } catch (error) {
      console.error("Error finding user by identifier:", error);
      return null;
    }
  }, []);

  // Get all users (admin function)
  const getAllUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = await firestoreService.getAllUserProfiles();
      return users;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get users by role
  const getUsersByRole = useCallback(async (role) => {
    try {
      setIsLoading(true);
      const users = await firestoreService.getUsersByRole(role);
      return users;
    } catch (error) {
      console.error("Error getting users by role:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (userId, updateData) => {
    try {
      setIsLoading(true);
      await firestoreService.updateUserProfile(userId, updateData);

      // Return updated user profile
      const updatedUser = await firestoreService.getUserProfile(userId);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new user (admin function)
  const addUser = useCallback(async (userData) => {
    try {
      setIsLoading(true);

      // Create Firebase Auth account first
      const authResult = await authService.signUpWithEmail(
        userData.email,
        userData.password || "temporaryPassword123", // Use temporary password
        {
          name: userData.name,
          role: userData.role || "customer",
          phone: userData.phone || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth || "",
          permissions: userData.permissions || [],
        }
      );

      if (authResult.success) {
        // Get the created user profile
        const userProfile = await firestoreService.getUserProfile(
          authResult.user.uid
        );
        return userProfile;
      } else {
        throw new Error(authResult.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete user (admin function)
  const deleteUser = useCallback(async (userId) => {
    try {
      setIsLoading(true);
      await firestoreService.deleteUserProfile(userId);
      // Note: Firebase Auth user deletion requires server-side implementation
      // This just deletes the Firestore profile
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user statistics
  const getUserStats = useCallback(async () => {
    try {
      const users = await firestoreService.getAllUserProfiles();

      const stats = {
        total: users.length,
        byRole: {},
        active: 0,
        inactive: 0,
      };

      users.forEach((user) => {
        // Count by role
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;

        // Count active/inactive based on last login or created date
        const lastActivity = user.lastLogin || user.createdAt;
        const isActive =
          lastActivity &&
          Date.now() - new Date(lastActivity).getTime() <
            30 * 24 * 60 * 60 * 1000; // 30 days

        if (isActive) {
          stats.active++;
        } else {
          stats.inactive++;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        total: 0,
        byRole: {},
        active: 0,
        inactive: 0,
      };
    }
  }, []);

  // Validate user data
  const validateUserData = useCallback(
    async (userData, isUpdate = false) => {
      const errors = [];

      if (!isUpdate || userData.email !== undefined) {
        if (!userData.email || !userData.email.includes("@")) {
          errors.push("Valid email address is required");
        }

        // Check if email already exists
        try {
          const existingUser = await findUserByIdentifier(userData.email);
          if (
            existingUser &&
            (!isUpdate || existingUser.uid !== userData.uid)
          ) {
            errors.push("Email already exists");
          }
        } catch (error) {
          // Handle validation error
          console.warn("Error checking email uniqueness:", error);
        }
      }

      if (!isUpdate || userData.password !== undefined) {
        if (!userData.password || userData.password.length < 8) {
          errors.push("Password must be at least 8 characters");
        }
      }

      if (!isUpdate || userData.name !== undefined) {
        if (!userData.name || userData.name.trim().length < 2) {
          errors.push("Name must be at least 2 characters");
        }
      }

      if (!isUpdate || userData.role !== undefined) {
        const validRoles = ["admin", "manager", "support", "customer"];
        if (!userData.role || !validRoles.includes(userData.role)) {
          errors.push("Valid role is required");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [findUserByIdentifier]
  );

  // Search users
  const searchUsers = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const users = await firestoreService.getAllUserProfiles();
      const searchTerm = query.toLowerCase().trim();

      return users.filter((user) => {
        return (
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.role?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm)
        );
      });
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }, []);

  const value = {
    // Loading state
    isLoading,

    // User retrieval
    findUserByCredentials,
    findUserById,
    findUserByIdentifier,
    getAllUsers,
    getUsersByRole,
    searchUsers,

    // User management
    updateUser,
    addUser,
    deleteUser,

    // Validation and utilities
    validateUserData,
    getUserStats,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
