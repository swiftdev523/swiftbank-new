// Comprehensive logging and monitoring system for banking application
export class Logger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === "development" ? "debug" : "warn";
    this.logs = [];
    this.maxLogs = 1000;
    this.logListeners = [];
    this.metrics = {
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0,
      performance: [],
    };
  }

  // Log levels
  static LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  };

  static LEVEL_NAMES = ["error", "warn", "info", "debug"];

  // Set log level
  setLogLevel(level) {
    this.logLevel = level;
  }

  // Get current log level number
  getCurrentLevelNumber() {
    return Logger.LEVELS[this.logLevel.toUpperCase()];
  }

  // Core logging method
  log(level, message, context = {}, category = "general") {
    const levelNumber = Logger.LEVELS[level.toUpperCase()];
    const currentLevelNumber = this.getCurrentLevelNumber();

    // Don't log if level is below current threshold
    if (levelNumber > currentLevelNumber) {
      return;
    }

    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level: level.toLowerCase(),
      message,
      context,
      category,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update metrics
    this.updateMetrics(level);

    // Console output for development
    if (process.env.NODE_ENV === "development") {
      this.consoleOutput(logEntry);
    }

    // Notify listeners
    this.notifyListeners(logEntry);

    // Send to external logging service in production
    if (
      process.env.NODE_ENV === "production" &&
      levelNumber <= Logger.LEVELS.WARN
    ) {
      this.sendToExternalService(logEntry);
    }

    return logEntry;
  }

  // Convenience methods
  error(message, context, category) {
    return this.log("ERROR", message, context, category);
  }

  warn(message, context, category) {
    return this.log("WARN", message, context, category);
  }

  info(message, context, category) {
    return this.log("INFO", message, context, category);
  }

  debug(message, context, category) {
    return this.log("DEBUG", message, context, category);
  }

  // Security logging
  security(event, details = {}) {
    return this.log("WARN", `Security Event: ${event}`, details, "security");
  }

  // Performance logging
  performance(operation, duration, details = {}) {
    const perfEntry = {
      operation,
      duration,
      timestamp: Date.now(),
      ...details,
    };

    this.metrics.performance.push(perfEntry);

    // Keep only last 100 performance entries
    if (this.metrics.performance.length > 100) {
      this.metrics.performance = this.metrics.performance.slice(-100);
    }

    return this.log(
      "INFO",
      `Performance: ${operation} took ${duration}ms`,
      perfEntry,
      "performance"
    );
  }

  // User action logging
  userAction(action, details = {}) {
    return this.log("INFO", `User Action: ${action}`, details, "user_action");
  }

  // Business logic logging
  business(event, details = {}) {
    return this.log("INFO", `Business Event: ${event}`, details, "business");
  }

  // API logging
  api(method, url, status, duration, details = {}) {
    const level = status >= 400 ? "ERROR" : "INFO";
    return this.log(
      level,
      `API ${method} ${url} - ${status}`,
      {
        method,
        url,
        status,
        duration,
        ...details,
      },
      "api"
    );
  }

  // Console output formatting
  consoleOutput(logEntry) {
    const { level, message, context, category, timestamp } = logEntry;
    const color = this.getLevelColor(level);
    const timeStr = new Date(timestamp).toLocaleTimeString();

    console.groupCollapsed(
      `%c[${level.toUpperCase()}] %c${timeStr} %c[${category}] %c${message}`,
      `color: ${color}; font-weight: bold`,
      "color: #666",
      "color: #333; background: #f0f0f0; padding: 2px 4px; border-radius: 3px",
      "color: #000"
    );

    if (Object.keys(context).length > 0) {
      console.log("Context:", context);
    }

    console.groupEnd();
  }

  // Get color for log level
  getLevelColor(level) {
    const colors = {
      error: "#ff4444",
      warn: "#ffaa00",
      info: "#0088ff",
      debug: "#888888",
    };
    return colors[level] || "#000000";
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem("logger_session_id");
    if (!sessionId) {
      sessionId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem("logger_session_id", sessionId);
    }
    return sessionId;
  }

  // Update metrics
  updateMetrics(level) {
    const key = level.toLowerCase();
    if (this.metrics[key] !== undefined) {
      this.metrics[key]++;
    }
  }

  // Add log listener
  addListener(callback) {
    this.logListeners.push(callback);
  }

  // Remove log listener
  removeListener(callback) {
    this.logListeners = this.logListeners.filter(
      (listener) => listener !== callback
    );
  }

  // Notify listeners
  notifyListeners(logEntry) {
    this.logListeners.forEach((listener) => {
      try {
        listener(logEntry);
      } catch (error) {
        console.error("Log listener error:", error);
      }
    });
  }

  // Send to external logging service
  async sendToExternalService(logEntry) {
    try {
      // In a real application, this would send to a service like LogRocket, Sentry, etc.
      // For now, we'll just simulate it
      if (window.logExternalService) {
        window.logExternalService(logEntry);
      }
    } catch (error) {
      console.error("Failed to send log to external service:", error);
    }
  }

  // Get logs with filters
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(
        (log) => log.category === filters.category
      );
    }

    if (filters.since) {
      const sinceTime = new Date(filters.since).getTime();
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp).getTime() >= sinceTime
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm) ||
          JSON.stringify(log.context).toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // Get metrics
  getMetrics() {
    const totalLogs =
      this.metrics.errors +
      this.metrics.warnings +
      this.metrics.info +
      this.metrics.debug;

    const avgPerformance =
      this.metrics.performance.length > 0
        ? this.metrics.performance.reduce((sum, p) => sum + p.duration, 0) /
          this.metrics.performance.length
        : 0;

    return {
      ...this.metrics,
      totalLogs,
      avgPerformance: Math.round(avgPerformance),
      errorRate:
        totalLogs > 0
          ? ((this.metrics.errors / totalLogs) * 100).toFixed(2)
          : 0,
    };
  }

  // Export logs
  exportLogs(format = "json") {
    const logs = this.getLogs();

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    } else if (format === "csv") {
      const headers = ["timestamp", "level", "category", "message", "context"];
      const csvContent = [
        headers.join(","),
        ...logs.map((log) =>
          [
            log.timestamp,
            log.level,
            log.category,
            `"${log.message.replace(/"/g, '""')}"`,
            `"${JSON.stringify(log.context).replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

      return csvContent;
    }

    return logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.metrics = {
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0,
      performance: [],
    };
  }

  // Create child logger with category
  createChild(category) {
    const childLogger = {
      error: (message, context) => this.error(message, context, category),
      warn: (message, context) => this.warn(message, context, category),
      info: (message, context) => this.info(message, context, category),
      debug: (message, context) => this.debug(message, context, category),
      security: (event, details) => this.security(event, details),
      performance: (operation, duration, details) =>
        this.performance(operation, duration, details),
      userAction: (action, details) => this.userAction(action, details),
      business: (event, details) => this.business(event, details),
      api: (method, url, status, duration, details) =>
        this.api(method, url, status, duration, details),
    };

    return childLogger;
  }
}

// Error boundary integration
export class ErrorTracker {
  constructor(logger) {
    this.logger = logger;
    this.errorCount = 0;
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.trackError(event.reason, "unhandled_promise_rejection");
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      this.trackError(event.error, "global_error", {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }

  trackError(error, type = "error", context = {}) {
    this.errorCount++;

    const errorData = {
      name: error?.name || "Unknown",
      message: error?.message || String(error),
      stack: error?.stack,
      type,
      count: this.errorCount,
      url: window.location.href,
      timestamp: Date.now(),
      ...context,
    };

    this.logger.error(
      `${type}: ${errorData.message}`,
      errorData,
      "error_tracking"
    );

    return errorData;
  }

  getErrorStats() {
    return {
      totalErrors: this.errorCount,
      errorLogs: this.logger.getLogs({ level: "error" }),
    };
  }
}

// Analytics tracker
export class AnalyticsTracker {
  constructor(logger) {
    this.logger = logger;
    this.pageViews = [];
    this.userActions = [];
    this.setupAnalytics();
  }

  setupAnalytics() {
    // Track page views
    this.trackPageView();

    // Track page changes in SPA
    window.addEventListener("popstate", () => {
      this.trackPageView();
    });
  }

  trackPageView(page = window.location.pathname) {
    const pageView = {
      page,
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };

    this.pageViews.push(pageView);
    this.logger.info(`Page View: ${page}`, pageView, "analytics");
  }

  trackEvent(event, properties = {}) {
    const eventData = {
      event,
      properties,
      timestamp: Date.now(),
      page: window.location.pathname,
    };

    this.userActions.push(eventData);
    this.logger.userAction(event, eventData);
  }

  getAnalytics() {
    return {
      pageViews: this.pageViews,
      userActions: this.userActions,
      totalPageViews: this.pageViews.length,
      totalUserActions: this.userActions.length,
    };
  }
}

// Global instances
export const logger = new Logger();
export const errorTracker = new ErrorTracker(logger);
export const analyticsTracker = new AnalyticsTracker(logger);

// React hooks
import { useState, useEffect } from "react";

export function useLogger(category) {
  return logger.createChild(category);
}

export function useLogs(filters = {}) {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const updateLogs = () => {
      setLogs(logger.getLogs(filters));
      setMetrics(logger.getMetrics());
    };

    updateLogs();
    logger.addListener(updateLogs);

    return () => {
      logger.removeListener(updateLogs);
    };
  }, [JSON.stringify(filters)]);

  return { logs, metrics };
}

export function useErrorTracking() {
  const [errorStats, setErrorStats] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setErrorStats(errorTracker.getErrorStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return errorStats;
}

export default { logger, errorTracker, analyticsTracker };
