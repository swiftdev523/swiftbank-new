import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Security constants
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Account lockout management
  const checkAccountLockout = useCallback(() => {
    const lockoutData = localStorage.getItem("accountLockout");
    if (lockoutData) {
      const { timestamp, attempts } = JSON.parse(lockoutData);
      const timeSinceLockout = Date.now() - timestamp;

      if (
        timeSinceLockout < LOCKOUT_DURATION &&
        attempts >= MAX_LOGIN_ATTEMPTS
      ) {
        setIsLocked(true);
        setLoginAttempts(attempts);
        return true;
      } else if (timeSinceLockout >= LOCKOUT_DURATION) {
        // Reset lockout after duration
        localStorage.removeItem("accountLockout");
        setIsLocked(false);
        setLoginAttempts(0);
      }
    }
    return false;
  }, []);

  // Initialize security state on mount
  useEffect(() => {
    checkAccountLockout();
  }, [checkAccountLockout]);

  // Handle failed login attempt
  const handleFailedLogin = useCallback(() => {
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

      return {
        isLocked: true,
        error: "Too many failed attempts. Account locked for 15 minutes.",
        attemptsRemaining: 0,
      };
    }

    return {
      isLocked: false,
      error: `Invalid credentials. ${
        MAX_LOGIN_ATTEMPTS - newAttempts
      } attempts remaining.`,
      attemptsRemaining: MAX_LOGIN_ATTEMPTS - newAttempts,
    };
  }, [loginAttempts]);

  // Handle successful login (reset security state)
  const handleSuccessfulLogin = useCallback(() => {
    setLoginAttempts(0);
    setIsLocked(false);
    localStorage.removeItem("accountLockout");
  }, []);

  // Check if login is allowed
  const canAttemptLogin = useCallback(() => {
    if (checkAccountLockout()) {
      const lockoutData = JSON.parse(localStorage.getItem("accountLockout"));
      const remainingTime = Math.ceil(
        (LOCKOUT_DURATION - (Date.now() - lockoutData.timestamp)) / 60000
      );
      return {
        allowed: false,
        error: `Account temporarily locked. Try again in ${remainingTime} minutes.`,
        remainingTime,
      };
    }
    return { allowed: true };
  }, [checkAccountLockout]);

  // Security validation for high-security operations
  const validateHighSecurity = useCallback((sessionInfo) => {
    if (!sessionInfo || !sessionInfo.isActive) {
      return {
        valid: false,
        reason: "Invalid or expired session",
      };
    }

    // Check for recent authentication for sensitive operations (15 minutes)
    const lastLoginTime = sessionInfo.loginTime;
    const timeSinceLogin = Date.now() - lastLoginTime.getTime();

    if (timeSinceLogin > 15 * 60 * 1000) {
      return {
        valid: false,
        reason: "Recent authentication required for this operation",
      };
    }

    return { valid: true };
  }, []);

  // Enhanced input validation for login
  const validateLoginInput = useCallback((username, password) => {
    const errors = [];

    if (!username || !password) {
      errors.push("Username and password are required");
    }

    if (username && username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (password && password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    // Basic input sanitization
    const sanitizedUsername = username ? username.trim().toLowerCase() : "";
    const hasValidFormat = /^[a-zA-Z0-9._@-]+$/.test(sanitizedUsername);

    if (username && !hasValidFormat) {
      errors.push("Username contains invalid characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedUsername,
    };
  }, []);

  // Generate secure random delay for login attempts (prevent timing attacks)
  const getSecureDelay = useCallback(() => {
    return 800 + Math.random() * 400; // 800-1200ms
  }, []);

  // Security audit logging (in production, this would log to backend)
  const logSecurityEvent = useCallback((event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: "127.0.0.1", // In production, get real IP
    };

    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.log("Security Event:", logEntry);
    }

    // In production, send to backend security logging service
    // fetch('/api/security/log', { method: 'POST', body: JSON.stringify(logEntry) });
  }, []);

  // Password strength validation
  const validatePasswordStrength = useCallback((password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength = "Very Weak";

    if (score >= 4) strength = "Strong";
    else if (score >= 3) strength = "Medium";
    else if (score >= 2) strength = "Weak";

    return {
      score,
      strength,
      checks,
      isValid: score >= 3,
    };
  }, []);

  const value = {
    loginAttempts,
    isLocked,
    canAttemptLogin,
    handleFailedLogin,
    handleSuccessfulLogin,
    validateHighSecurity,
    validateLoginInput,
    validatePasswordStrength,
    getSecureDelay,
    logSecurityEvent,
    checkAccountLockout,
    MAX_LOGIN_ATTEMPTS,
    LOCKOUT_DURATION,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
