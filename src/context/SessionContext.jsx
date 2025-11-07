import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children, user, logout }) => {
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const logoutRef = useRef(logout);

  // Session constants
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

  // Update logout ref when logout function changes
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Session timeout management
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    const newTimeout = setTimeout(() => {
      if (logoutRef.current) {
        logoutRef.current();
      }
    }, SESSION_DURATION);

    setSessionTimeout(newTimeout);
    setLastActivity(Date.now());
  }, [sessionTimeout]);

  // Activity monitoring
  const updateActivity = useCallback(() => {
    if (user) {
      setLastActivity(Date.now());
      resetSessionTimeout();
    }
  }, [user, resetSessionTimeout]);

  // Session validation
  const validateSession = useCallback(() => {
    const savedUser = localStorage.getItem("bankUser");
    const sessionData = localStorage.getItem("sessionData");

    if (savedUser && sessionData) {
      const { loginTime, lastActivity: storedActivity } =
        JSON.parse(sessionData);
      const currentTime = Date.now();
      const sessionAge = currentTime - loginTime;
      const inactivityTime = currentTime - storedActivity;

      // Check if session has expired
      if (sessionAge > SESSION_DURATION || inactivityTime > SESSION_DURATION) {
        if (logoutRef.current) {
          logoutRef.current();
        }
        return false;
      }

      return true;
    }
    return false;
  }, []);

  // Initialize session on mount
  useEffect(() => {
    // Check for existing valid session
    const savedUser = localStorage.getItem("bankUser");
    const dataVersion = localStorage.getItem("bankDataVersion");

    if (savedUser && dataVersion === "3.0" && validateSession()) {
      resetSessionTimeout();
    } else {
      // Clear invalid/old session data
      localStorage.removeItem("bankUser");
      localStorage.removeItem("sessionData");
      localStorage.setItem("bankDataVersion", "3.0");
    }
  }, [validateSession, resetSessionTimeout]);

  // Activity monitoring setup
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttle function for performance
    function throttle(func, delay) {
      let timeoutId;
      let lastExecTime = 0;
      return function (...args) {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
          func.apply(this, args);
          lastExecTime = currentTime;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func.apply(this, args);
            lastExecTime = Date.now();
          }, delay - (currentTime - lastExecTime));
        }
      };
    }

    const throttledUpdateActivity = throttle(updateActivity, 30000); // Throttle to every 30 seconds

    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledUpdateActivity, true);
    });

    // Periodic session validation
    const sessionCheckInterval = setInterval(() => {
      if (!validateSession()) {
        if (logoutRef.current) {
          logoutRef.current();
        }
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledUpdateActivity, true);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [user, updateActivity, validateSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [sessionTimeout]);

  // Get session info for security dashboard
  const getSessionInfo = useCallback(() => {
    const sessionData = localStorage.getItem("sessionData");
    if (sessionData && user) {
      const session = JSON.parse(sessionData);
      return {
        loginTime: new Date(session.loginTime),
        lastActivity: new Date(lastActivity),
        timeRemaining: Math.max(
          0,
          SESSION_DURATION - (Date.now() - lastActivity)
        ),
        isActive: Date.now() - lastActivity < SESSION_DURATION,
      };
    }
    return null;
  }, [user, lastActivity]);

  // Create session data
  const createSessionData = useCallback(() => {
    return {
      loginTime: Date.now(),
      lastActivity: Date.now(),
      userAgent: navigator.userAgent,
      ipFingerprint: generateFingerprint(),
    };
  }, []);

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

  // Force logout all sessions (useful for security)
  const forceLogoutAllSessions = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    if (logoutRef.current) {
      logoutRef.current();
    }
  }, []);

  const value = {
    lastActivity,
    sessionTimeRemaining: user
      ? Math.max(0, SESSION_DURATION - (Date.now() - lastActivity))
      : 0,
    resetSessionTimeout,
    updateActivity,
    validateSession,
    getSessionInfo,
    createSessionData,
    forceLogoutAllSessions,
    generateFingerprint,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
