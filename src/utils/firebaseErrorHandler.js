/**
 * Firebase Connection and Error Handler
 * Provides fallback functionality when Firebase is not configured
 */

import { db, auth } from "../config/firebase";

class FirebaseErrorHandler {
  constructor() {
    this.isFirebaseConfigured = this.checkFirebaseConfiguration();
    this.fallbackMode = !this.isFirebaseConfigured;

    if (this.fallbackMode) {
      console.warn("🔥 Firebase not configured - Running in fallback mode");
      this.initializeMockData();
    }
  }

  checkFirebaseConfiguration() {
    try {
      // Check if essential Firebase config exists
      if (
        !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
        !import.meta.env.VITE_FIREBASE_API_KEY
      ) {
        return false;
      }

      // Try to access Firebase services
      if (!db || !auth) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Firebase configuration check failed:", error);
      return false;
    }
  }

  initializeMockData() {
    // Initialize empty fallback data for development when Firebase is not configured
    // No hardcoded demo data - all collections start empty
    this.mockUsers = new Map();
    this.mockAccounts = new Map();
    this.mockTransactions = new Map();
  }

  // Fallback authentication methods
  async mockSignIn(email, password) {
    // No hardcoded authentication - fallback always fails in production mode
    // This ensures users must configure Firebase properly for authentication
    throw new Error("Authentication requires proper Firebase configuration");
  }

  async mockSignOut() {
    sessionStorage.removeItem("mockUser");
    return true;
  }

  getMockCurrentUser() {
    const stored = sessionStorage.getItem("mockUser");
    return stored ? JSON.parse(stored) : null;
  }

  // Fallback Firestore methods
  async mockGetDocument(collection, docId) {
    switch (collection) {
      case "users":
        return this.mockUsers.get(docId) || null;
      case "accounts":
        return this.mockAccounts.get(docId) || null;
      case "transactions":
        return this.mockTransactions.get(docId) || null;
      default:
        return null;
    }
  }

  async mockGetCollection(collection, filters = {}) {
    switch (collection) {
      case "users":
        return Array.from(this.mockUsers.values());
      case "accounts":
        const userId = filters.userId;
        if (userId) {
          return Array.from(this.mockAccounts.values()).filter(
            (acc) => acc.userId === userId
          );
        }
        return Array.from(this.mockAccounts.values());
      case "transactions":
        const transactionUserId = filters.userId;
        if (transactionUserId) {
          return Array.from(this.mockTransactions.values()).filter(
            (tx) => tx.userId === transactionUserId
          );
        }
        return Array.from(this.mockTransactions.values());
      default:
        return [];
    }
  }

  // Error handling utilities
  handleFirebaseError(error, context = "") {
    console.error(`Firebase Error ${context}:`, error);

    // Return user-friendly error messages
    const errorMessages = {
      "auth/user-not-found": "No account found with this email address.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
      "permission-denied":
        "You do not have permission to access this resource.",
      "not-found": "The requested resource was not found.",
      unavailable: "Service temporarily unavailable. Please try again later.",
    };

    const userMessage =
      errorMessages[error.code] ||
      errorMessages[error.message] ||
      "An unexpected error occurred. Please try again.";

    return {
      code: error.code || "unknown",
      message: userMessage,
      originalError: error,
    };
  }

  // Development helpers
  logFirebaseStatus() {
    console.log("🔥 Firebase Status:", {
      configured: this.isFirebaseConfigured,
      fallbackMode: this.fallbackMode,
      environment: import.meta.env.MODE,
      hasDb: !!db,
      hasAuth: !!auth,
    });
  }

  // Create a basic environment file template
  generateEnvTemplate() {
    return `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Development
VITE_NODE_ENV=development`;
  }
}

// Global instance
export const firebaseErrorHandler = new FirebaseErrorHandler();

// Development helper to show Firebase status
if (import.meta.env.DEV) {
  firebaseErrorHandler.logFirebaseStatus();

  if (firebaseErrorHandler.fallbackMode) {
    console.log(`
🚀 Swift Bank - Development Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Firebase is not configured. Running in fallback mode.

To configure Firebase for production use:
1. Create a .env file in the project root
2. Add your Firebase configuration
3. Restart the development server

${firebaseErrorHandler.generateEnvTemplate()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}

export default FirebaseErrorHandler;
