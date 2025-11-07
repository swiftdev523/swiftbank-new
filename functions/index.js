/**
 * Cloud Functions for CL Bank
 * Enhanced server-side operations for banking functionality
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: "us-central1",
});

const db = admin.firestore();
const messaging = getMessaging();

// ============================================================================
// TRANSACTION PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process transaction and update account balances
 * Triggered when a new transaction is created
 */
exports.processTransaction = onDocumentCreated(
  {
    document: "transactions/{transactionId}",
    region: "us-central1",
  },
  async (event) => {
    const transaction = event.data.data();
    const transactionId = event.params.transactionId;

    try {
      console.log(`Processing transaction: ${transactionId}`);

      // Validate transaction
      if (!transaction.amount || transaction.amount <= 0) {
        throw new Error("Invalid transaction amount");
      }

      // Use Firestore transaction for atomicity
      await db.runTransaction(async (firestoreTransaction) => {
        const transactionRef = db.collection("transactions").doc(transactionId);

        // Update transaction status to processing
        firestoreTransaction.update(transactionRef, {
          status: "processing",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Process based on transaction type
        switch (transaction.type) {
          case "transfer":
            await processTransfer(firestoreTransaction, transaction);
            break;
          case "deposit":
            await processDeposit(firestoreTransaction, transaction);
            break;
          case "withdrawal":
            await processWithdrawal(firestoreTransaction, transaction);
            break;
          default:
            throw new Error(`Unknown transaction type: ${transaction.type}`);
        }

        // Update transaction status to completed
        firestoreTransaction.update(transactionRef, {
          status: "completed",
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create audit log
        const auditLogRef = db.collection("auditLogs").doc();
        firestoreTransaction.set(auditLogRef, {
          action: "transaction_processed",
          entity: "transactions",
          entityId: transactionId,
          userId: transaction.userId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: {
            type: transaction.type,
            amount: transaction.amount,
            success: true,
          },
        });
      });

      // Send notification to user
      await sendTransactionNotification(
        transaction.userId,
        transaction,
        "completed"
      );

      console.log(`Transaction processed successfully: ${transactionId}`);
    } catch (error) {
      console.error(`Error processing transaction ${transactionId}:`, error);

      // Update transaction status to failed
      await db.collection("transactions").doc(transactionId).update({
        status: "failed",
        errorMessage: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send error notification
      await sendTransactionNotification(
        transaction.userId,
        transaction,
        "failed",
        error.message
      );
    }
  }
);

async function processTransfer(firestoreTransaction, transaction) {
  const { fromAccount, toAccount, amount } = transaction;

  // Get source account
  const fromAccountRef = db.collection("accounts").doc(fromAccount);
  const fromAccountDoc = await firestoreTransaction.get(fromAccountRef);

  if (!fromAccountDoc.exists) {
    throw new Error("Source account not found");
  }

  const fromAccountData = fromAccountDoc.data();

  // Check available balance
  if (fromAccountData.availableBalance < amount) {
    throw new Error("Insufficient funds");
  }

  // Get destination account
  const toAccountRef = db.collection("accounts").doc(toAccount);
  const toAccountDoc = await firestoreTransaction.get(toAccountRef);

  if (!toAccountDoc.exists) {
    throw new Error("Destination account not found");
  }

  // Update balances
  firestoreTransaction.update(fromAccountRef, {
    balance: admin.firestore.FieldValue.increment(-amount),
    availableBalance: admin.firestore.FieldValue.increment(-amount),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  firestoreTransaction.update(toAccountRef, {
    balance: admin.firestore.FieldValue.increment(amount),
    availableBalance: admin.firestore.FieldValue.increment(amount),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function processDeposit(firestoreTransaction, transaction) {
  const { toAccount, amount } = transaction;

  const accountRef = db.collection("accounts").doc(toAccount);
  const accountDoc = await firestoreTransaction.get(accountRef);

  if (!accountDoc.exists) {
    throw new Error("Account not found");
  }

  firestoreTransaction.update(accountRef, {
    balance: admin.firestore.FieldValue.increment(amount),
    availableBalance: admin.firestore.FieldValue.increment(amount),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function processWithdrawal(firestoreTransaction, transaction) {
  const { fromAccount, amount } = transaction;

  const accountRef = db.collection("accounts").doc(fromAccount);
  const accountDoc = await firestoreTransaction.get(accountRef);

  if (!accountDoc.exists) {
    throw new Error("Account not found");
  }

  const accountData = accountDoc.data();

  if (accountData.availableBalance < amount) {
    throw new Error("Insufficient funds");
  }

  firestoreTransaction.update(accountRef, {
    balance: admin.firestore.FieldValue.increment(-amount),
    availableBalance: admin.firestore.FieldValue.increment(-amount),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send transaction notification to user
 */
async function sendTransactionNotification(
  userId,
  transaction,
  status,
  errorMessage = null
) {
  try {
    // Get user's notification token
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return;

    const user = userDoc.data();
    const { notificationToken, notificationEnabled } = user;

    if (!notificationEnabled || !notificationToken) return;

    // Create notification message
    let title, body;
    if (status === "completed") {
      title = "Transaction Completed";
      body = `Your ${transaction.type} of $${transaction.amount.toFixed(2)} has been completed.`;
    } else if (status === "failed") {
      title = "Transaction Failed";
      body = `Your ${transaction.type} of $${transaction.amount.toFixed(2)} failed: ${errorMessage}`;
    }

    // Send push notification
    const message = {
      notification: { title, body },
      data: {
        type: "transaction",
        transactionId: transaction.id || "",
        status: status,
      },
      token: notificationToken,
    };

    await messaging.send(message);

    // Also save to notifications collection
    await db.collection("notifications").add({
      userId,
      title,
      message: body,
      type: "transaction",
      priority: status === "failed" ? "high" : "medium",
      read: false,
      sent: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      relatedEntity: "transaction",
      relatedId: transaction.id || "",
    });

    console.log(
      `Notification sent to user ${userId} for transaction status: ${status}`
    );
  } catch (error) {
    console.error("Error sending transaction notification:", error);
  }
}

/**
 * Send low balance alerts
 */
exports.checkLowBalances = onSchedule(
  {
    schedule: "0 9 * * *", // Daily at 9 AM
    timeZone: "America/New_York",
    region: "us-central1",
  },
  async () => {
    try {
      console.log("Checking for low balance accounts...");

      const accountsSnapshot = await db
        .collection("accounts")
        .where("status", "==", "active")
        .where("balance", "<=", 100) // Low balance threshold
        .get();

      const notifications = [];

      accountsSnapshot.forEach((doc) => {
        const account = doc.data();
        const accountId = doc.id;

        notifications.push({
          userId: account.userId,
          title: "Low Balance Alert",
          message: `Your ${account.accountType} account balance is low: $${account.balance.toFixed(2)}`,
          type: "account",
          priority: "high",
          read: false,
          actionUrl: `/accounts/${accountId}`,
          actionText: "Add Funds",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          relatedEntity: "account",
          relatedId: accountId,
        });
      });

      // Batch write notifications
      const batch = db.batch();
      notifications.forEach((notification) => {
        const notificationRef = db.collection("notifications").doc();
        batch.set(notificationRef, notification);
      });

      await batch.commit();

      console.log(`Created ${notifications.length} low balance notifications`);
    } catch (error) {
      console.error("Error checking low balances:", error);
    }
  }
);

// ============================================================================
// SECURITY & FRAUD DETECTION
// ============================================================================

/**
 * Detect suspicious transactions
 */
exports.fraudDetection = onDocumentCreated(
  {
    document: "transactions/{transactionId}",
    region: "us-central1",
  },
  async (event) => {
    const transaction = event.data.data();
    const transactionId = event.params.transactionId;

    try {
      console.log(`Running fraud detection for transaction: ${transactionId}`);

      const riskFactors = [];

      // Check for large amounts
      if (transaction.amount > 10000) {
        riskFactors.push("large_amount");
      }

      // Check for frequent transactions
      const userTransactionsSnapshot = await db
        .collection("transactions")
        .where("userId", "==", transaction.userId)
        .where(
          "timestamp",
          ">",
          admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 24 * 60 * 60 * 1000)
          )
        )
        .get();

      if (userTransactionsSnapshot.size > 10) {
        riskFactors.push("frequent_transactions");
      }

      // Check for unusual hours (outside 6 AM - 10 PM)
      const transactionHour = new Date(
        transaction.timestamp.toDate()
      ).getHours();
      if (transactionHour < 6 || transactionHour > 22) {
        riskFactors.push("unusual_hours");
      }

      // Calculate risk level
      let riskLevel = "low";
      if (riskFactors.length >= 3) {
        riskLevel = "high";
      } else if (riskFactors.length >= 1) {
        riskLevel = "medium";
      }

      // Update transaction with risk assessment
      await db
        .collection("transactions")
        .doc(transactionId)
        .update({
          riskScore: riskLevel,
          fraudFlags: riskFactors,
          reviewRequired: riskLevel === "high",
        });

      // Create alert for high-risk transactions
      if (riskLevel === "high") {
        await createSecurityAlert(
          transaction.userId,
          transactionId,
          riskFactors
        );
      }

      console.log(
        `Fraud detection completed for ${transactionId}: Risk level ${riskLevel}`
      );
    } catch (error) {
      console.error(`Error in fraud detection for ${transactionId}:`, error);
    }
  }
);

async function createSecurityAlert(userId, transactionId, riskFactors) {
  try {
    // Create notification for user
    await db.collection("notifications").add({
      userId,
      title: "Security Alert",
      message: `A potentially suspicious transaction has been detected and flagged for review.`,
      type: "security",
      priority: "urgent",
      read: false,
      actionUrl: `/transactions/${transactionId}`,
      actionText: "Review Transaction",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      relatedEntity: "transaction",
      relatedId: transactionId,
    });

    // Create admin alert
    const adminUsersSnapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();

    const adminNotifications = [];
    adminUsersSnapshot.forEach((doc) => {
      adminNotifications.push({
        userId: doc.id,
        title: "High-Risk Transaction Alert",
        message: `Transaction ${transactionId} flagged for review. Risk factors: ${riskFactors.join(", ")}`,
        type: "security",
        priority: "urgent",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        relatedEntity: "transaction",
        relatedId: transactionId,
      });
    });

    // Batch write admin notifications
    const batch = db.batch();
    adminNotifications.forEach((notification) => {
      const notificationRef = db.collection("notifications").doc();
      batch.set(notificationRef, notification);
    });

    await batch.commit();

    console.log(`Security alert created for transaction ${transactionId}`);
  } catch (error) {
    console.error("Error creating security alert:", error);
  }
}

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Create user profile when new user is authenticated
 */
exports.createUserProfile = onRequest(
  {
    region: "us-central1",
    cors: true,
  },
  async (req, res) => {
    try {
      const { uid, email, name } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if profile already exists
      const existingProfile = await db.collection("users").doc(uid).get();
      if (existingProfile.exists) {
        return res.status(200).json({ message: "Profile already exists" });
      }

      // Create user profile
      const userProfile = {
        uid,
        email,
        name: name || email.split("@")[0],
        role: "customer",
        permissions: ["account_view"],
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        preferences: {
          theme: "light",
          language: "en",
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          currency: "USD",
          timezone: "America/New_York",
        },
        kycStatus: "pending",
        riskLevel: "low",
      };

      await db.collection("users").doc(uid).set(userProfile);

      // Create audit log
      await db.collection("auditLogs").add({
        action: "user_created",
        entity: "users",
        entityId: uid,
        userId: uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          email,
          method: "firebase_auth",
        },
      });

      res.status(201).json({ message: "User profile created successfully" });
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Generate daily analytics report
 */
exports.generateDailyReport = onSchedule(
  {
    schedule: "0 1 * * *", // Daily at 1 AM
    timeZone: "America/New_York",
    region: "us-central1",
  },
  async () => {
    try {
      console.log("Generating daily analytics report...");

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // Get transactions from yesterday
      const transactionsSnapshot = await db
        .collection("transactions")
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(yesterday))
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(today))
        .get();

      const transactions = [];
      transactionsSnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });

      // Calculate metrics
      const totalTransactions = transactions.length;
      const completedTransactions = transactions.filter(
        (t) => t.status === "completed"
      ).length;
      const failedTransactions = transactions.filter(
        (t) => t.status === "failed"
      ).length;
      const totalVolume = transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);

      const transactionsByType = transactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {});

      // Get new users
      const newUsersSnapshot = await db
        .collection("users")
        .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(yesterday))
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(today))
        .get();

      const report = {
        date: yesterday.toISOString().split("T")[0],
        metrics: {
          totalTransactions,
          completedTransactions,
          failedTransactions,
          successRate:
            totalTransactions > 0
              ? ((completedTransactions / totalTransactions) * 100).toFixed(2)
              : 0,
          totalVolume: totalVolume.toFixed(2),
          newUsers: newUsersSnapshot.size,
          transactionsByType,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save report
      await db.collection("analytics").doc(`daily_${report.date}`).set(report);

      console.log("Daily report generated successfully:", report);
    } catch (error) {
      console.error("Error generating daily report:", error);
    }
  }
);

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Clean up old notifications
 */
exports.cleanupOldNotifications = onSchedule(
  {
    schedule: "0 2 * * 0", // Weekly on Sunday at 2 AM
    timeZone: "America/New_York",
    region: "us-central1",
  },
  async () => {
    try {
      console.log("Cleaning up old notifications...");

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const oldNotificationsSnapshot = await db
        .collection("notifications")
        .where(
          "createdAt",
          "<",
          admin.firestore.Timestamp.fromDate(thirtyDaysAgo)
        )
        .where("read", "==", true)
        .limit(100)
        .get();

      if (oldNotificationsSnapshot.empty) {
        console.log("No old notifications to clean up");
        return;
      }

      const batch = db.batch();
      oldNotificationsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(
        `Cleaned up ${oldNotificationsSnapshot.size} old notifications`
      );
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
  }
);
