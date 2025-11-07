/**
 * Firebase Circuit Breaker - Prevents quota exhaustion by stopping requests when failures occur
 */

import { dispatchFirebaseError } from "../components/FirebaseErrorDisplay";

class FirebaseCircuitBreaker {
  constructor() {
    this.isCircuitOpen = false;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.threshold = 3; // Open circuit after 3 failures
    this.timeout = 300000; // 5 minutes timeout
    this.halfOpenMaxRetries = 1; // Allow 1 test request when half-open
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  /**
   * Execute a Firebase operation with circuit breaker protection
   * @param {Function} operation - Firebase operation to execute
   * @param {string} operationName - Name for logging
   * @returns {Promise} - Result of operation or throws error
   */
  async execute(operation, operationName = "firebase-operation") {
    // Check if circuit should be reset to half-open
    if (this.state === "OPEN" && this.shouldAttemptReset()) {
      this.state = "HALF_OPEN";
      console.log(
        `🔄 Firebase circuit breaker is now HALF_OPEN - testing ${operationName}`
      );
    }

    // Reject immediately if circuit is open
    if (this.state === "OPEN") {
      const remainingTime = Math.ceil(
        (this.timeout - (Date.now() - this.lastFailureTime)) / 1000
      );
      const error = new Error(
        `🚫 Firebase circuit breaker is OPEN. Please wait ${remainingTime} seconds before retrying.`
      );
      error.code = "CIRCUIT_BREAKER_OPEN";

      // Dispatch error for user display
      dispatchFirebaseError(error);
      throw error;
    }

    try {
      console.log(`🔥 Executing ${operationName} (Circuit: ${this.state})`);
      const result = await operation();
      this.onSuccess(operationName);
      return result;
    } catch (error) {
      this.onFailure(error, operationName);
      throw error;
    }
  }

  /**
   * Handle successful operations
   */
  onSuccess(operationName) {
    if (this.state === "HALF_OPEN") {
      this.reset();
      console.log(
        `✅ Firebase circuit breaker RESET after successful ${operationName}`
      );
    }

    // Reset failure count on any success
    this.failureCount = Math.max(0, this.failureCount - 1);
  }

  /**
   * Handle failed operations
   */
  onFailure(error, operationName) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    const isQuotaError = this.isQuotaExhausted(error);
    const isResourceError = this.isResourceExhausted(error);

    console.error(`❌ Firebase operation failed: ${operationName}`, {
      error: error.message,
      code: error.code,
      failureCount: this.failureCount,
      isQuotaError,
      isResourceError,
    });

    // Open circuit immediately for quota/resource errors, or after threshold failures
    if (
      isQuotaError ||
      isResourceError ||
      this.failureCount >= this.threshold
    ) {
      this.openCircuit(operationName, error);
    }

    // Dispatch error for user display
    dispatchFirebaseError(error);
  }

  /**
   * Open the circuit breaker
   */
  openCircuit(operationName, error) {
    this.state = "OPEN";
    const reason = this.isQuotaExhausted(error)
      ? "quota exhausted"
      : this.isResourceExhausted(error)
        ? "resource exhausted"
        : "failure threshold reached";

    console.warn(
      `🚨 Firebase circuit breaker OPENED for ${operationName} (${reason})`
    );
    console.warn(
      `⏱️ Circuit will attempt reset in ${this.timeout / 1000} seconds`
    );

    // Store circuit state in localStorage for persistence across page reloads
    localStorage.setItem(
      "firebase_circuit_state",
      JSON.stringify({
        state: this.state,
        lastFailureTime: this.lastFailureTime,
        failureCount: this.failureCount,
        reason,
      })
    );
  }

  /**
   * Reset the circuit breaker to normal operation
   */
  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = null;

    // Clear stored state
    localStorage.removeItem("firebase_circuit_state");
    console.log("✅ Firebase circuit breaker fully RESET");
  }

  /**
   * Check if circuit should attempt reset (half-open state)
   */
  shouldAttemptReset() {
    return (
      this.state === "OPEN" &&
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime > this.timeout
    );
  }

  /**
   * Check if error indicates quota exhaustion
   */
  isQuotaExhausted(error) {
    return (
      error?.code === "resource-exhausted" ||
      error?.message?.toLowerCase().includes("quota") ||
      error?.message?.toLowerCase().includes("exceeded") ||
      error?.status === 429
    );
  }

  /**
   * Check if error indicates resource exhaustion
   */
  isResourceExhausted(error) {
    return (
      error?.code === "resource-exhausted" ||
      error?.message?.toLowerCase().includes("resource") ||
      error?.message?.toLowerCase().includes("backoff") ||
      error?.message?.toLowerCase().includes("overload")
    );
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      isOpen: this.state === "OPEN",
      timeUntilReset:
        this.state === "OPEN" && this.lastFailureTime
          ? Math.max(0, this.timeout - (Date.now() - this.lastFailureTime))
          : 0,
    };
  }

  /**
   * Restore circuit state from localStorage (for page reloads)
   */
  restoreState() {
    try {
      const storedState = localStorage.getItem("firebase_circuit_state");
      if (storedState) {
        const state = JSON.parse(storedState);

        // Check if stored failure is still within timeout period
        if (
          state.lastFailureTime &&
          Date.now() - state.lastFailureTime < this.timeout
        ) {
          this.state = state.state;
          this.failureCount = state.failureCount;
          this.lastFailureTime = state.lastFailureTime;

          console.warn(
            `🔄 Restored Firebase circuit breaker state: ${this.state}`
          );
          console.warn(
            `⏱️ Time until reset: ${Math.ceil((this.timeout - (Date.now() - this.lastFailureTime)) / 1000)}s`
          );
        } else {
          // Stored state is expired, reset
          this.reset();
        }
      }
    } catch (error) {
      console.error("Failed to restore circuit breaker state:", error);
      this.reset();
    }
  }

  /**
   * Force reset the circuit breaker (admin function)
   */
  forceReset() {
    console.log("🔧 Force resetting Firebase circuit breaker...");
    this.reset();

    // Also clear any emergency mode
    localStorage.removeItem("emergency_mode");

    return "Circuit breaker force reset complete";
  }
}

// Global instance
export const firebaseCircuitBreaker = new FirebaseCircuitBreaker();

// Restore state on module load
firebaseCircuitBreaker.restoreState();

// Convenience wrapper function
export const withCircuitBreaker = async (operation, operationName) => {
  return await firebaseCircuitBreaker.execute(operation, operationName);
};

// Admin functions for debugging
if (typeof window !== "undefined") {
  window.firebaseCircuitBreaker = firebaseCircuitBreaker;
  window.resetFirebaseCircuit = () => firebaseCircuitBreaker.forceReset();
}
