/**
 * Firebase Performance Monitoring Service
 * Enhanced performance tracking for the banking application
 */

import {
  getPerformance,
  trace,
  connectPerformanceEmulator,
} from "firebase/performance";
import { app } from "../config/firebase";

class PerformanceService {
  constructor() {
    try {
      this.perf = getPerformance(app);

      // Connect to emulator in development
      if (import.meta.env.MODE === "development") {
        connectPerformanceEmulator(this.perf, "localhost", 9187);
      }

      console.log("Performance monitoring initialized");
    } catch (error) {
      console.error("Error initializing performance monitoring:", error);
      this.perf = null;
    }

    this.traces = new Map();
    this.customMetrics = new Map();
  }

  /**
   * Start a performance trace
   * @param {string} traceName - Name of the trace
   * @param {Object} customAttributes - Optional custom attributes
   * @returns {Object} Trace object
   */
  startTrace(traceName, customAttributes = {}) {
    if (!this.perf) return null;

    try {
      const performanceTrace = trace(this.perf, traceName);

      // Add custom attributes
      Object.entries(customAttributes).forEach(([key, value]) => {
        performanceTrace.putAttribute(key, String(value));
      });

      performanceTrace.start();

      // Store trace for later reference
      this.traces.set(traceName, {
        trace: performanceTrace,
        startTime: Date.now(),
        attributes: customAttributes,
      });

      console.log(`Started trace: ${traceName}`);
      return performanceTrace;
    } catch (error) {
      console.error(`Error starting trace ${traceName}:`, error);
      return null;
    }
  }

  /**
   * Stop a performance trace
   * @param {string} traceName - Name of the trace to stop
   * @param {Object} additionalMetrics - Additional metrics to record
   */
  stopTrace(traceName, additionalMetrics = {}) {
    if (!this.perf || !this.traces.has(traceName)) return;

    try {
      const traceData = this.traces.get(traceName);
      const { trace: performanceTrace, startTime } = traceData;

      // Add duration as custom metric
      const duration = Date.now() - startTime;
      performanceTrace.putMetric("duration_ms", duration);

      // Add additional metrics
      Object.entries(additionalMetrics).forEach(([key, value]) => {
        performanceTrace.putMetric(key, Number(value));
      });

      performanceTrace.stop();
      this.traces.delete(traceName);

      console.log(`Stopped trace: ${traceName}, Duration: ${duration}ms`);
    } catch (error) {
      console.error(`Error stopping trace ${traceName}:`, error);
    }
  }

  /**
   * Record a custom metric
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} attributes - Additional attributes
   */
  recordMetric(metricName, value, attributes = {}) {
    if (!this.perf) return;

    try {
      // Store custom metrics for batch reporting
      this.customMetrics.set(metricName, {
        value,
        attributes,
        timestamp: Date.now(),
      });

      console.log(`Recorded metric: ${metricName} = ${value}`);
    } catch (error) {
      console.error(`Error recording metric ${metricName}:`, error);
    }
  }

  // Banking-specific performance tracking methods

  /**
   * Track transaction processing performance
   * @param {string} transactionType - Type of transaction
   * @param {string} transactionId - Transaction ID
   */
  trackTransaction(transactionType, transactionId) {
    return this.startTrace(`transaction_${transactionType}`, {
      transaction_type: transactionType,
      transaction_id: transactionId,
      user_agent: navigator.userAgent.substring(0, 100),
    });
  }

  /**
   * Track page load performance
   * @param {string} pageName - Name of the page
   */
  trackPageLoad(pageName) {
    return this.startTrace(`page_load_${pageName}`, {
      page_name: pageName,
      connection_type: navigator.connection?.effectiveType || "unknown",
    });
  }

  /**
   * Track API call performance
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   */
  trackApiCall(endpoint, method = "GET") {
    return this.startTrace(`api_call_${endpoint.replace(/\//g, "_")}`, {
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track authentication performance
   * @param {string} authMethod - Authentication method (login, register, etc.)
   */
  trackAuthentication(authMethod) {
    return this.startTrace(`auth_${authMethod}`, {
      auth_method: authMethod,
      device_type: this.getDeviceType(),
    });
  }

  /**
   * Track database operations
   * @param {string} operation - Database operation (read, write, etc.)
   * @param {string} collection - Firestore collection name
   */
  trackDatabaseOperation(operation, collection) {
    return this.startTrace(`db_${operation}_${collection}`, {
      operation,
      collection,
      cache_enabled: "true", // Assuming cache is enabled
    });
  }

  /**
   * Track form submission performance
   * @param {string} formName - Name of the form
   */
  trackFormSubmission(formName) {
    return this.startTrace(`form_${formName}`, {
      form_name: formName,
      input_method: "web",
    });
  }

  /**
   * Get device type for performance context
   * @returns {string} Device type
   */
  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }

  /**
   * Monitor Core Web Vitals
   */
  initWebVitalsMonitoring() {
    if (typeof window !== "undefined") {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric("lcp", lastEntry.startTime, {
          element: lastEntry.element?.tagName || "unknown",
        });
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        this.recordMetric(
          "fid",
          firstInput.processingStart - firstInput.startTime,
          {
            event_type: firstInput.name,
          }
        );
      }).observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric("cls", clsValue);
      }).observe({ entryTypes: ["layout-shift"] });
    }
  }

  /**
   * Get performance insights
   * @returns {Object} Performance summary
   */
  getPerformanceInsights() {
    return {
      activeTraces: Array.from(this.traces.keys()),
      customMetrics: Array.from(this.customMetrics.entries()),
      deviceType: this.getDeviceType(),
      connectionType: navigator.connection?.effectiveType || "unknown",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Export performance data for analysis
   * @returns {Object} Exported performance data
   */
  exportData() {
    const data = {
      traces: Object.fromEntries(this.traces),
      metrics: Object.fromEntries(this.customMetrics),
      deviceInfo: {
        userAgent: navigator.userAgent,
        deviceType: this.getDeviceType(),
        connectionType: navigator.connection?.effectiveType || "unknown",
        language: navigator.language,
        platform: navigator.platform,
      },
      exportTime: new Date().toISOString(),
    };

    console.log("Performance data exported:", data);
    return data;
  }
}

// Create and export singleton instance
const performanceService = new PerformanceService();

// Initialize Web Vitals monitoring
if (typeof window !== "undefined") {
  performanceService.initWebVitalsMonitoring();
}

export default performanceService;
export { PerformanceService };
