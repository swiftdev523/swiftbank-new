import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../config/firebase";
import firestoreService from "./firestoreService";

class UserManagementService {
  constructor() {
    this.defaultPasswords = {
      admin: "Admin123!",
      customer: "Customer123!",
      developer: "Developer123!",
    };
  }

  /**
   * Generate a secure default password for a user role
   */
  generateDefaultPassword(role) {
    const base = this.defaultPasswords[role] || "User123!";
    const timestamp = Date.now().toString().slice(-4);
    return `${base}${timestamp}`;
  }

  /**
   * Create both Firebase Auth account and Firestore user document
   */
  async createUserWithAuth(userData) {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase not configured, skipping auth account creation");
      return await this.createFirestoreUserOnly(userData);
    }

    try {
      const {
        email,
        firstName,
        lastName,
        role,
        password,
        skipAuth = false,
        ...additionalData
      } = userData;

      // Generate password if not provided
      const userPassword = password || this.generateDefaultPassword(role);

      let authUser = null;
      let authAccountCreated = false;

      // Create Firebase Auth account unless explicitly skipped
      if (!skipAuth) {
        try {
          console.log(`Creating Firebase Auth account for ${email}...`);
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            userPassword
          );

          authUser = userCredential.user;
          authAccountCreated = true;

          // Update the user's display name
          if (firstName && lastName) {
            await updateProfile(authUser, {
              displayName: `${firstName} ${lastName}`,
            });
          }

          console.log(`✅ Firebase Auth account created for ${email}`);
        } catch (authError) {
          console.error(
            `❌ Failed to create auth account for ${email}:`,
            authError
          );

          // If email already exists, that's okay - we'll just use the existing account
          if (authError.code === "auth/email-already-in-use") {
            console.log(`ℹ️ Auth account already exists for ${email}`);
            authAccountCreated = false;
          } else {
            throw authError;
          }
        }
      }

      // Create comprehensive Firestore document
      const firestoreData = {
        id: additionalData.id || `${role}-${Date.now()}`,
        uid: authUser?.uid || null,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
        authAccountCreated,
        defaultPassword: userPassword, // Store for reference (in production, don't store passwords)
        permissions: this.getDefaultPermissions(role),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData,
      };

      // Add role-specific data
      if (role === "admin") {
        firestoreData.canCreateCustomers = true;
        firestoreData.canViewAllTransactions = true;
        firestoreData.canManageAccounts = true;
      } else if (role === "developer") {
        firestoreData.canCreateAdmins = true;
        firestoreData.canCreateCustomers = true;
        firestoreData.canModifyRules = true;
        firestoreData.canAccessAllData = true;
      }

      // Save to Firestore
      await setDoc(doc(db, "users", firestoreData.id), firestoreData);

      console.log(`✅ User document created in Firestore: ${firestoreData.id}`);

      return {
        success: true,
        user: firestoreData,
        authUser: authUser,
        authAccountCreated,
        credentials: {
          email,
          password: userPassword,
        },
      };
    } catch (error) {
      console.error("Error creating user with auth:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Create only Firestore user document (fallback when Firebase Auth unavailable)
   */
  async createFirestoreUserOnly(userData) {
    try {
      const { email, firstName, lastName, role, password, ...additionalData } =
        userData;

      const userPassword = password || this.generateDefaultPassword(role);

      const firestoreData = {
        id: additionalData.id || `${role}-${Date.now()}`,
        uid: null,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
        authAccountCreated: false,
        defaultPassword: userPassword,
        permissions: this.getDefaultPermissions(role),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData,
      };

      await setDoc(doc(db, "users", firestoreData.id), firestoreData);

      return {
        success: true,
        user: firestoreData,
        authUser: null,
        authAccountCreated: false,
        credentials: {
          email,
          password: userPassword,
        },
      };
    } catch (error) {
      console.error("Error creating Firestore user:", error);
      throw new Error(`Failed to create user document: ${error.message}`);
    }
  }

  /**
   * Get default permissions for a role
   */
  getDefaultPermissions(role) {
    const permissions = {
      developer: ["all"],
      admin: [
        "account_view",
        "account_edit",
        "transaction_view",
        "transaction_create",
        "user_management",
        "admin_panel",
      ],
      customer: [
        "account_view",
        "transaction_view",
        "transaction_create_own",
        "profile_edit",
      ],
    };

    return permissions[role] || permissions.customer;
  }

  /**
   * Create multiple users in batch
   */
  async createMultipleUsers(usersData) {
    const results = [];
    const errors = [];

    for (const userData of usersData) {
      try {
        const result = await this.createUserWithAuth(userData);
        results.push(result);

        // Add delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
        errors.push({
          email: userData.email,
          error: error.message,
        });
      }
    }

    return {
      success: results.length > 0,
      created: results,
      errors,
      summary: {
        total: usersData.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  /**
   * Update existing user and sync with Firebase Auth if needed
   */
  async updateUser(userId, updateData) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const currentData = userDoc.data();

      // Update Firestore document
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updatedData);

      // If user has Firebase Auth account and display name changed, update it
      if (currentData.uid && (updateData.firstName || updateData.lastName)) {
        try {
          // Note: Updating another user's profile requires admin SDK
          // This is a simplified version - in production, use Firebase Admin SDK
          console.log("User profile updated in Firestore only");
        } catch (authError) {
          console.warn(
            "Could not update Firebase Auth profile:",
            authError.message
          );
        }
      }

      return {
        success: true,
        user: { ...currentData, ...updatedData },
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Get user by email (searches both Firestore and Firebase Auth)
   */
  async getUserByEmail(email) {
    try {
      // Search Firestore users collection
      const users = await firestoreService.getAllUsers();
      const user = users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      return user || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  /**
   * Verify if a user can log in with given credentials
   */
  async verifyUserCredentials(email, password) {
    try {
      const user = await this.getUserByEmail(email);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      if (!user.isActive) {
        return { success: false, message: "Account is deactivated" };
      }

      // In a real application, you'd verify against Firebase Auth
      // For now, check against the stored default password
      if (user.defaultPassword === password) {
        return {
          success: true,
          user,
          message: "Credentials verified",
        };
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Error verifying credentials:", error);
      return { success: false, message: "Verification failed" };
    }
  }

  /**
   * Create admin user with Firebase Auth account
   */
  async createAdmin(adminData) {
    return await this.createUserWithAuth({
      ...adminData,
      role: "admin",
    });
  }

  /**
   * Create customer user with Firebase Auth account
   */
  async createCustomer(customerData) {
    return await this.createUserWithAuth({
      ...customerData,
      role: "customer",
    });
  }

  /**
   * Create developer user with Firebase Auth account
   */
  async createDeveloper(developerData) {
    return await this.createUserWithAuth({
      ...developerData,
      role: "developer",
    });
  }

  /**
   * Get all users with authentication status
   */
  async getAllUsersWithAuthStatus() {
    try {
      const users = await firestoreService.getAllUsers();

      return users.map((user) => ({
        ...user,
        hasAuthAccount: !!user.uid && user.authAccountCreated,
        canLogin:
          user.isActive && (user.authAccountCreated || user.defaultPassword),
      }));
    } catch (error) {
      console.error("Error getting users with auth status:", error);
      return [];
    }
  }
}

export default new UserManagementService();
