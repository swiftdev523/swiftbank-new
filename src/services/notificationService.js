/**
 * Enhanced Notification Service
 * Provides real-time notifications, push notifications, and in-app messaging
 */

import {
  getMessaging,
  getToken,
  onMessage,
  connectMessagingEmulator,
} from "firebase/messaging";
import { app } from "../config/firebase";
import enhancedFirestoreService from "./enhancedFirestoreService";
import {
  createNotificationSchema,
  NotificationTypes,
  NotificationPriority,
} from "../models/dataModels";

class NotificationService {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.notifications = [];
    this.listeners = new Set();
    this.unreadCount = 0;

    this.initializeMessaging();
    this.setupNotificationListeners();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initializeMessaging() {
    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        this.messaging = getMessaging(app);

        // Setup foreground message handling
        onMessage(this.messaging, (payload) => {
          this.handleForegroundMessage(payload);
        });

        console.log("Firebase Messaging initialized");
      }
    } catch (error) {
      console.warn("Messaging initialization failed:", error);
    }
  }

  async requestPermission() {
    try {
      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications");
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await this.getRegistrationToken();
        if (token) {
          await this.saveTokenToDatabase(token);
        }
        return token;
      } else {
        throw new Error("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      throw error;
    }
  }

  async getRegistrationToken() {
    try {
      if (!this.messaging) return null;

      const token = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      this.token = token;
      return token;
    } catch (error) {
      console.error("Error getting registration token:", error);
      return null;
    }
  }

  async saveTokenToDatabase(token) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return;

      await enhancedFirestoreService.update("users", userId, {
        notificationToken: token,
        notificationEnabled: true,
        tokenUpdatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving token to database:", error);
    }
  }

  // ============================================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================================

  async createNotification(notificationData) {
    try {
      const notification = createNotificationSchema(notificationData);

      // Save to database
      const result = await enhancedFirestoreService.create(
        "notifications",
        notification
      );

      // If it's for the current user, add to local notifications
      const currentUserId = this.getCurrentUserId();
      if (
        notification.userId === currentUserId ||
        notification.audience === "all"
      ) {
        this.addToLocalNotifications(result);
      }

      return result;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      await enhancedFirestoreService.update("notifications", notificationId, {
        read: true,
        readAt: new Date(),
      });

      // Update local notifications
      this.notifications = this.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true, readAt: new Date() }
          : notification
      );

      this.updateUnreadCount();
      this.notifyListeners();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async markAllAsRead() {
    try {
      const unreadNotifications = this.notifications.filter((n) => !n.read);

      // Batch update all unread notifications
      const operations = unreadNotifications.map((notification) => ({
        type: "update",
        collection: "notifications",
        id: notification.id,
        data: { read: true, readAt: new Date() },
      }));

      if (operations.length > 0) {
        await enhancedFirestoreService.batchWrite(operations);

        // Update local notifications
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        }));

        this.updateUnreadCount();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  async deleteNotification(notificationId) {
    try {
      await enhancedFirestoreService.delete("notifications", notificationId);

      this.notifications = this.notifications.filter(
        (n) => n.id !== notificationId
      );
      this.updateUnreadCount();
      this.notifyListeners();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  async clearAllNotifications() {
    try {
      const operations = this.notifications.map((notification) => ({
        type: "delete",
        collection: "notifications",
        id: notification.id,
      }));

      if (operations.length > 0) {
        await enhancedFirestoreService.batchWrite(operations);
        this.notifications = [];
        this.updateUnreadCount();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  setupNotificationListeners() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    // Subscribe to user-specific notifications
    enhancedFirestoreService.subscribeToCollection(
      "notifications",
      [
        // Get notifications for this user or for all users
        // Note: In a real implementation, you might need separate queries
      ],
      (notifications, changes, error) => {
        if (error) {
          console.error("Notification subscription error:", error);
          return;
        }

        this.handleNotificationChanges(notifications, changes);
      }
    );
  }

  handleNotificationChanges(notifications, changes) {
    const userId = this.getCurrentUserId();

    // Filter notifications for current user
    const userNotifications = notifications.filter(
      (notification) =>
        notification.userId === userId ||
        notification.audience === "all" ||
        (notification.audience === "role" &&
          this.userHasRole(notification.targetRole))
    );

    this.notifications = userNotifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    this.updateUnreadCount();
    this.notifyListeners();

    // Handle new notifications
    if (changes) {
      changes.forEach((change) => {
        if (change.type === "added" && !change.doc.read) {
          this.showInAppNotification(change.doc);
        }
      });
    }
  }

  // ============================================================================
  // IN-APP NOTIFICATIONS
  // ============================================================================

  showInAppNotification(notification) {
    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      this.showBrowserNotification(notification);
    }

    // Show in-app notification
    this.showToast(notification);
  }

  showBrowserNotification(notification) {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/firebase-logo.png",
        badge: "/firebase-logo.png",
        tag: notification.id,
        requireInteraction:
          notification.priority === NotificationPriority.URGENT,
        data: {
          notificationId: notification.id,
          actionUrl: notification.actionUrl,
        },
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds unless urgent
      if (notification.priority !== NotificationPriority.URGENT) {
        setTimeout(() => browserNotification.close(), 5000);
      }
    } catch (error) {
      console.error("Error showing browser notification:", error);
    }
  }

  showToast(notification) {
    // Create custom toast notification
    const toast = document.createElement("div");
    toast.className = `notification-toast notification-${notification.priority} notification-${notification.type}`;
    toast.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.actionText ? `<button class="notification-action">${notification.actionText}</button>` : ""}
      </div>
      <button class="notification-close">&times;</button>
    `;

    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 16px;
      max-width: 350px;
      z-index: 10000;
      border-left: 4px solid ${this.getPriorityColor(notification.priority)};
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    // Event listeners
    const closeBtn = toast.querySelector(".notification-close");
    const actionBtn = toast.querySelector(".notification-action");

    closeBtn?.addEventListener("click", () => {
      this.removeToast(toast);
    });

    actionBtn?.addEventListener("click", () => {
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      this.removeToast(toast);
    });

    // Auto-remove after timeout
    const timeout =
      notification.priority === NotificationPriority.URGENT ? 10000 : 5000;
    setTimeout(() => {
      this.removeToast(toast);
    }, timeout);
  }

  removeToast(toast) {
    toast.style.transform = "translateX(400px)";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getPriorityColor(priority) {
    switch (priority) {
      case NotificationPriority.URGENT:
        return "#ef4444";
      case NotificationPriority.HIGH:
        return "#f97316";
      case NotificationPriority.MEDIUM:
        return "#3b82f6";
      case NotificationPriority.LOW:
        return "#10b981";
      default:
        return "#6b7280";
    }
  }

  // ============================================================================
  // BACKGROUND MESSAGE HANDLING
  // ============================================================================

  handleForegroundMessage(payload) {
    console.log("Received foreground message:", payload);

    const notification = {
      id: Date.now().toString(),
      title: payload.notification?.title || "New Notification",
      message: payload.notification?.body || "",
      type: payload.data?.type || NotificationTypes.SYSTEM,
      priority: payload.data?.priority || NotificationPriority.MEDIUM,
      actionUrl: payload.data?.actionUrl || "",
      actionText: payload.data?.actionText || "",
      createdAt: new Date(),
      read: false,
    };

    this.addToLocalNotifications(notification);
    this.showInAppNotification(notification);
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  subscribe(listener) {
    this.listeners.add(listener);

    // Immediately call with current state
    listener({
      notifications: this.notifications,
      unreadCount: this.unreadCount,
    });

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners() {
    const data = {
      notifications: this.notifications,
      unreadCount: this.unreadCount,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error("Error in notification listener:", error);
      }
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  addToLocalNotifications(notification) {
    this.notifications.unshift(notification);

    // Limit to last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.updateUnreadCount();
    this.notifyListeners();
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter((n) => !n.read).length;
  }

  getCurrentUserId() {
    // Get from auth context or local storage
    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      return user?.uid || null;
    } catch {
      return null;
    }
  }

  userHasRole(targetRole) {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      return user?.role === targetRole;
    } catch {
      return false;
    }
  }

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  // ============================================================================
  // NOTIFICATION TEMPLATES
  // ============================================================================

  async notifyTransactionCompleted(userId, transactionId, amount, type) {
    return await this.createNotification({
      userId,
      title: "Transaction Completed",
      message: `Your ${type} of $${amount.toFixed(2)} has been completed.`,
      type: NotificationTypes.TRANSACTION,
      priority: NotificationPriority.MEDIUM,
      actionUrl: `/transactions/${transactionId}`,
      actionText: "View Details",
      relatedEntity: "transaction",
      relatedId: transactionId,
    });
  }

  async notifyLowBalance(userId, accountId, balance) {
    return await this.createNotification({
      userId,
      title: "Low Balance Alert",
      message: `Your account balance is low: $${balance.toFixed(2)}`,
      type: NotificationTypes.ACCOUNT,
      priority: NotificationPriority.HIGH,
      actionUrl: `/accounts/${accountId}`,
      actionText: "Add Funds",
      relatedEntity: "account",
      relatedId: accountId,
    });
  }

  async notifySecurityAlert(userId, message, details = {}) {
    return await this.createNotification({
      userId,
      title: "Security Alert",
      message,
      type: NotificationTypes.SECURITY,
      priority: NotificationPriority.URGENT,
      actionUrl: "/security",
      actionText: "Review",
      ...details,
    });
  }

  async notifySystemMaintenance(message, targetRole = null) {
    return await this.createNotification({
      title: "System Maintenance",
      message,
      type: NotificationTypes.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      audience: targetRole ? "role" : "all",
      targetRole,
    });
  }

  // Cleanup
  cleanup() {
    this.listeners.clear();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// React Hook
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = notificationService.subscribe((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead: notificationService.markAsRead.bind(notificationService),
    markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
    deleteNotification:
      notificationService.deleteNotification.bind(notificationService),
    requestPermission:
      notificationService.requestPermission.bind(notificationService),
  };
};

export default notificationService;
