// Security utilities for banking application
export class SecurityManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.loginAttempts = new Map();
    this.securityEvents = [];
  }

  // Generate secure random token
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  // Hash sensitive data
  async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  // Validate email format and security
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // Check for common attack patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
    ];

    return !maliciousPatterns.some((pattern) => pattern.test(email));
  }

  // Track login attempts
  trackLoginAttempt(identifier, success = false) {
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier) || {
      count: 0,
      lastAttempt: now,
      lockedUntil: null,
    };

    if (success) {
      this.loginAttempts.delete(identifier);
      this.logSecurityEvent("login_success", { identifier });
      return { allowed: true };
    }

    // Check if still locked out
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      this.logSecurityEvent("login_attempt_during_lockout", { identifier });
      return {
        allowed: false,
        reason: "Account temporarily locked",
        lockedUntil: attempts.lockedUntil,
      };
    }

    // Reset if lockout period has passed
    if (attempts.lockedUntil && now >= attempts.lockedUntil) {
      attempts.count = 0;
      attempts.lockedUntil = null;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    // Check if max attempts reached
    if (attempts.count >= this.maxLoginAttempts) {
      attempts.lockedUntil = now + this.lockoutDuration;
      this.logSecurityEvent("account_locked", {
        identifier,
        attempts: attempts.count,
        lockedUntil: attempts.lockedUntil,
      });

      this.loginAttempts.set(identifier, attempts);
      return {
        allowed: false,
        reason: "Too many failed attempts",
        lockedUntil: attempts.lockedUntil,
      };
    }

    this.loginAttempts.set(identifier, attempts);
    this.logSecurityEvent("login_failure", {
      identifier,
      attempts: attempts.count,
    });

    return {
      allowed: true,
      remainingAttempts: this.maxLoginAttempts - attempts.count,
    };
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonWords: !this.isCommonPassword(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? "weak" : score < 5 ? "medium" : "strong";

    return {
      isValid: score >= 4,
      strength,
      checks,
      score,
    };
  }

  // Check against common passwords
  isCommonPassword(password) {
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  // Generate Content Security Policy
  generateCSP() {
    return {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://apis.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://api.firebase.com https://*.firebase.com wss://*.firebase.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    };
  }

  // Log security events
  logSecurityEvent(event, details = {}) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: "client-side", // Would be filled by server
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 100 events
    if (this.securityEvents.length > 100) {
      this.securityEvents.shift();
    }

    // Log serious events to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Security Event:", securityEvent);
    }
  }

  // Check for suspicious activity patterns
  detectSuspiciousActivity(userId) {
    const recentEvents = this.securityEvents.filter(
      (event) =>
        event.details.identifier === userId &&
        Date.now() - new Date(event.timestamp).getTime() < 60000 // Last minute
    );

    const suspiciousPatterns = {
      rapidLoginAttempts:
        recentEvents.filter((e) => e.event === "login_failure").length > 3,
      multipleDevices: new Set(recentEvents.map((e) => e.userAgent)).size > 2,
      unusualActivity: recentEvents.length > 10,
    };

    const isSuspicious = Object.values(suspiciousPatterns).some(Boolean);

    if (isSuspicious) {
      this.logSecurityEvent("suspicious_activity_detected", {
        userId,
        patterns: suspiciousPatterns,
        recentEventCount: recentEvents.length,
      });
    }

    return {
      isSuspicious,
      patterns: suspiciousPatterns,
      riskLevel: isSuspicious ? "high" : "low",
    };
  }

  // Session management
  createSession(userId) {
    const sessionToken = this.generateSecureToken();
    const expiresAt = Date.now() + this.sessionTimeout;

    const session = {
      token: sessionToken,
      userId,
      createdAt: Date.now(),
      expiresAt,
      lastActivity: Date.now(),
    };

    this.logSecurityEvent("session_created", { userId, expiresAt });
    return session;
  }

  // Validate session
  validateSession(session) {
    if (!session || !session.token || !session.expiresAt) {
      return { valid: false, reason: "Invalid session format" };
    }

    if (Date.now() > session.expiresAt) {
      this.logSecurityEvent("session_expired", { userId: session.userId });
      return { valid: false, reason: "Session expired" };
    }

    // Check for session timeout due to inactivity
    const inactivityTimeout = 15 * 60 * 1000; // 15 minutes
    if (Date.now() - session.lastActivity > inactivityTimeout) {
      this.logSecurityEvent("session_timeout", { userId: session.userId });
      return { valid: false, reason: "Session timed out due to inactivity" };
    }

    return { valid: true };
  }

  // Update session activity
  updateSessionActivity(session) {
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  // Get security report
  getSecurityReport() {
    const now = Date.now();
    const last24Hours = this.securityEvents.filter(
      (event) => now - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    return {
      totalEvents: this.securityEvents.length,
      last24Hours: last24Hours.length,
      eventsByType: this.securityEvents.reduce((acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      }, {}),
      activeLoginAttempts: this.loginAttempts.size,
      lockedAccounts: Array.from(this.loginAttempts.entries()).filter(
        ([, data]) => data.lockedUntil && data.lockedUntil > now
      ).length,
    };
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

// React hook for security monitoring
import { useEffect } from "react";

export function useSecurityMonitor(userId) {
  useEffect(() => {
    if (userId) {
      const suspiciousActivity =
        securityManager.detectSuspiciousActivity(userId);
      if (suspiciousActivity.isSuspicious) {
        console.warn("Suspicious activity detected for user:", userId);
      }
    }
  }, [userId]);

  return {
    sanitizeInput: securityManager.sanitizeInput.bind(securityManager),
    validateEmail: securityManager.validateEmail.bind(securityManager),
    validatePassword:
      securityManager.validatePasswordStrength.bind(securityManager),
    trackLogin: securityManager.trackLoginAttempt.bind(securityManager),
  };
}

export default securityManager;
