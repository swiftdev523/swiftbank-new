/**
 * Enhanced Firebase Integration Layer
 * Combines all Firebase services with comprehensive monitoring and logging
 */

import firestoreService from "./enhancedFirestoreService";
import analyticsService from "./analyticsService";
import notificationService from "./notificationService";
import performanceService from "./performanceService";
import auditLogService from "./auditLogService";

class FirebaseIntegrationService {
  constructor() {
    this.services = {
      firestore: firestoreService,
      analytics: analyticsService,
      notifications: notificationService,
      performance: performanceService,
      auditLog: auditLogService,
    };

    this.initialized = false;
    this.errorHandlers = new Map();

    console.log("Firebase Integration Service created");
  }

  /**
   * Initialize all Firebase services with comprehensive monitoring
   * @returns {Promise} Initialization promise
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log("Initializing Firebase Integration Service...");

      // Start performance trace for initialization
      const initTrace = this.services.performance.startTrace("firebase_init", {
        service_count: Object.keys(this.services).length,
      });

      // Initialize audit logging first
      this.services.auditLog.initialize();

      // Log the initialization attempt
      await this.services.auditLog.logSecurityEvent("firebase_init_start", {
        timestamp: new Date().toISOString(),
        services: Object.keys(this.services),
      });

      // Initialize analytics service
      this.services.analytics.initialize();

      // Set up global error handling
      this.setupGlobalErrorHandling();

      // Set up service integration hooks
      this.setupServiceIntegration();

      // Track successful initialization
      this.services.analytics.trackEvent("firebase_services_initialized", {
        service_count: Object.keys(this.services).length,
        success: true,
      });

      // Stop initialization trace
      this.services.performance.stopTrace("firebase_init", {
        success: 1,
        services_initialized: Object.keys(this.services).length,
      });

      // Log successful initialization
      await this.services.auditLog.logSecurityEvent("firebase_init_complete", {
        success: true,
        duration_ms:
          Date.now() - parseInt(this.services.auditLog.sessionId.split("_")[1]),
      });

      this.initialized = true;
      console.log("Firebase Integration Service initialized successfully");
    } catch (error) {
      console.error(
        "Firebase Integration Service initialization failed:",
        error
      );

      // Track initialization failure
      this.services.analytics.trackEvent("firebase_init_error", {
        error: error.message,
        success: false,
      });

      // Log initialization failure
      await this.services.auditLog.logSecurityEvent("firebase_init_failed", {
        error: error.message,
        severity: "critical",
      });

      throw error;
    }
  }

  /**
   * Setup global error handling for all services
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", async (event) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Log security event for unhandled errors
      await this.services.auditLog.logSecurityEvent("unhandled_error", {
        error: event.reason?.message || String(event.reason),
        type: "unhandled_promise_rejection",
        severity: "error",
      });

      // Track in analytics
      this.services.analytics.trackEvent("unhandled_error", {
        error_type: "promise_rejection",
        error_message: event.reason?.message || "Unknown error",
      });
    });

    // Handle JavaScript errors
    window.addEventListener("error", async (event) => {
      console.error("JavaScript error:", event.error);

      // Log security event for JavaScript errors
      await this.services.auditLog.logSecurityEvent("javascript_error", {
        error: event.error?.message || event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: "error",
      });

      // Track in analytics
      this.services.analytics.trackEvent("javascript_error", {
        error_message: event.error?.message || event.message,
        filename: event.filename,
      });
    });
  }

  /**
   * Setup integration hooks between services
   */
  setupServiceIntegration() {
    // Enhance Firestore operations with automatic logging and analytics
    this.enhanceFirestoreOperations();

    // Enhance authentication with comprehensive tracking
    this.enhanceAuthentication();

    // Setup automatic performance monitoring
    this.setupPerformanceMonitoring();
  }

  /**
   * Enhance Firestore operations with integrated logging and analytics
   */
  enhanceFirestoreOperations() {
    const originalMethods = ["create", "read", "update", "delete", "query"];

    originalMethods.forEach((method) => {
      const original = this.services.firestore[method];
      if (typeof original === "function") {
        this.services.firestore[method] = async (...args) => {
          const [collection, ...otherArgs] = args;

          // Start performance trace
          const trace = this.services.performance.trackDatabaseOperation(
            method,
            collection
          );

          try {
            // Execute original operation
            const result = await original.apply(this.services.firestore, args);

            // Log successful operation
            await this.services.auditLog.logDataAccess(
              method,
              collection,
              otherArgs[0] || null,
              {
                success: true,
                timestamp: new Date().toISOString(),
              }
            );

            // Track analytics
            this.services.analytics.trackEvent(`firestore_${method}`, {
              collection,
              success: true,
            });

            // Stop performance trace
            if (trace) {
              this.services.performance.stopTrace(
                `db_${method}_${collection}`,
                {
                  success: 1,
                  record_count: Array.isArray(result) ? result.length : 1,
                }
              );
            }

            return result;
          } catch (error) {
            // Log failed operation
            await this.services.auditLog.logDataAccess(
              method,
              collection,
              otherArgs[0] || null,
              {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
              }
            );

            // Track error analytics
            this.services.analytics.trackEvent(`firestore_${method}_error`, {
              collection,
              error: error.message,
              success: false,
            });

            // Stop performance trace with error
            if (trace) {
              this.services.performance.stopTrace(
                `db_${method}_${collection}`,
                {
                  success: 0,
                  error_type: error.code || "unknown",
                }
              );
            }

            throw error;
          }
        };
      }
    });
  }

  /**
   * Enhance authentication with comprehensive tracking
   */
  enhanceAuthentication() {
    // This would typically hook into your AuthContext
    // For now, we'll provide methods to be called manually

    this.trackLogin = async (userId, method = "email") => {
      const trace = this.services.performance.trackAuthentication("login");

      try {
        await this.services.auditLog.logAuthentication("login", {
          method,
          success: true,
          userId,
        });

        this.services.analytics.trackEvent("user_login", {
          method,
          success: true,
        });

        if (trace) {
          this.services.performance.stopTrace(`auth_login`, {
            success: 1,
            method,
          });
        }

        // Send welcome notification
        await this.services.notifications.sendNotification(userId, {
          title: "Welcome Back!",
          message: "You have successfully logged in to your account.",
          type: "auth",
          priority: "low",
        });
      } catch (error) {
        await this.services.auditLog.logAuthentication("login", {
          method,
          success: false,
          error: error.message,
          userId,
        });

        this.services.analytics.trackEvent("user_login_error", {
          method,
          error: error.message,
          success: false,
        });

        if (trace) {
          this.services.performance.stopTrace(`auth_login`, {
            success: 0,
            error_type: "auth_failed",
          });
        }
      }
    };

    this.trackLogout = async (userId) => {
      await this.services.auditLog.logAuthentication("logout", {
        userId,
        success: true,
      });

      this.services.analytics.trackEvent("user_logout", {
        success: true,
      });
    };
  }

  /**
   * Setup automatic performance monitoring for key operations
   */
  setupPerformanceMonitoring() {
    // Monitor page navigation
    if (typeof window !== "undefined") {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function (...args) {
        performanceService.trackPageLoad(args[2] || "unknown_page");
        return originalPushState.apply(this, args);
      };

      window.history.replaceState = function (...args) {
        performanceService.trackPageLoad(args[2] || "unknown_page");
        return originalReplaceState.apply(this, args);
      };
    }
  }

  /**
   * Execute transaction with full monitoring and logging
   * @param {string} transactionType - Type of transaction
   * @param {Object} transactionData - Transaction data
   * @param {Function} operation - Operation to execute
   * @returns {Promise} Transaction result
   */
  async executeMonitoredTransaction(
    transactionType,
    transactionData,
    operation
  ) {
    const transactionId = transactionData.id || `tx_${Date.now()}`;

    // Start comprehensive monitoring
    const performanceTrace = this.services.performance.trackTransaction(
      transactionType,
      transactionId
    );

    try {
      // Log transaction start
      await this.services.auditLog.logTransaction("start", transactionId, {
        type: transactionType,
        amount: transactionData.amount,
        fromAccount: transactionData.fromAccount,
        toAccount: transactionData.toAccount,
      });

      // Execute the operation
      const result = await operation(transactionData);

      // Log successful completion
      await this.services.auditLog.logTransaction("complete", transactionId, {
        type: transactionType,
        success: true,
        result: result.id || "completed",
      });

      // Track successful transaction
      this.services.analytics.trackEvent("transaction_completed", {
        type: transactionType,
        amount: transactionData.amount,
        success: true,
      });

      // Send notification
      await this.services.notifications.sendNotification(
        transactionData.userId,
        {
          title: "Transaction Completed",
          message: `Your ${transactionType} of $${transactionData.amount} has been completed successfully.`,
          type: "transaction",
          priority: "medium",
        }
      );

      // Stop performance trace
      if (performanceTrace) {
        this.services.performance.stopTrace(`transaction_${transactionType}`, {
          success: 1,
          amount: transactionData.amount,
        });
      }

      return result;
    } catch (error) {
      // Log transaction failure
      await this.services.auditLog.logTransaction("failed", transactionId, {
        type: transactionType,
        success: false,
        error: error.message,
        amount: transactionData.amount,
      });

      // Track failed transaction
      this.services.analytics.trackEvent("transaction_failed", {
        type: transactionType,
        error: error.message,
        amount: transactionData.amount,
        success: false,
      });

      // Send error notification
      await this.services.notifications.sendNotification(
        transactionData.userId,
        {
          title: "Transaction Failed",
          message: `Your ${transactionType} could not be completed: ${error.message}`,
          type: "transaction",
          priority: "high",
        }
      );

      // Stop performance trace with error
      if (performanceTrace) {
        this.services.performance.stopTrace(`transaction_${transactionType}`, {
          success: 0,
          error_type: error.code || "unknown",
        });
      }

      throw error;
    }
  }

  /**
   * Get comprehensive service health status
   * @returns {Object} Health status of all services
   */
  getServiceHealth() {
    return {
      initialized: this.initialized,
      services: {
        firestore: {
          available: !!this.services.firestore,
          cacheEnabled: this.services.firestore?.cacheEnabled || false,
        },
        analytics: {
          available: !!this.services.analytics,
          initialized: this.services.analytics?.initialized || false,
        },
        notifications: {
          available: !!this.services.notifications,
          permission: Notification?.permission || "unknown",
        },
        performance: {
          available: !!this.services.performance,
          tracesActive: this.services.performance?.traces?.size || 0,
        },
        auditLog: {
          available: !!this.services.auditLog,
          sessionId: this.services.auditLog?.sessionId || "unknown",
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Export comprehensive service data for analysis
   * @returns {Object} Service data export
   */
  async exportServiceData() {
    const health = this.getServiceHealth();
    const performanceData = this.services.performance.exportData();
    const recentAuditLogs = await this.services.auditLog.queryAuditLogs({
      limit: 100,
    });

    return {
      health,
      performance: performanceData,
      auditLogs: recentAuditLogs,
      exportTime: new Date().toISOString(),
      version: "1.0",
    };
  }
}

// Create and export singleton instance
const firebaseIntegration = new FirebaseIntegrationService();

export default firebaseIntegration;
export { FirebaseIntegrationService };
