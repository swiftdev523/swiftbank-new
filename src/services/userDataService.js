// User Data Service - Secure way to handle user information
// Replaces hardcoded user data with Firebase lookups

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

export class UserDataService {
  constructor(firebaseApp) {
    this.auth = getAuth(firebaseApp);
    this.db = getFirestore(firebaseApp);
  }

  // Get user by email (secure lookup from Firebase)
  async getUserByEmail(email) {
    try {
      const usersRef = collection(this.db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userData = querySnapshot.docs[0].data();
      return {
        uid: querySnapshot.docs[0].id,
        ...userData,
      };
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }

  // Get user by role (secure lookup from Firebase)
  async getUsersByRole(role) {
    try {
      const usersRef = collection(this.db, "users");
      const q = query(usersRef, where("role", "==", role));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
  }

  // Secure authentication without hardcoded passwords
  async authenticateUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  // Get demo users safely (for development/testing only)
  async getDemoUsers() {
    if (process.env.NODE_ENV === "production") {
      console.warn("Demo users should not be accessed in production");
      return [];
    }

    try {
      // Return known roles without hardcoded credentials
      const roles = ["admin", "customer", "developer"];
      const demoUsers = [];

      for (const role of roles) {
        const users = await this.getUsersByRole(role);
        demoUsers.push(...users);
      }

      return demoUsers;
    } catch (error) {
      console.error("Error fetching demo users:", error);
      return [];
    }
  }

  // Check if user exists by UID
  async userExists(uid) {
    try {
      const userDoc = await getDoc(doc(this.db, "users", uid));
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  // Safe user lookup methods (no hardcoded data)
  static getKnownRoles() {
    return {
      ADMIN: "admin",
      CUSTOMER: "customer",
      DEVELOPER: "developer",
    };
  }

  // Environment-based configuration (no hardcoded secrets)
  static getTestConfig() {
    if (process.env.NODE_ENV === "production") {
      return null; // No test config in production
    }

    return {
      // Safe to store non-sensitive test identifiers
      testRoles: ["admin", "customer", "developer"],
      // Never store actual passwords or UIDs here
      placeholderData: {
        testAccountType: "checking",
        defaultCurrency: "USD",
      },
    };
  }
}
