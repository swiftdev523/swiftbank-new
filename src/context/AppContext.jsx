import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ContextService } from "../services/contextService";
import authService from "../services/authService";
import { AppError, handleError } from "../utils/errorUtils";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Centralized state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sessionData, setSessionData] = useState({
    lastActivity: Date.now(),
    isLocked: false,
    loginAttempts: 0,
  });

  // Constants
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);

      if (firebaseUser) {
        setSessionData((prev) => ({
          ...prev,
          loginAttempts: 0,
          isLocked: false,
        }));
      }
    });

    return unsubscribe;
  }, []);

  // Session management
  const updateLastActivity = useCallback(() => {
    setSessionData((prev) => ({
      ...prev,
      lastActivity: Date.now(),
    }));
  }, []);

  const checkSessionTimeout = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - sessionData.lastActivity;

    if (timeSinceLastActivity > SESSION_DURATION && user) {
      logout();
      addNotification({
        type: "warning",
        title: "Session Expired",
        message: "Your session has expired. Please log in again.",
        timeout: 5000,
      });
      return false;
    }
    return true;
  }, [sessionData.lastActivity, user]);

  // Authentication
  const login = useCallback(
    async (credentials) => {
      if (sessionData.isLocked) {
        throw AppError.auth(
          "Account is temporarily locked. Please try again later."
        );
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await authService.signIn(
          credentials.email || credentials.username,
          credentials.password
        );

        if (result.success) {
          addNotification({
            type: "success",
            title: "Welcome back!",
            message: "You have successfully logged in.",
            timeout: 3000,
          });
          return { success: true };
        }
      } catch (err) {
        const errorInfo = handleError(err, { action: "login" });
        setError(errorInfo.message);

        setSessionData((prev) => {
          const newAttempts = prev.loginAttempts + 1;
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

          if (shouldLock) {
            setTimeout(() => {
              setSessionData((prev) => ({
                ...prev,
                isLocked: false,
                loginAttempts: 0,
              }));
            }, LOCKOUT_DURATION);
          }

          return {
            ...prev,
            loginAttempts: newAttempts,
            isLocked: shouldLock,
          };
        });

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionData.isLocked]
  );

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSessionData({
        lastActivity: Date.now(),
        isLocked: false,
        loginAttempts: 0,
      });
      setError(null);
      setNotifications([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  // Notifications
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    if (notification.timeout) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Activity monitoring
  useEffect(() => {
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      updateLastActivity();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    const sessionCheck = setInterval(() => {
      checkSessionTimeout();
    }, 60000); // Check every minute

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheck);
    };
  }, [updateLastActivity, checkSessionTimeout]);

  const value = {
    // Auth state
    user,
    isLoading,
    error,

    // Auth methods
    login,
    logout,

    // Session management
    sessionData,
    updateLastActivity,
    checkSessionTimeout,

    // Notifications
    notifications,
    addNotification,
    removeNotification,

    // Permissions (simplified)
    hasPermission: useCallback(
      (permission) => {
        return authService.hasPermission(permission);
      },
      [user]
    ),

    // Role checks
    isAdmin: useCallback(() => authService.hasRole("admin"), [user]),
    isCustomer: useCallback(() => authService.hasRole("customer"), [user]),

    // Auth service access
    authService,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
