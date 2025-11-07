// Network utilities for banking application
export class NetworkManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connectionType = this.getConnectionType();
    this.observers = [];
    this.requestQueue = [];
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
    };

    this.initializeEventListeners();
  }

  // Initialize network event listeners
  initializeEventListeners() {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Listen for connection changes
    if ("connection" in navigator) {
      navigator.connection.addEventListener(
        "change",
        this.handleConnectionChange.bind(this)
      );
    }
  }

  // Handle online event
  handleOnline() {
    this.isOnline = true;
    this.connectionType = this.getConnectionType();
    this.notifyObservers("online", {
      isOnline: true,
      connectionType: this.connectionType,
    });
    this.processQueuedRequests();
  }

  // Handle offline event
  handleOffline() {
    this.isOnline = false;
    this.connectionType = null;
    this.notifyObservers("offline", {
      isOnline: false,
      connectionType: null,
    });
  }

  // Handle connection change
  handleConnectionChange() {
    const newConnectionType = this.getConnectionType();
    if (newConnectionType !== this.connectionType) {
      this.connectionType = newConnectionType;
      this.notifyObservers("connection-change", {
        isOnline: this.isOnline,
        connectionType: this.connectionType,
      });
    }
  }

  // Get connection type information
  getConnectionType() {
    if (!navigator.connection) return "unknown";

    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData,
    };
  }

  // Check if connection is fast enough for operation
  isConnectionFast() {
    if (!this.connectionType || !this.connectionType.effectiveType) return true;

    const fastConnections = ["4g"];
    return fastConnections.includes(this.connectionType.effectiveType);
  }

  // Enhanced fetch with retry logic and offline handling
  async enhancedFetch(url, options = {}) {
    const requestId = Date.now() + Math.random();

    // If offline, queue the request
    if (!this.isOnline) {
      return this.queueRequest(requestId, url, options);
    }

    return this.executeWithRetry(requestId, url, options);
  }

  // Execute request with retry logic
  async executeWithRetry(requestId, url, options) {
    let lastError;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If response is not ok, throw error for retry logic
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // If not the last attempt, wait before retrying
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          await this.delay(delay);

          // Check if we're still online before retrying
          if (!this.isOnline) {
            return this.queueRequest(requestId, url, options);
          }
        }
      }
    }

    throw lastError;
  }

  // Check if error should not be retried
  shouldNotRetry(error) {
    // Don't retry on 4xx errors (client errors)
    if (error.message.includes("HTTP 4")) return true;

    // Don't retry on abort errors
    if (error.name === "AbortError") return true;

    // Don't retry on syntax errors
    if (error instanceof SyntaxError) return true;

    return false;
  }

  // Calculate retry delay with exponential backoff
  calculateRetryDelay(attempt) {
    const delay = Math.min(
      this.retryConfig.baseDelay *
        Math.pow(this.retryConfig.backoffFactor, attempt),
      this.retryConfig.maxDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }

  // Delay utility
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Queue request for when connection is restored
  queueRequest(requestId, url, options) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        id: requestId,
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Clean old queued requests (older than 5 minutes)
      this.cleanRequestQueue();
    });
  }

  // Process queued requests when back online
  async processQueuedRequests() {
    if (this.requestQueue.length === 0) return;

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requests) {
      try {
        const response = await this.executeWithRetry(
          request.id,
          request.url,
          request.options
        );
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  // Clean old queued requests
  cleanRequestQueue() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.requestQueue = this.requestQueue.filter((request) => {
      if (request.timestamp < fiveMinutesAgo) {
        request.reject(new Error("Request timeout in queue"));
        return false;
      }
      return true;
    });
  }

  // Add observer for network events
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Remove observer
  removeObserver(callback) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  // Notify observers of network events
  notifyObservers(event, data) {
    this.observers.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        console.error("Network observer error:", error);
      }
    });
  }

  // Get current network status
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      queuedRequests: this.requestQueue.length,
      isFastConnection: this.isConnectionFast(),
    };
  }

  // Test network connectivity
  async testConnectivity() {
    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Monitor network quality
  async monitorNetworkQuality() {
    const startTime = performance.now();

    try {
      await this.testConnectivity();
      const endTime = performance.now();
      const latency = endTime - startTime;

      return {
        latency,
        quality:
          latency < 100
            ? "excellent"
            : latency < 300
              ? "good"
              : latency < 1000
                ? "poor"
                : "very-poor",
      };
    } catch {
      return {
        latency: Infinity,
        quality: "offline",
      };
    }
  }
}

// Global network manager instance
export const networkManager = new NetworkManager();

// React hook for network monitoring
import { useState, useEffect } from "react";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState(
    networkManager.getNetworkStatus()
  );

  useEffect(() => {
    const handleNetworkChange = (event, data) => {
      setNetworkStatus(networkManager.getNetworkStatus());
    };

    networkManager.addObserver(handleNetworkChange);

    return () => {
      networkManager.removeObserver(handleNetworkChange);
    };
  }, []);

  return networkStatus;
}

// Enhanced fetch hook with automatic retry and offline handling
export function useEnhancedFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enhancedFetch = async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await networkManager.enhancedFetch(url, options);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { enhancedFetch, loading, error };
}

// Network-aware component wrapper
export function withNetworkAwareness(Component) {
  return function NetworkAwareComponent(props) {
    const networkStatus = useNetworkStatus();

    return <Component {...props} networkStatus={networkStatus} />;
  };
}

export default networkManager;
