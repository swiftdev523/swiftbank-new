import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../config/firebase";
import {
  AppError,
  ErrorTypes,
  withRetry,
  withTimeout,
  ErrorLogger,
  NetworkMonitor,
  validateEmail,
  validatePassword,
} from "../utils/errorUtils";
import { firebaseErrorHandler } from "../utils/firebaseErrorHandler";
import { withCircuitBreaker } from "../utils/firebaseCircuitBreaker";
import { emergencyMode } from "../utils/emergencyMode";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = new Set();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.lastActivity = Date.now();
    this.initializeAuthListener();
    this.initializeSessionMonitoring();
    this.initializeNetworkMonitoring();
  }

  // Initialize authentication state listener with enhanced error handling and throttling
  initializeAuthListener() {
    let lastUserUpdate = 0;
    const updateThrottleMs = 5000; // 5 seconds between user doc fetches

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const now = Date.now();

          // Throttle user document fetches to prevent quota issues
          if (now - lastUserUpdate < updateThrottleMs) {
            console.log(
              "🔄 Auth state change throttled to prevent Firebase quota issues"
            );
            return;
          }

          lastUserUpdate = now;

          // Get additional user data from Firestore with circuit breaker protection
          const userDoc = await withCircuitBreaker(
            () => this.getUserDocument(firebaseUser.uid),
            "get-user-document"
          );

          this.currentUser = {
            // Preserve firebase-like shape for compatibility
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            email: firebaseUser.email,
            username: userDoc?.username || firebaseUser.email?.split("@")[0],
            role: userDoc?.role || "customer",
            permissions: userDoc?.permissions || ["account_view"],
            profile: userDoc?.profile || {},
            emailVerified: firebaseUser.emailVerified,
            createdAt: firebaseUser.metadata.creationTime,
            lastLogin: firebaseUser.metadata.lastSignInTime,
            sessionStartTime: Date.now(),
          };

          // Update last login time
          await this.updateLastLogin(firebaseUser.uid);
        } else {
          this.currentUser = null;
        }

        // Notify all listeners with error handling
        this.notifyListeners(this.currentUser);
      } catch (error) {
        ErrorLogger.log(error, {
          context: "auth state change",
          userId: firebaseUser?.uid,
        });

        this.currentUser = null;
        this.notifyListeners(null);
      }
    });
  }

  // Initialize session monitoring for automatic logout
  initializeSessionMonitoring() {
    // Track user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session timeout every minute
    setInterval(() => {
      if (
        this.currentUser &&
        Date.now() - this.lastActivity > this.sessionTimeout
      ) {
        this.logout("session_timeout");
      }
    }, 60000);
  }

  // Initialize network monitoring
  initializeNetworkMonitoring() {
    NetworkMonitor.onOffline(() => {
      ErrorLogger.logUserAction("network_offline");
    });

    NetworkMonitor.onOnline(() => {
      ErrorLogger.logUserAction("network_online");
    });
  }

  // Enhanced listener notification with error handling
  notifyListeners(user) {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(user);
      } catch (error) {
        ErrorLogger.log(error, { context: "auth listener notification" });
      }
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.authStateListeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  /**
   * Backwards compatibility: some parts of the app expect
   * authService.onAuthStateChanged(callback) like Firebase API.
   * Delegate to the internal onAuthStateChange implementation.
   */
  onAuthStateChanged(callback) {
    return this.onAuthStateChange(callback);
  }

  // Sign in with email and password - Simplified for debugging
  async signIn(email, password) {
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Handle fallback mode
      if (!isFirebaseConfigured || !auth) {
        console.log("🔄 Using mock authentication");
        const mockResult = await firebaseErrorHandler.mockSignIn(
          email,
          password
        );
        return {
          user: mockResult.firebaseUser,
          success: true,
          message: "Successfully signed in (mock mode)",
        };
      }

      console.log("Attempting Firebase sign in...");

      // Direct Firebase sign in without retry/timeout wrappers
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Firebase sign in successful");

      // Check if user is active in Firestore
      const userDoc = await this.getUserDocument(userCredential.user.uid);

      if (userDoc && userDoc.isActive === false) {
        // Sign out immediately if user is inactive
        await signOut(auth);
        throw new Error(
          "Your account has been deactivated. Please contact your administrator."
        );
      }

      return {
        user: userCredential.user,
        success: true,
        message: "Successfully signed in",
      };
    } catch (error) {
      console.error("Sign in error:", error);

      // Enhanced error handling
      const handledError = firebaseErrorHandler.handleFirebaseError(
        error,
        "signIn"
      );
      throw new Error(handledError.message);
    }
  }

  /**
   * Backwards compatibility: some parts of the app call signInWithEmail.
   * Delegate to signIn(email, password).
   */
  async signInWithEmail(email, password) {
    return this.signIn(email, password);
  }

  // Enhanced user registration
  async signUp(email, password, userData = {}) {
    try {
      // Validate inputs
      if (!email || !password) {
        throw AppError.validation("Email and password are required");
      }

      validateEmail(email);

      // Skip password validation for developer-created users
      if (!userData.skipValidation) {
        validatePassword(password);
      }

      // Check network connectivity
      if (!NetworkMonitor.isOnline()) {
        throw AppError.offline("Please check your internet connection");
      }

      ErrorLogger.logUserAction("sign_up_attempt", { email });

      // Create user with timeout and retry
      const userCredential = await withTimeout(
        withRetry(() => createUserWithEmailAndPassword(auth, email, password), {
          attempts: 2,
          delay: 1000,
          onRetry: (error, attempt) => {
            ErrorLogger.log(error, {
              context: "sign_up_retry",
              attempt,
              email,
            });
          },
        }),
        15000
      );

      // Create user document in Firestore
      await this.createUserDocument(userCredential.user.uid, {
        email,
        username: userData.username || email.split("@")[0],
        role: userData.role || "customer",
        permissions: userData.permissions || ["account_view"],
        profile: userData.profile || {},
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        createdAt: new Date(),
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      ErrorLogger.logUserAction("sign_up_success", {
        userId: userCredential.user.uid,
        email,
      });

      return {
        user: userCredential.user,
        success: true,
        message: "Account created successfully. Please verify your email.",
      };
    } catch (error) {
      const enhancedError = this.handleAuthError(error);
      ErrorLogger.log(enhancedError, {
        context: "sign_up_failed",
        email,
      });
      throw enhancedError;
    }
  }

  /**
   * Backwards compatibility: some parts of the app call signUpWithEmail.
   * Delegate to signUp(email, password, userData).
   */
  async signUpWithEmail(email, password, userData = {}) {
    return this.signUp(email, password, userData);
  }

  // Enhanced logout with reason tracking
  async logout(reason = "user_initiated") {
    try {
      ErrorLogger.logUserAction("logout_attempt", {
        reason,
        userId: this.currentUser?.id,
      });

      await signOut(auth);

      ErrorLogger.logUserAction("logout_success", { reason });

      return {
        success: true,
        message:
          reason === "session_timeout"
            ? "Session expired. Please sign in again."
            : "Successfully signed out",
      };
    } catch (error) {
      const enhancedError = this.handleAuthError(error);
      ErrorLogger.log(enhancedError, { context: "logout_failed", reason });
      throw enhancedError;
    }
  }

  /**
   * Backwards compatibility: older code calls authService.signOut().
   * Delegate to logout() to preserve behavior and logging.
   */
  async signOut(reason = "user_initiated") {
    return this.logout(reason);
  }

  /**
   * Backwards compatibility: simpler password update that only takes newPassword.
   * This will succeed if the user's authentication is recent; otherwise Firebase
   * will throw an error requiring re-authentication which the caller should handle.
   */
  async updatePassword(newPassword) {
    try {
      if (!this.currentUser) {
        throw AppError.auth("User not authenticated");
      }

      validatePassword(newPassword);

      const user = auth.currentUser;
      await fbUpdatePassword(user, newPassword);

      ErrorLogger.logUserAction("password_update_success_simple", {
        userId: this.currentUser.id,
      });

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      const enhancedError = this.handleAuthError(error);
      ErrorLogger.log(enhancedError, {
        context: "password_update_failed_simple",
        userId: this.currentUser?.id,
      });
      throw enhancedError;
    }
  }

  // Password reset with enhanced error handling
  async resetPassword(email) {
    try {
      validateEmail(email);

      if (!NetworkMonitor.isOnline()) {
        throw AppError.offline("Please check your internet connection");
      }

      ErrorLogger.logUserAction("password_reset_attempt", { email });

      await withTimeout(sendPasswordResetEmail(auth, email), 10000);

      ErrorLogger.logUserAction("password_reset_success", { email });

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      const enhancedError = this.handleAuthError(error);
      ErrorLogger.log(enhancedError, {
        context: "password_reset_failed",
        email,
      });
      throw enhancedError;
    }
  }

  // Update password with re-authentication
  async updateUserPassword(currentPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw AppError.auth("User not authenticated");
      }

      validatePassword(newPassword);

      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Re-authenticate user
      await reauthenticateWithCredential(user, credential);

      // Update password
      await fbUpdatePassword(user, newPassword);

      ErrorLogger.logUserAction("password_update_success", {
        userId: this.currentUser.id,
      });

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      const enhancedError = this.handleAuthError(error);
      ErrorLogger.log(enhancedError, {
        context: "password_update_failed",
        userId: this.currentUser?.id,
      });
      throw enhancedError;
    }
  }

  // Get user document from Firestore
  async getUserDocument(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      throw AppError.network("Failed to retrieve user data");
    }
  }

  // Create user document in Firestore
  async createUserDocument(uid, userData) {
    try {
      await setDoc(doc(db, "users", uid), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      throw AppError.network("Failed to create user profile");
    }
  }

  // Update user document in Firestore
  async updateUserDocument(uid, updates) {
    try {
      await updateDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw AppError.network("Failed to update user profile");
    }
  }

  // Update last login timestamp
  async updateLastLogin(uid) {
    try {
      // Use merge to avoid errors if the user document doesn't exist yet
      await setDoc(
        doc(db, "users", uid),
        { lastLogin: new Date() },
        { merge: true }
      );
    } catch (error) {
      // Don't throw error for this non-critical operation
      ErrorLogger.log(error, {
        context: "update_last_login_failed",
        userId: uid,
      });
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if user has specific permission
  hasPermission(permission) {
    return this.currentUser?.permissions?.includes(permission) || false;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  // Enhanced error handling for Firebase Auth errors
  handleAuthError(error) {
    if (error instanceof AppError) {
      return error;
    }

    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return AppError.auth("Invalid email or password");

      case "auth/email-already-in-use":
        return AppError.auth("An account with this email already exists");

      case "auth/weak-password":
        return AppError.validation("Password is too weak");

      case "auth/invalid-email":
        return AppError.validation("Please enter a valid email address");

      case "auth/user-disabled":
        return AppError.auth("This account has been disabled");

      case "auth/too-many-requests":
        return AppError.rateLimit(
          "Too many failed attempts. Please try again later"
        );

      case "auth/network-request-failed":
        return AppError.network("Network error. Please check your connection");

      case "auth/requires-recent-login":
        return AppError.auth("Please log in again to continue");

      case "auth/operation-not-allowed":
        return AppError.permission("This operation is not allowed");

      default:
        return AppError.auth(error.message || "Authentication failed");
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
