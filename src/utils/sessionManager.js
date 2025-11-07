// Session management utility for banking application
export class SessionManager {
  constructor() {
    this.sessionKey = "bankingApp_session";
    this.userKey = "bankingApp_user";
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
    this.activityTimer = null;
    this.warningTimer = null;
    this.callbacks = {
      onWarning: [],
      onTimeout: [],
      onActivity: [],
    };

    this.initializeActivityTracking();
  }

  // Initialize activity tracking
  initializeActivityTracking() {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  // Handle user activity
  handleActivity() {
    this.resetTimers();
    this.updateLastActivity();
    this.notifyCallbacks("onActivity");
  }

  // Reset session timers
  resetTimers() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    // Set warning timer
    this.warningTimer = setTimeout(() => {
      this.notifyCallbacks("onWarning");
    }, this.sessionTimeout - this.warningTime);

    // Set timeout timer
    this.activityTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.sessionTimeout);
  }

  // Handle session timeout
  handleSessionTimeout() {
    this.clearSession();
    this.notifyCallbacks("onTimeout");
  }

  // Create new session
  createSession(user, token) {
    const session = {
      user,
      token,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout,
    };

    this.setSession(session);
    this.setUser(user);
    this.resetTimers();

    return session;
  }

  // Get current session
  getSession() {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error reading session:", error);
      this.clearSession();
      return null;
    }
  }

  // Set session data
  setSession(session) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  // Update session activity
  updateLastActivity() {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      session.expiresAt = Date.now() + this.sessionTimeout;
      this.setSession(session);
    }
  }

  // Get current user
  getUser() {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error reading user data:", error);
      return null;
    }
  }

  // Set user data
  setUser(user) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  // Clear session and user data
  clearSession() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.userKey);

    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const session = this.getSession();
    const user = this.getUser();
    return !!(session && user);
  }

  // Get time remaining in session
  getTimeRemaining() {
    const session = this.getSession();
    if (!session) return 0;

    return Math.max(0, session.expiresAt - Date.now());
  }

  // Extend session
  extendSession() {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + this.sessionTimeout;
      this.setSession(session);
      this.resetTimers();
      return true;
    }
    return false;
  }

  // Add callback for session events
  addCallback(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  // Remove callback
  removeCallback(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  // Notify callbacks
  notifyCallbacks(event) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error(`Session callback error for ${event}:`, error);
        }
      });
    }
  }

  // Get session info
  getSessionInfo() {
    const session = this.getSession();
    const user = this.getUser();

    if (!session || !user) {
      return {
        isAuthenticated: false,
        timeRemaining: 0,
        user: null,
      };
    }

    return {
      isAuthenticated: true,
      timeRemaining: this.getTimeRemaining(),
      user,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    };
  }

  // Format time remaining
  formatTimeRemaining() {
    const remaining = this.getTimeRemaining();
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// Global session manager instance
export const sessionManager = new SessionManager();

// React hook for session management
import { useState, useEffect } from "react";

export function useSession() {
  const [sessionInfo, setSessionInfo] = useState(
    sessionManager.getSessionInfo()
  );

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo(sessionManager.getSessionInfo());
    };

    // Add callbacks for session events
    sessionManager.addCallback("onActivity", updateSessionInfo);
    sessionManager.addCallback("onWarning", updateSessionInfo);
    sessionManager.addCallback("onTimeout", updateSessionInfo);

    // Update session info every minute
    const interval = setInterval(updateSessionInfo, 60000);

    return () => {
      clearInterval(interval);
      sessionManager.removeCallback("onActivity", updateSessionInfo);
      sessionManager.removeCallback("onWarning", updateSessionInfo);
      sessionManager.removeCallback("onTimeout", updateSessionInfo);
    };
  }, []);

  const login = (user, token) => {
    sessionManager.createSession(user, token);
    setSessionInfo(sessionManager.getSessionInfo());
  };

  const logout = () => {
    sessionManager.clearSession();
    setSessionInfo(sessionManager.getSessionInfo());
  };

  const extendSession = () => {
    sessionManager.extendSession();
    setSessionInfo(sessionManager.getSessionInfo());
  };

  return {
    ...sessionInfo,
    login,
    logout,
    extendSession,
    formatTimeRemaining:
      sessionManager.formatTimeRemaining.bind(sessionManager),
  };
}

// Session timeout warning component hook
export function useSessionWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleWarning = () => setShowWarning(true);
    const handleTimeout = () => setShowWarning(false);
    const handleActivity = () => setShowWarning(false);

    sessionManager.addCallback("onWarning", handleWarning);
    sessionManager.addCallback("onTimeout", handleTimeout);
    sessionManager.addCallback("onActivity", handleActivity);

    return () => {
      sessionManager.removeCallback("onWarning", handleWarning);
      sessionManager.removeCallback("onTimeout", handleTimeout);
      sessionManager.removeCallback("onActivity", handleActivity);
    };
  }, []);

  return {
    showWarning,
    dismissWarning: () => setShowWarning(false),
    extendSession: () => {
      sessionManager.extendSession();
      setShowWarning(false);
    },
  };
}

export default sessionManager;
