import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import authService from "../services/authService";
import firestoreService from "../services/firestoreService";
import { firebaseErrorHandler } from "../utils/firebaseErrorHandler";
import { isFirebaseConfigured } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [userData, setUserData] = useState(null); // Additional user data from Firestore

  const logoutRef = useRef(null);
  const sessionTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Security constants
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

  // Permanent role assignments based on User UIDs
  const PERMANENT_ROLES = {
    mYFGjRgsARS0AheCdYUkzhMRLkk2: "customer", // John Boseman
    rYIBpXZy0vX4hY1A3HCSSBYV8i33: "admin", // Admin user
  };

  // Email-based role assignments (more reliable than UID)
  const PERMANENT_EMAIL_ROLES = {
    "admin@swiftbank.com": "admin",
    "john@example.com": "customer",
    "developer@swiftbank.com": "developer",
    "seconds@swiftbank.com": "admin",
    "kindestwavelover@gmail.com": "customer",
  };

  // Function to get role based on UID or email (synchronous fallback)
  const getRoleForUser = (uid, email) => {
    // First check email-based roles for immediate response
    if (email && PERMANENT_EMAIL_ROLES[email.toLowerCase()]) {
      console.log(
        `🔑 Role assigned by email mapping: ${email} -> ${PERMANENT_EMAIL_ROLES[email.toLowerCase()]}`
      );
      return PERMANENT_EMAIL_ROLES[email.toLowerCase()];
    }
    // Fallback to UID-based roles
    if (uid && PERMANENT_ROLES[uid]) {
      console.log(`🔑 Role assigned by UID: ${uid} -> ${PERMANENT_ROLES[uid]}`);
      return PERMANENT_ROLES[uid];
    }
    console.log(`🔑 Default role assigned: customer`);
    return "customer"; // Default to customer
  };

  // Function to get role based on UID (for backward compatibility)
  const getRoleForUID = (uid) => {
    return PERMANENT_ROLES[uid] || "customer"; // Default to customer
  };

  // Enhanced session management
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      if (logoutRef.current) {
        logoutRef.current();
      }
    }, SESSION_DURATION);

    setLastActivity(Date.now());
  }, [SESSION_DURATION]);

  // Check for account lockout on component mount
  useEffect(() => {
    const lockoutData = localStorage.getItem("accountLockout");
    if (lockoutData) {
      const { timestamp, attempts } = JSON.parse(lockoutData);
      const timeSinceLockout = Date.now() - timestamp;

      if (timeSinceLockout < LOCKOUT_DURATION) {
        setIsLocked(true);
        setLoginAttempts(attempts);
      } else {
        // Lockout period has expired
        localStorage.removeItem("accountLockout");
        setLoginAttempts(0);
        setIsLocked(false);
      }
    }
  }, []);

  // Monitor authentication state
  useEffect(() => {
    setIsLoading(true);
    setIsUserDataLoading(true);

    // Handle fallback mode
    if (!isFirebaseConfigured) {
      console.log("🔄 Checking mock authentication state");
      const mockUser = firebaseErrorHandler.getMockCurrentUser();

      if (mockUser) {
        setUser(mockUser.firebaseUser);
        setUserData(mockUser.userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
      setIsUserDataLoading(false);
      return;
    }

    unsubscribeRef.current = authService.onAuthStateChanged(
      async (authUser) => {
        if (authUser) {
          try {
            // Get user data from Firestore
            const userDoc = await firestoreService.getUserProfile(authUser.uid);

            if (userDoc) {
              // Derive role: prefer Firestore role, fallback to email/UID mapping, else customer
              const derivedRole =
                userDoc.role ||
                getRoleForUser(authUser.uid, authUser.email) ||
                "customer";

              const fullUserData = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                ...userDoc,
                role: derivedRole,
              };

              setUser(fullUserData);
              setIsAuthenticated(true);
              setUserData({
                ...userDoc,
                role: derivedRole,
              });
              setIsUserDataLoading(false);

              // Set up real-time subscription for user data updates
              if (authUser.uid) {
                try {
                  const userDocListener = firestoreService.subscribeToDocument(
                    "users",
                    authUser.uid,
                    (updatedUserData, error) => {
                      if (error) {
                        console.warn("Error in user data subscription:", error);
                        return;
                      }

                      if (updatedUserData) {
                        console.log(
                          "🔄 User data updated in real-time:",
                          updatedUserData
                        );
                        const updatedFullUserData = {
                          uid: authUser.uid,
                          email: authUser.email,
                          emailVerified: authUser.emailVerified,
                          ...updatedUserData,
                          role: derivedRole,
                        };
                        setUser(updatedFullUserData);
                        setUserData(updatedUserData);
                      }
                    }
                  );

                  // Store listener ID for cleanup
                  window.userDataListenerId = userDocListener;
                } catch (error) {
                  console.warn(
                    "Failed to set up user data subscription:",
                    error
                  );
                }
              }

              // Reset login attempts on successful authentication
              setLoginAttempts(0);
              setIsLocked(false);
              localStorage.removeItem("accountLockout");

              resetSessionTimeout();
            } else {
              // User exists in Firebase Auth but not in Firestore
              console.warn(
                "User authenticated but no profile found in Firestore - creating default profile"
              );

              // Create default user profile with derived role using email/UID mapping as fallback
              const derivedRole =
                getRoleForUser(authUser.uid, authUser.email) || "customer";

              // Extract first and last name from displayName or email
              const fullName =
                authUser.displayName || authUser.email?.split("@")[0] || "User";
              const nameParts = fullName.split(" ");
              const firstName = nameParts[0] || "User";
              const lastName =
                nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

              const defaultProfile = {
                username: authUser.email?.split("@")[0] || "user",
                name: fullName, // Keep for backward compatibility
                firstName: firstName,
                lastName: lastName,
                email: authUser.email,
                role: derivedRole, // Use mapping fallback if available
                permissions:
                  derivedRole === "admin" ? ["full_access"] : ["account_view"],
                status: "active",
                phone: "",
                address: "",
                dateOfBirth: "",
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              };

              try {
                // Create the profile in Firestore
                await firestoreService.createUserProfile(
                  authUser.uid,
                  defaultProfile
                );

                // No accounts yet for new user (will be created later)
                let userAccounts = [];

                const fullUserData = {
                  uid: authUser.uid,
                  email: authUser.email,
                  emailVerified: authUser.emailVerified,
                  ...defaultProfile,
                  accounts: userAccounts,
                };

                setUser(fullUserData);
                setIsAuthenticated(true);
                setUserData({ ...defaultProfile, accounts: userAccounts });
                setIsUserDataLoading(false);

                console.log("Created default user profile successfully");
              } catch (createError) {
                console.error(
                  "Failed to create default user profile:",
                  createError
                );
                // Still set the user with minimal data to prevent blank page
                let userAccounts = [];

                const minimalUserData = {
                  uid: authUser.uid,
                  email: authUser.email,
                  emailVerified: authUser.emailVerified,
                  name:
                    authUser.displayName ||
                    authUser.email?.split("@")[0] ||
                    "User",
                  role: "customer",
                  permissions: ["account_view"],
                  status: "active",
                  accounts: userAccounts,
                };

                setUser(minimalUserData);
                setUserData(minimalUserData);
              }

              // Reset login attempts on successful authentication
              setLoginAttempts(0);
              setIsLocked(false);
              localStorage.removeItem("accountLockout");

              resetSessionTimeout();
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setUserData(null);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserData(null);
          setIsUserDataLoading(false);

          // Clear session timeout when user logs out
          if (sessionTimeoutRef.current) {
            clearTimeout(sessionTimeoutRef.current);
            sessionTimeoutRef.current = null;
          }
        }

        setIsLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      // Clean up user data subscription
      if (window.userDataListenerId) {
        try {
          firestoreService.unsubscribe(window.userDataListenerId);
          window.userDataListenerId = null;
        } catch (error) {
          console.warn("Error cleaning up user data subscription:", error);
        }
      }
    };
  }, [resetSessionTimeout]);

  // Activity monitoring for session timeout
  useEffect(() => {
    let activityInterval;

    if (user) {
      activityInterval = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;

        if (timeSinceLastActivity >= SESSION_DURATION) {
          logout();
        }
      }, ACTIVITY_CHECK_INTERVAL);

      // Add event listeners for user activity
      const updateActivity = () => {
        setLastActivity(Date.now());
        resetSessionTimeout();
      };

      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];
      events.forEach((event) => {
        document.addEventListener(event, updateActivity, true);
      });

      return () => {
        if (activityInterval) {
          clearInterval(activityInterval);
        }
        events.forEach((event) => {
          document.removeEventListener(event, updateActivity, true);
        });
      };
    }

    return () => {
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [user, lastActivity, resetSessionTimeout]);

  // Set logout ref when logout function changes
  const logout = useCallback(async () => {
    try {
      if (!isFirebaseConfigured) {
        console.log("🔄 Using mock sign out");
        await firebaseErrorHandler.mockSignOut();
      } else {
        await authService.signOut();
      }

      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
      setLastActivity(Date.now());

      // Clear session data
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }

      // Clean up user data subscription
      if (window.userDataListenerId) {
        try {
          firestoreService.unsubscribe(window.userDataListenerId);
          window.userDataListenerId = null;
        } catch (error) {
          console.warn(
            "Error cleaning up user data subscription during logout:",
            error
          );
        }
      }

      localStorage.removeItem("sessionData");
      localStorage.removeItem("bankDataVersion");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force logout even if there's an error
      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Generate browser fingerprint for additional security
  const generateFingerprint = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Banking fingerprint", 2, 2);

    return btoa(
      JSON.stringify({
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvas.toDataURL(),
        timestamp: Date.now(),
      })
    );
  };

  // Update user data
  const updateUserData = useCallback(
    async (newData) => {
      if (!user?.uid) return { success: false, error: "No user authenticated" };

      try {
        await firestoreService.updateUserProfile(user.uid, newData);

        const updatedUserData = { ...userData, ...newData };
        const updatedUser = { ...user, ...newData };

        setUserData(updatedUserData);
        setUser(updatedUser);

        return { success: true };
      } catch (error) {
        console.error("Error updating user data:", error);
        return { success: false, error: error.message };
      }
    },
    [user, userData]
  );

  // Login function
  const login = useCallback(
    async (email, password) => {
      if (isLocked) {
        const lockoutData = JSON.parse(localStorage.getItem("accountLockout"));
        const timeRemaining =
          LOCKOUT_DURATION - (Date.now() - lockoutData.timestamp);

        return {
          success: false,
          error: `Account locked. Try again in ${Math.ceil(timeRemaining / 60000)} minutes.`,
        };
      }

      setIsLoading(true);

      try {
        let result;

        // Use fallback authentication if Firebase is not configured
        if (!isFirebaseConfigured) {
          console.log("🔄 Using mock authentication");
          const mockResult = await firebaseErrorHandler.mockSignIn(
            email,
            password
          );

          if (mockResult) {
            setUser(mockResult.firebaseUser);
            setUserData(mockResult.userData);
            setIsAuthenticated(true);
            result = { success: true };
          } else {
            result = { success: false, error: "Invalid credentials" };
          }
        } else {
          result = await authService.signInWithEmail(email, password);
        }

        if (result.success) {
          // Reset login attempts on successful login
          setLoginAttempts(0);
          setIsLocked(false);
          localStorage.removeItem("accountLockout");

          // Create secure session
          const sessionData = {
            loginTime: Date.now(),
            lastActivity: Date.now(),
            userAgent: navigator.userAgent,
            ipFingerprint: generateFingerprint(),
          };

          localStorage.setItem("sessionData", JSON.stringify(sessionData));
          localStorage.setItem("bankDataVersion", "4.0");

          resetSessionTimeout();
          setIsLoading(false);
          return { success: true };
        } else {
          // Handle failed login attempt
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setIsLocked(true);
            localStorage.setItem(
              "accountLockout",
              JSON.stringify({
                timestamp: Date.now(),
                attempts: newAttempts,
              })
            );
          }

          setIsLoading(false);
          return {
            success: false,
            error: result.error || "Invalid credentials",
            attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts),
          };
        }
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        return {
          success: false,
          error: "An error occurred during login. Please try again.",
        };
      }
    },
    [isLocked, loginAttempts, resetSessionTimeout]
  );

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);

    try {
      const result = await authService.signUpWithEmail(
        userData.email,
        userData.password,
        {
          name: userData.name,
          role: userData.role || "customer",
          phone: userData.phone || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth || "",
        }
      );

      setIsLoading(false);
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      return {
        success: false,
        error: "An error occurred during registration. Please try again.",
      };
    }
  }, []);

  // Password reset function
  const resetPassword = useCallback(async (email) => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: "An error occurred while sending reset email. Please try again.",
      };
    }
  }, []);

  // Update password function
  const updatePassword = useCallback(async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword);
      return result;
    } catch (error) {
      console.error("Password update error:", error);
      return {
        success: false,
        error: "An error occurred while updating password. Please try again.",
      };
    }
  }, []);

  // Clear lockout (admin function)
  const clearLockout = useCallback(() => {
    localStorage.removeItem("accountLockout");
    setLoginAttempts(0);
    setIsLocked(false);
  }, []);

  // Enhanced permissions checking
  const hasPermission = useCallback(
    (permission) => {
      if (!user || !userData) return false;

      // Super admin has all permissions
      if (userData.role === "admin" && userData.permissions?.includes("*")) {
        return true;
      }

      // Check specific permission
      return userData.permissions?.includes(permission) || false;
    },
    [user, userData]
  );

  // Check if user has specific role (email/UID mapping takes precedence)
  const hasRole = useCallback(
    (role) => {
      if (!user) {
        console.log(`🔍 hasRole(${role}): No user found`);
        return false;
      }

      // Email/UID mapping override
      const mappedRole = getRoleForUser(user.uid, user.email);
      if (mappedRole) {
        const mappedResult = mappedRole === role;
        console.log(
          `� hasRole(${role}): Using mapped role ${mappedRole}, result: ${mappedResult}`
        );
        if (mappedResult) return true;
      }

      console.log(`�🔍 hasRole(${role}) check for user:`, {
        uid: user.uid,
        email: user.email,
        userDataRole: userData?.role,
        userRole: user.role,
        isUserDataLoading,
      });

      // Next check: userData from Firestore
      if (userData && userData.role) {
        const result = userData.role === role;
        console.log(
          `✅ hasRole(${role}): Using userData.role = ${userData.role}, result: ${result}`
        );
        if (result) return true;
      }
      // Fallback check: user.role from Firebase Auth
      if (user.role) {
        const result = user.role === role;
        console.log(
          `⚠️ hasRole(${role}): Using user.role = ${user.role}, result: ${result}`
        );
        if (result) return true;
      }

      console.log(`❌ hasRole(${role}): No role match, returning false`);
      return false;
    },
    [user, userData, isUserDataLoading]
  );

  // Check if user can access admin panel
  const canAccessAdminPanel = useCallback(() => {
    return hasRole("admin");
  }, [hasRole]);

  // Check if user can access specific route
  const canAccessRoute = useCallback(
    (requiredPermissions = []) => {
      if (!user || !userData) return false;

      // Admin users have access to all routes
      if (userData.role === "admin") return true;

      // Check if user has all required permissions
      return requiredPermissions.every((permission) =>
        userData.permissions?.includes(permission)
      );
    },
    [user, userData]
  );

  // Get session info
  const getSessionInfo = useCallback(() => {
    const sessionData = localStorage.getItem("sessionData");
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }, []);

  const value = {
    // User state
    user,
    userData,
    isLoading,
    isUserDataLoading,
    isAuthenticated: !!user,

    // Authentication methods
    login,
    logout,
    register,
    resetPassword,
    updatePassword,

    // User management
    updateUserData,

    // Security
    loginAttempts,
    isLocked,
    clearLockout,
    lastActivity,

    // Permissions
    hasPermission,
    hasRole,
    canAccessAdminPanel,
    canAccessRoute,

    // Session
    getSessionInfo,
    resetSessionTimeout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
