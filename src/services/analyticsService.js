/**
 * Firebase Analytics and Performance Service
 * Provides comprehensive analytics tracking and performance monitoring
 */

import {
  getAnalytics,
  logEvent,
  setUserProperties,
  setUserId,
  setCurrentScreen,
} from "firebase/analytics";
import {
  getPerformance,
  trace,
  connectPerformanceEmulator,
} from "firebase/performance";
import { app } from "../config/firebase";

class AnalyticsService {
  constructor() {
    this.analytics = null;
    this.performance = null;
    this.traces = new Map();

    this.initializeServices();
  }

  initializeServices() {
    try {
      // Initialize Analytics
      if (typeof window !== "undefined" && import.meta.env.PROD) {
        this.analytics = getAnalytics(app);
        console.log("Firebase Analytics initialized");
      }

      // Initialize Performance Monitoring
      if (typeof window !== "undefined") {
        this.performance = getPerformance(app);
        console.log("Firebase Performance initialized");
      }
    } catch (error) {
      console.warn("Analytics/Performance initialization failed:", error);
    }
  }

  // ============================================================================
  // ANALYTICS EVENTS
  // ============================================================================

  // User Authentication Events
  trackLogin(method = "email") {
    this.logEvent("login", { method });
  }

  trackSignUp(method = "email") {
    this.logEvent("sign_up", { method });
  }

  trackLogout() {
    this.logEvent("logout");
  }

  // Banking Events
  trackAccountView(accountType, accountId) {
    this.logEvent("view_account", {
      account_type: accountType,
      account_id: accountId,
    });
  }

  trackTransactionInitiated(transactionType, amount, currency = "USD") {
    this.logEvent("transaction_initiated", {
      transaction_type: transactionType,
      value: amount,
      currency: currency,
    });
  }

  trackTransactionCompleted(
    transactionType,
    amount,
    currency = "USD",
    success = true
  ) {
    this.logEvent("transaction_completed", {
      transaction_type: transactionType,
      value: amount,
      currency: currency,
      success: success,
    });
  }

  trackTransferMoney(fromAccount, toAccount, amount) {
    this.logEvent("transfer_money", {
      from_account_type: fromAccount,
      to_account_type: toAccount,
      value: amount,
      currency: "USD",
    });
  }

  trackDeposit(accountType, amount, method = "mobile") {
    this.logEvent("deposit", {
      account_type: accountType,
      value: amount,
      currency: "USD",
      method: method,
    });
  }

  trackWithdrawal(accountType, amount, method = "atm") {
    this.logEvent("withdrawal", {
      account_type: accountType,
      value: amount,
      currency: "USD",
      method: method,
    });
  }

  // Navigation Events
  trackPageView(pageName, pageTitle = "") {
    if (this.analytics) {
      setCurrentScreen(this.analytics, pageName, {
        page_title: pageTitle,
      });
    }

    this.logEvent("page_view", {
      page_location: window.location.href,
      page_title: pageTitle || document.title,
      page_name: pageName,
    });
  }

  trackButtonClick(buttonName, section = "", page = "") {
    this.logEvent("button_click", {
      button_name: buttonName,
      section: section,
      page: page,
    });
  }

  trackModalOpen(modalName, trigger = "") {
    this.logEvent("modal_open", {
      modal_name: modalName,
      trigger: trigger,
    });
  }

  trackModalClose(modalName, duration = 0) {
    this.logEvent("modal_close", {
      modal_name: modalName,
      duration_seconds: duration,
    });
  }

  // Feature Usage
  trackFeatureUsage(featureName, context = {}) {
    this.logEvent("feature_usage", {
      feature_name: featureName,
      ...context,
    });
  }

  trackSearchPerformed(searchTerm, resultCount = 0, section = "") {
    this.logEvent("search", {
      search_term: searchTerm,
      result_count: resultCount,
      section: section,
    });
  }

  trackFilterApplied(filterType, filterValue, section = "") {
    this.logEvent("filter_applied", {
      filter_type: filterType,
      filter_value: filterValue,
      section: section,
    });
  }

  // Error Tracking
  trackError(errorType, errorMessage, context = {}) {
    this.logEvent("error_occurred", {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    });
  }

  trackApiError(endpoint, statusCode, errorMessage) {
    this.logEvent("api_error", {
      endpoint: endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  }

  // Admin Events
  trackAdminAction(action, targetType, targetId = "", details = {}) {
    this.logEvent("admin_action", {
      action: action,
      target_type: targetType,
      target_id: targetId,
      ...details,
    });
  }

  // Custom Events
  trackCustomEvent(eventName, parameters = {}) {
    this.logEvent(eventName, parameters);
  }

  // ============================================================================
  // USER PROPERTIES
  // ============================================================================

  setUser(userId, userProperties = {}) {
    try {
      if (this.analytics) {
        setUserId(this.analytics, userId);

        const properties = {
          user_role: userProperties.role || "customer",
          account_count: userProperties.accountCount || 0,
          registration_date:
            userProperties.registrationDate || new Date().toISOString(),
          ...userProperties,
        };

        setUserProperties(this.analytics, properties);
      }
    } catch (error) {
      console.error("Error setting user properties:", error);
    }
  }

  updateUserProperty(propertyName, value) {
    try {
      if (this.analytics) {
        setUserProperties(this.analytics, { [propertyName]: value });
      }
    } catch (error) {
      console.error("Error updating user property:", error);
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  startTrace(traceName) {
    try {
      if (this.performance) {
        const performanceTrace = trace(this.performance, traceName);
        performanceTrace.start();
        this.traces.set(traceName, performanceTrace);
        return traceName;
      }
    } catch (error) {
      console.error("Error starting trace:", error);
    }
    return null;
  }

  stopTrace(traceName) {
    try {
      const performanceTrace = this.traces.get(traceName);
      if (performanceTrace) {
        performanceTrace.stop();
        this.traces.delete(traceName);
      }
    } catch (error) {
      console.error("Error stopping trace:", error);
    }
  }

  addTraceAttribute(traceName, attributeName, value) {
    try {
      const performanceTrace = this.traces.get(traceName);
      if (performanceTrace) {
        performanceTrace.putAttribute(attributeName, value);
      }
    } catch (error) {
      console.error("Error adding trace attribute:", error);
    }
  }

  addTraceMetric(traceName, metricName, value) {
    try {
      const performanceTrace = this.traces.get(traceName);
      if (performanceTrace) {
        performanceTrace.putMetric(metricName, value);
      }
    } catch (error) {
      console.error("Error adding trace metric:", error);
    }
  }

  // Convenience methods for common traces
  async trackPageLoadTime(pageName, loadFunction) {
    const traceName = `page_load_${pageName}`;
    this.startTrace(traceName);

    try {
      const startTime = Date.now();
      const result = await loadFunction();
      const loadTime = Date.now() - startTime;

      this.addTraceMetric(traceName, "load_time_ms", loadTime);
      this.addTraceAttribute(traceName, "page_name", pageName);

      return result;
    } finally {
      this.stopTrace(traceName);
    }
  }

  async trackApiCall(endpoint, apiFunction) {
    const traceName = `api_call_${endpoint.replace(/[^a-zA-Z0-9]/g, "_")}`;
    this.startTrace(traceName);

    try {
      const startTime = Date.now();
      const result = await apiFunction();
      const responseTime = Date.now() - startTime;

      this.addTraceMetric(traceName, "response_time_ms", responseTime);
      this.addTraceAttribute(traceName, "endpoint", endpoint);
      this.addTraceAttribute(traceName, "success", "true");

      return result;
    } catch (error) {
      this.addTraceAttribute(traceName, "success", "false");
      this.addTraceAttribute(traceName, "error", error.message);
      throw error;
    } finally {
      this.stopTrace(traceName);
    }
  }

  async trackDatabaseOperation(operation, collectionName, operationFunction) {
    const traceName = `db_${operation}_${collectionName}`;
    this.startTrace(traceName);

    try {
      const startTime = Date.now();
      const result = await operationFunction();
      const operationTime = Date.now() - startTime;

      this.addTraceMetric(traceName, "operation_time_ms", operationTime);
      this.addTraceAttribute(traceName, "operation", operation);
      this.addTraceAttribute(traceName, "collection", collectionName);
      this.addTraceAttribute(traceName, "success", "true");

      return result;
    } catch (error) {
      this.addTraceAttribute(traceName, "success", "false");
      this.addTraceAttribute(traceName, "error", error.message);
      throw error;
    } finally {
      this.stopTrace(traceName);
    }
  }

  // ============================================================================
  // BUSINESS METRICS
  // ============================================================================

  trackBusinessMetric(metricName, value, unit = "count") {
    this.logEvent("business_metric", {
      metric_name: metricName,
      metric_value: value,
      unit: unit,
      timestamp: Date.now(),
    });
  }

  trackAccountBalance(accountType, balance) {
    this.trackBusinessMetric("account_balance", balance, "currency");
    this.logEvent("account_balance_tracked", {
      account_type: accountType,
      balance: balance,
      currency: "USD",
    });
  }

  trackDailyActiveUsers() {
    this.trackBusinessMetric("daily_active_user", 1, "count");
  }

  trackSessionDuration(duration) {
    this.logEvent("session_duration", {
      duration_seconds: duration,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  logEvent(eventName, parameters = {}) {
    try {
      if (this.analytics) {
        // Add common parameters to all events
        const enhancedParameters = {
          ...parameters,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        };

        logEvent(this.analytics, eventName, enhancedParameters);
      }

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.log(`Analytics Event: ${eventName}`, parameters);
      }
    } catch (error) {
      console.error("Error logging event:", error);
    }
  }

  // Batch event logging for better performance
  logEvents(events) {
    events.forEach(({ eventName, parameters }) => {
      this.logEvent(eventName, parameters);
    });
  }

  // Debug information
  getAnalyticsInfo() {
    return {
      analyticsEnabled: !!this.analytics,
      performanceEnabled: !!this.performance,
      activeTraces: Array.from(this.traces.keys()),
      environment: import.meta.env.MODE,
    };
  }

  // Clean up traces on unmount
  cleanup() {
    this.traces.forEach((trace, traceName) => {
      this.stopTrace(traceName);
    });
    this.traces.clear();
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// HOC for automatic page tracking
export const withAnalytics = (WrappedComponent, pageName) => {
  return function WithAnalyticsComponent(props) {
    React.useEffect(() => {
      analyticsService.trackPageView(pageName);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};

// Hook for analytics in functional components
export const useAnalytics = () => {
  return {
    trackEvent: analyticsService.logEvent.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    startTrace: analyticsService.startTrace.bind(analyticsService),
    stopTrace: analyticsService.stopTrace.bind(analyticsService),
  };
};

export default analyticsService;
