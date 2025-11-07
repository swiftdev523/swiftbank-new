/**
 * Firebase request throttling utilities to prevent quota exhaustion
 */

class FirebaseThrottle {
  constructor() {
    this.requestCounts = new Map();
    this.rateLimitWindows = new Map();
    this.backoffDelays = new Map();
  }

  /**
   * Check if request should be throttled
   * @param {string} operation - Operation identifier
   * @param {number} maxRequests - Max requests per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if should throttle
   */
  shouldThrottle(operation, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = this.rateLimitWindows.get(operation) || now;
    const requestCount = this.requestCounts.get(operation) || 0;

    // Reset counter if window has passed
    if (now - windowStart >= windowMs) {
      this.rateLimitWindows.set(operation, now);
      this.requestCounts.set(operation, 0);
      return false;
    }

    // Check if exceeded limit
    if (requestCount >= maxRequests) {
      console.warn(
        `🚫 Firebase throttle: ${operation} exceeded ${maxRequests} requests per ${windowMs / 1000}s`
      );
      return true;
    }

    return false;
  }

  /**
   * Record a request
   * @param {string} operation - Operation identifier
   */
  recordRequest(operation) {
    const current = this.requestCounts.get(operation) || 0;
    this.requestCounts.set(operation, current + 1);
  }

  /**
   * Get exponential backoff delay for failed requests
   * @param {string} operation - Operation identifier
   * @param {Error} error - Firebase error
   * @returns {number} - Delay in milliseconds
   */
  getBackoffDelay(operation, error) {
    const isQuotaError =
      error?.code === "resource-exhausted" ||
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    if (!isQuotaError) return 0;

    const currentAttempt = this.backoffDelays.get(operation) || 0;
    const newAttempt = currentAttempt + 1;
    this.backoffDelays.set(operation, newAttempt);

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, newAttempt - 1), 30000);

    console.warn(
      `⏱️ Firebase backoff: ${operation} attempt ${newAttempt}, waiting ${delay}ms`
    );
    return delay;
  }

  /**
   * Reset backoff for successful requests
   * @param {string} operation - Operation identifier
   */
  resetBackoff(operation) {
    this.backoffDelays.delete(operation);
  }

  /**
   * Wrapper for Firebase operations with throttling and backoff
   * @param {string} operation - Operation identifier
   * @param {Function} firebaseCall - Firebase function to call
   * @param {Object} options - Throttling options
   * @returns {Promise} - Result of Firebase call
   */
  async withThrottling(operation, firebaseCall, options = {}) {
    const { maxRequests = 10, windowMs = 60000, maxRetries = 3 } = options;

    // Check if throttled
    if (this.shouldThrottle(operation, maxRequests, windowMs)) {
      throw new Error(
        `Rate limit exceeded for ${operation}. Please wait before retrying.`
      );
    }

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Record the request
        this.recordRequest(operation);

        // Execute Firebase call
        const result = await firebaseCall();

        // Reset backoff on success
        this.resetBackoff(operation);

        return result;
      } catch (error) {
        lastError = error;

        const backoffDelay = this.getBackoffDelay(operation, error);

        if (backoffDelay > 0 && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }

        // If not a quota error or max retries reached, throw immediately
        break;
      }
    }

    throw lastError;
  }

  /**
   * Get current throttle status for debugging
   * @returns {Object} - Current throttle state
   */
  getStatus() {
    return {
      requestCounts: Object.fromEntries(this.requestCounts),
      rateLimitWindows: Object.fromEntries(this.rateLimitWindows),
      backoffDelays: Object.fromEntries(this.backoffDelays),
    };
  }
}

// Global instance
export const firebaseThrottle = new FirebaseThrottle();

// Convenience functions
export const withFirebaseThrottle = (operation, firebaseCall, options) =>
  firebaseThrottle.withThrottling(operation, firebaseCall, options);

export const isFirebaseQuotaError = (error) =>
  error?.code === "resource-exhausted" ||
  error?.message?.includes("quota") ||
  error?.message?.includes("RESOURCE_EXHAUSTED");
