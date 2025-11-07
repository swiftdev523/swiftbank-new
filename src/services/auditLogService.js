/**
 * Audit Logging Service
 * Comprehensive audit logging for compliance and security monitoring
 */

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";

class AuditLogService {
  constructor() {
    this.auth = getAuth();
    this.auditCollection = collection(db, "auditLogs");
    this.sessionId = this.generateSessionId();
    this.clientInfo = this.getClientInfo();

    console.log("Audit logging service initialized");
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client information for audit context
   * @returns {Object} Client information
   */
  getClientInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: navigator.connection?.effectiveType || "unknown",
      onlineStatus: navigator.onLine,
    };
  }

  /**
   * Get current user context
   * @returns {Object} User context
   */
  getCurrentUserContext() {
    const user = this.auth.currentUser;
    if (!user) {
      return {
        userId: "anonymous",
        email: null,
        authenticated: false,
      };
    }

    return {
      userId: user.uid,
      email: user.email,
      authenticated: true,
      emailVerified: user.emailVerified,
      lastSignIn: user.metadata.lastSignInTime,
      createdAt: user.metadata.creationTime,
    };
  }

  /**
   * Create a comprehensive audit log entry
   * @param {string} action - Action performed
   * @param {string} entity - Entity affected (user, account, transaction, etc.)
   * @param {string} entityId - ID of the affected entity
   * @param {Object} details - Additional details about the action
   * @param {string} severity - Log severity (info, warning, error, critical)
   * @returns {Promise} Promise resolving to the created audit log
   */
  async createAuditLog(
    action,
    entity,
    entityId = null,
    details = {},
    severity = "info"
  ) {
    try {
      const userContext = this.getCurrentUserContext();

      const auditLog = {
        // Core audit information
        action,
        entity,
        entityId,
        severity,

        // User context
        userId: userContext.userId,
        userEmail: userContext.email,
        authenticated: userContext.authenticated,

        // Session information
        sessionId: this.sessionId,

        // Timestamp
        timestamp: serverTimestamp(),

        // Client context
        clientInfo: this.clientInfo,

        // Request context
        url: window.location.href,
        referrer: document.referrer || null,

        // Additional details
        details,

        // Compliance fields
        dataClassification: this.classifyData(entity),
        retentionPeriod: this.getRetentionPeriod(entity, severity),

        // Security context
        ipAddress: await this.getClientIP(),
        riskScore: this.calculateRiskScore(action, entity, details),

        // Metadata
        version: "1.0",
        source: "web_app",
      };

      const docRef = await addDoc(this.auditCollection, auditLog);

      console.log(`Audit log created: ${action} on ${entity}`, {
        id: docRef.id,
        severity,
        userId: userContext.userId,
      });

      return docRef;
    } catch (error) {
      console.error("Error creating audit log:", error);

      // Store failed audit logs locally for retry
      this.storeFailedAuditLog(
        action,
        entity,
        entityId,
        details,
        severity,
        error
      );
      throw error;
    }
  }

  /**
   * Get client IP address (simplified - in production use proper IP detection)
   * @returns {Promise<string>} IP address
   */
  async getClientIP() {
    try {
      // In a real application, you'd get this from your backend
      return "client_ip_not_available";
    } catch (error) {
      return "unknown";
    }
  }

  /**
   * Calculate risk score based on action and context
   * @param {string} action - Action performed
   * @param {string} entity - Entity affected
   * @param {Object} details - Action details
   * @returns {number} Risk score (0-100)
   */
  calculateRiskScore(action, entity, details) {
    let score = 0;

    // Base risk by action type
    const actionRisks = {
      login: 10,
      logout: 5,
      password_change: 30,
      account_access: 15,
      transaction_create: 25,
      transaction_modify: 40,
      user_create: 20,
      user_modify: 25,
      user_delete: 50,
      admin_access: 35,
      data_export: 45,
      system_config: 60,
    };

    score += actionRisks[action] || 10;

    // Risk by entity sensitivity
    const entityRisks = {
      users: 20,
      accounts: 30,
      transactions: 35,
      audit_logs: 25,
      system_settings: 40,
    };

    score += entityRisks[entity] || 15;

    // Additional risk factors
    if (details.amount && details.amount > 10000) score += 20;
    if (details.failed_attempts > 3) score += 25;
    if (this.clientInfo.connectionType === "slow-2g") score += 10;
    if (!this.getCurrentUserContext().authenticated) score += 15;

    return Math.min(score, 100);
  }

  /**
   * Classify data for compliance purposes
   * @param {string} entity - Entity type
   * @returns {string} Data classification
   */
  classifyData(entity) {
    const classifications = {
      users: "PII",
      accounts: "Financial",
      transactions: "Financial",
      notifications: "Personal",
      audit_logs: "System",
      settings: "Configuration",
    };

    return classifications[entity] || "General";
  }

  /**
   * Get retention period for audit logs
   * @param {string} entity - Entity type
   * @param {string} severity - Log severity
   * @returns {number} Retention period in days
   */
  getRetentionPeriod(entity, severity) {
    const basePeriods = {
      users: 2555, // 7 years
      accounts: 2555, // 7 years
      transactions: 2555, // 7 years
      audit_logs: 365, // 1 year
      default: 90, // 3 months
    };

    let period = basePeriods[entity] || basePeriods.default;

    // Extend for critical logs
    if (severity === "critical" || severity === "error") {
      period = Math.max(period, 365);
    }

    return period;
  }

  /**
   * Store failed audit logs for retry
   * @param {string} action - Action performed
   * @param {string} entity - Entity affected
   * @param {string} entityId - Entity ID
   * @param {Object} details - Action details
   * @param {string} severity - Log severity
   * @param {Error} error - Error that occurred
   */
  storeFailedAuditLog(action, entity, entityId, details, severity, error) {
    try {
      const failedLog = {
        action,
        entity,
        entityId,
        details,
        severity,
        error: error.message,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      const failedLogs = JSON.parse(
        localStorage.getItem("failed_audit_logs") || "[]"
      );
      failedLogs.push(failedLog);

      // Keep only last 100 failed logs
      if (failedLogs.length > 100) {
        failedLogs.splice(0, failedLogs.length - 100);
      }

      localStorage.setItem("failed_audit_logs", JSON.stringify(failedLogs));

      console.warn("Audit log stored locally for retry:", failedLog);
    } catch (storageError) {
      console.error("Failed to store audit log locally:", storageError);
    }
  }

  /**
   * Retry failed audit logs
   * @returns {Promise} Promise resolving when retry is complete
   */
  async retryFailedLogs() {
    try {
      const failedLogs = JSON.parse(
        localStorage.getItem("failed_audit_logs") || "[]"
      );

      if (failedLogs.length === 0) return;

      console.log(`Retrying ${failedLogs.length} failed audit logs`);

      const retryPromises = failedLogs.map(async (log) => {
        try {
          await this.createAuditLog(
            log.action,
            log.entity,
            log.entityId,
            { ...log.details, retry: true, originalError: log.error },
            log.severity
          );
          return true;
        } catch (error) {
          log.retryCount = (log.retryCount || 0) + 1;
          console.warn(`Retry ${log.retryCount} failed for audit log:`, log);
          return false;
        }
      });

      const results = await Promise.allSettled(retryPromises);
      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value
      ).length;

      // Remove successful logs and update failed logs
      const remainingFailed = failedLogs.filter(
        (_, index) =>
          results[index].status === "rejected" || !results[index].value
      );

      localStorage.setItem(
        "failed_audit_logs",
        JSON.stringify(remainingFailed)
      );

      console.log(
        `Retry complete: ${successful}/${failedLogs.length} logs successful`
      );
    } catch (error) {
      console.error("Error retrying failed audit logs:", error);
    }
  }

  // Banking-specific audit methods

  /**
   * Log user authentication events
   * @param {string} action - Auth action (login, logout, register, etc.)
   * @param {Object} details - Additional details
   */
  async logAuthentication(action, details = {}) {
    return this.createAuditLog(
      `auth_${action}`,
      "users",
      this.getCurrentUserContext().userId,
      {
        ...details,
        authProvider: "firebase",
        sessionId: this.sessionId,
      },
      details.success === false ? "warning" : "info"
    );
  }

  /**
   * Log transaction events
   * @param {string} action - Transaction action
   * @param {string} transactionId - Transaction ID
   * @param {Object} details - Transaction details
   */
  async logTransaction(action, transactionId, details = {}) {
    return this.createAuditLog(
      `transaction_${action}`,
      "transactions",
      transactionId,
      details,
      details.amount > 10000 ? "warning" : "info"
    );
  }

  /**
   * Log account access events
   * @param {string} action - Account action
   * @param {string} accountId - Account ID
   * @param {Object} details - Additional details
   */
  async logAccountAccess(action, accountId, details = {}) {
    return this.createAuditLog(
      `account_${action}`,
      "accounts",
      accountId,
      details,
      "info"
    );
  }

  /**
   * Log administrative actions
   * @param {string} action - Admin action
   * @param {string} targetEntity - Target entity type
   * @param {string} targetId - Target entity ID
   * @param {Object} details - Action details
   */
  async logAdminAction(action, targetEntity, targetId, details = {}) {
    return this.createAuditLog(
      `admin_${action}`,
      targetEntity,
      targetId,
      details,
      "warning"
    );
  }

  /**
   * Log security events
   * @param {string} action - Security action
   * @param {Object} details - Security event details
   */
  async logSecurityEvent(action, details = {}) {
    return this.createAuditLog(
      `security_${action}`,
      "system",
      null,
      details,
      details.severity || "critical"
    );
  }

  /**
   * Log data access events
   * @param {string} action - Data action (read, write, delete)
   * @param {string} entity - Entity type
   * @param {string} entityId - Entity ID
   * @param {Object} details - Access details
   */
  async logDataAccess(action, entity, entityId, details = {}) {
    return this.createAuditLog(
      `data_${action}`,
      entity,
      entityId,
      details,
      action === "delete" ? "warning" : "info"
    );
  }

  /**
   * Query audit logs
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Audit log entries
   */
  async queryAuditLogs(filters = {}) {
    try {
      let auditQuery = this.auditCollection;

      // Apply filters
      if (filters.userId) {
        auditQuery = query(auditQuery, where("userId", "==", filters.userId));
      }

      if (filters.entity) {
        auditQuery = query(auditQuery, where("entity", "==", filters.entity));
      }

      if (filters.action) {
        auditQuery = query(auditQuery, where("action", "==", filters.action));
      }

      if (filters.severity) {
        auditQuery = query(
          auditQuery,
          where("severity", "==", filters.severity)
        );
      }

      // Order by timestamp (most recent first)
      auditQuery = query(auditQuery, orderBy("timestamp", "desc"));

      // Limit results
      if (filters.limit) {
        auditQuery = query(auditQuery, limit(filters.limit));
      }

      const snapshot = await getDocs(auditQuery);
      const logs = [];

      snapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return logs;
    } catch (error) {
      console.error("Error querying audit logs:", error);
      throw error;
    }
  }

  /**
   * Initialize audit logging for the application
   */
  initialize() {
    // Retry failed logs on initialization
    this.retryFailedLogs();

    // Set up periodic retry of failed logs
    setInterval(
      () => {
        this.retryFailedLogs();
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    // Log session start
    this.logAuthentication("session_start", {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });

    // Log session end on page unload
    window.addEventListener("beforeunload", () => {
      this.logAuthentication("session_end", {
        sessionId: this.sessionId,
        duration: Date.now() - parseInt(this.sessionId.split("_")[1]),
      });
    });

    console.log("Audit logging initialized with session:", this.sessionId);
  }
}

// Create and export singleton instance
const auditLogService = new AuditLogService();

export default auditLogService;
export { AuditLogService };
