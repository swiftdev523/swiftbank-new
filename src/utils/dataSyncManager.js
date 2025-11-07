// Central data synchronization utility for consistent data management across all dashboards

import firestoreService from "../services/firestoreService";

class DataSyncManager {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    this.syncCallbacks = new Map();
  }

  /**
   * Subscribe to user data changes with automatic cache updates
   * @param {string} userId - User ID to subscribe to
   * @param {Function} callback - Callback function for data updates
   * @returns {string} Listener ID for cleanup
   */
  async subscribeToUserData(userId, callback) {
    const listenerId = `user_${userId}_${Date.now()}`;

    try {
      const firestoreListenerId = await firestoreService.subscribeToDocument(
        "users",
        userId,
        (userData, error) => {
          if (error) {
            console.error(
              `Error in user data subscription for ${userId}:`,
              error
            );
            callback(null, error);
            return;
          }

          if (userData) {
            // Update cache
            this.cache.set(`user_${userId}`, userData);

            // Trigger callback with updated data
            callback(userData);

            // Notify other components about the update
            this.notifySync("userDataUpdate", { userId, userData });
          }
        }
      );

      this.listeners.set(listenerId, firestoreListenerId);
      return listenerId;
    } catch (error) {
      console.error("Failed to subscribe to user data:", error);
      throw error;
    }
  }

  /**
   * Subscribe to all users data for admin dashboard
   * @param {Function} callback - Callback function for data updates
   * @returns {string} Listener ID for cleanup
   */
  async subscribeToAllUsers(callback) {
    const listenerId = `all_users_${Date.now()}`;

    try {
      const firestoreListenerId = await firestoreService.subscribeToCollection(
        "users",
        [],
        (users, error) => {
          if (error) {
            console.error("Error in all users subscription:", error);
            callback(null, error);
            return;
          }

          if (users) {
            // Update cache for all users
            users.forEach((user) => {
              this.cache.set(`user_${user.id}`, user);
            });

            // Trigger callback with updated data
            callback(users);

            // Notify other components about the update
            this.notifySync("allUsersUpdate", { users });
          }
        }
      );

      this.listeners.set(listenerId, firestoreListenerId);
      return listenerId;
    } catch (error) {
      console.error("Failed to subscribe to all users:", error);
      throw error;
    }
  }

  /**
   * Subscribe to all transactions with filtering
   * @param {Array} queryConstraints - Firestore query constraints
   * @param {Function} callback - Callback function for data updates
   * @returns {string} Listener ID for cleanup
   */
  async subscribeToTransactions(queryConstraints = [], callback) {
    const listenerId = `transactions_${Date.now()}`;

    try {
      const firestoreListenerId = await firestoreService.subscribeToCollection(
        "transactions",
        queryConstraints,
        (transactions, error) => {
          if (error) {
            console.error("Error in transactions subscription:", error);
            callback(null, error);
            return;
          }

          if (transactions) {
            // Update cache
            this.cache.set("transactions", transactions);

            // Trigger callback with updated data
            callback(transactions);

            // Notify other components about the update
            this.notifySync("transactionsUpdate", { transactions });
          }
        }
      );

      this.listeners.set(listenerId, firestoreListenerId);
      return listenerId;
    } catch (error) {
      console.error("Failed to subscribe to transactions:", error);
      throw error;
    }
  }

  /**
   * Update user account data and sync across all dashboards
   * @param {string} userId - User ID to update
   * @param {Object} accountUpdates - Account data updates
   */
  async updateUserAccounts(userId, accountUpdates) {
    try {
      await firestoreService.update("users", userId, {
        accounts: accountUpdates,
      });
      console.log(`✅ User accounts updated successfully for ${userId}`);

      // Notify all subscribed components about the update
      this.notifySync("userAccountsUpdate", {
        userId,
        accounts: accountUpdates,
      });
    } catch (error) {
      console.error("Error updating user accounts:", error);
      throw error;
    }
  }

  /**
   * Update user profile data and sync across all dashboards
   * @param {string} userId - User ID to update
   * @param {Object} profileUpdates - Profile data updates
   */
  async updateUserProfile(userId, profileUpdates) {
    try {
      await firestoreService.update("users", userId, profileUpdates);
      console.log(`✅ User profile updated successfully for ${userId}`);

      // Notify all subscribed components about the update
      this.notifySync("userProfileUpdate", { userId, profile: profileUpdates });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Add a transaction and sync across all dashboards
   * @param {Object} transactionData - Transaction data to add
   */
  async addTransaction(transactionData) {
    try {
      const result = await firestoreService.create(
        "transactions",
        transactionData
      );
      console.log("✅ Transaction added successfully:", result);

      // Notify all subscribed components about the new transaction
      this.notifySync("transactionAdded", {
        transaction: { id: result.id, ...transactionData },
      });

      return result;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  /**
   * Register a callback for sync notifications
   * @param {string} eventType - Type of sync event to listen for
   * @param {Function} callback - Callback function
   */
  onSync(eventType, callback) {
    if (!this.syncCallbacks.has(eventType)) {
      this.syncCallbacks.set(eventType, new Set());
    }
    this.syncCallbacks.get(eventType).add(callback);
  }

  /**
   * Unregister a callback for sync notifications
   * @param {string} eventType - Type of sync event
   * @param {Function} callback - Callback function to remove
   */
  offSync(eventType, callback) {
    if (this.syncCallbacks.has(eventType)) {
      this.syncCallbacks.get(eventType).delete(callback);
    }
  }

  /**
   * Notify all registered callbacks about a sync event
   * @param {string} eventType - Type of sync event
   * @param {Object} data - Data to send with the event
   */
  notifySync(eventType, data) {
    if (this.syncCallbacks.has(eventType)) {
      this.syncCallbacks.get(eventType).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in sync callback for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get cached data for a specific key
   * @param {string} key - Cache key
   * @returns {*} Cached data or null
   */
  getCached(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Clear cache for a specific key
   * @param {string} key - Cache key to clear
   */
  clearCache(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Unsubscribe from a specific listener
   * @param {string} listenerId - Listener ID to unsubscribe
   */
  unsubscribe(listenerId) {
    const firestoreListenerId = this.listeners.get(listenerId);
    if (firestoreListenerId) {
      try {
        firestoreService.unsubscribe(firestoreListenerId);
        this.listeners.delete(listenerId);
        console.log(`✅ Unsubscribed from listener: ${listenerId}`);
      } catch (error) {
        console.error(`Error unsubscribing from ${listenerId}:`, error);
      }
    }
  }

  /**
   * Unsubscribe from all listeners and clear cache
   */
  unsubscribeAll() {
    this.listeners.forEach((firestoreListenerId, listenerId) => {
      try {
        firestoreService.unsubscribe(firestoreListenerId);
      } catch (error) {
        console.error(`Error unsubscribing from ${listenerId}:`, error);
      }
    });

    this.listeners.clear();
    this.cache.clear();
    this.syncCallbacks.clear();
    console.log("✅ All listeners unsubscribed and cache cleared");
  }

  /**
   * Force refresh data for all active subscriptions
   */
  async forceRefresh() {
    console.log("🔄 Force refreshing all data subscriptions...");

    // Clear cache to force fresh data
    this.clearAllCache();

    // Notify all components to refresh their data
    this.notifySync("forceRefresh", { timestamp: Date.now() });
  }
}

// Create singleton instance
const dataSyncManager = new DataSyncManager();

export default dataSyncManager;
