// Error types for consistent error handling
export const ErrorTypes = {
  AUTHENTICATION: "AUTH_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  NETWORK: "NETWORK_ERROR",
  PERMISSION: "PERMISSION_ERROR",
  TRANSACTION: "TRANSACTION_ERROR",
  RATE_LIMIT: "RATE_LIMIT_ERROR",
  TIMEOUT: "TIMEOUT_ERROR",
  OFFLINE: "OFFLINE_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// Retry configuration for different error types
export const RetryConfig = {
  [ErrorTypes.NETWORK]: { attempts: 3, delay: 1000, backoff: 2 },
  [ErrorTypes.TIMEOUT]: { attempts: 2, delay: 500, backoff: 1.5 },
  [ErrorTypes.RATE_LIMIT]: { attempts: 3, delay: 2000, backoff: 3 },
  [ErrorTypes.UNKNOWN]: { attempts: 1, delay: 0, backoff: 1 },
};

export class AppError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date();
    this.name = "AppError";
    this.retryable = this.isRetryable();
  }

  isRetryable() {
    return [
      ErrorTypes.NETWORK,
      ErrorTypes.TIMEOUT,
      ErrorTypes.RATE_LIMIT,
    ].includes(this.type);
  }

  getUserFriendlyMessage() {
    const messages = {
      [ErrorTypes.AUTHENTICATION]:
        "Please check your login credentials and try again.",
      [ErrorTypes.VALIDATION]: "Please check your input and try again.",
      [ErrorTypes.NETWORK]:
        "Connection problem. Please check your internet and try again.",
      [ErrorTypes.PERMISSION]:
        "You don't have permission to perform this action.",
      [ErrorTypes.TRANSACTION]:
        "Transaction failed. Please try again or contact support.",
      [ErrorTypes.RATE_LIMIT]:
        "Too many requests. Please wait a moment and try again.",
      [ErrorTypes.TIMEOUT]: "Request timed out. Please try again.",
      [ErrorTypes.OFFLINE]:
        "You appear to be offline. Please check your connection.",
      [ErrorTypes.UNKNOWN]:
        "Something went wrong. Please try again or contact support.",
    };
    return messages[this.type] || this.message;
  }

  static auth(message, details = {}) {
    return new AppError(ErrorTypes.AUTHENTICATION, message, details);
  }

  static validation(message, details = {}) {
    return new AppError(ErrorTypes.VALIDATION, message, details);
  }

  static network(message, details = {}) {
    return new AppError(ErrorTypes.NETWORK, message, details);
  }

  static permission(message, details = {}) {
    return new AppError(ErrorTypes.PERMISSION, message, details);
  }

  static transaction(message, details = {}) {
    return new AppError(ErrorTypes.TRANSACTION, message, details);
  }

  static rateLimit(message, details = {}) {
    return new AppError(ErrorTypes.RATE_LIMIT, message, details);
  }

  static timeout(message, details = {}) {
    return new AppError(ErrorTypes.TIMEOUT, message, details);
  }

  static offline(message, details = {}) {
    return new AppError(ErrorTypes.OFFLINE, message, details);
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
    };
  }
}

// Enhanced retry utility with exponential backoff
export const withRetry = async (fn, options = {}) => {
  const defaultOptions = {
    attempts: 3,
    delay: 1000,
    backoff: 2,
    onRetry: null,
  };

  const config = { ...defaultOptions, ...options };
  let lastError = null;

  for (let attempt = 1; attempt <= config.attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (
        attempt === config.attempts ||
        (error instanceof AppError && !error.retryable)
      ) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = config.delay * Math.pow(config.backoff, attempt - 1);

      // Call retry callback if provided
      if (config.onRetry) {
        config.onRetry(error, attempt, delay);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Network status detection
export const NetworkMonitor = {
  isOnline: () => navigator.onLine,

  onOffline: (callback) => {
    window.addEventListener("offline", callback);
    return () => window.removeEventListener("offline", callback);
  },

  onOnline: (callback) => {
    window.addEventListener("online", callback);
    return () => window.removeEventListener("online", callback);
  },
};

// Error logger for development and production
export const ErrorLogger = {
  log: (error, context = {}) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      error:
        error instanceof AppError
          ? error.toJSON()
          : {
              type: ErrorTypes.UNKNOWN,
              message: error.message,
              stack: error.stack,
            },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error logged:", errorData);
    }

    // Here you could send to external logging service
    // Example: Sentry, LogRocket, etc.
  },

  logUserAction: (action, details = {}) => {
    const actionData = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("User action:", actionData);
    }
  },
};

// Error handler function that will be used across the application
export const handleError = (error, context = {}) => {
  const errorDetails = {
    ...(error instanceof AppError ? error.details : {}),
    context,
    timestamp: new Date(),
  };

  // Log the error
  ErrorLogger.log(error, errorDetails);

  // Return user-friendly error for UI display
  if (error instanceof AppError) {
    return {
      type: error.type,
      message: error.getUserFriendlyMessage(),
      retryable: error.retryable,
    };
  }

  // Handle unknown errors
  return {
    type: ErrorTypes.UNKNOWN,
    message: "Something went wrong. Please try again or contact support.",
    retryable: false,
  };
};

// Validation utilities
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === "") {
    throw AppError.validation(`${fieldName} is required`);
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw AppError.validation("Please enter a valid email address");
  }
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    throw AppError.validation("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw AppError.validation(
      "Password must contain uppercase, lowercase, and number"
    );
  }
};

export const validateAmount = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw AppError.validation("Please enter a valid amount greater than 0");
  }

  if (numAmount > 1000000) {
    throw AppError.validation("Amount cannot exceed $1,000,000");
  }
};

// Timeout wrapper for async operations
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(AppError.timeout(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
};
