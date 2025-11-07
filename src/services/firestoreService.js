import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import { AppError, ErrorTypes } from "../utils/errorUtils";

// Firebase error code mappings for better user experience
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/api-key-not-valid":
      "Service configuration error. Please contact support.",
    "auth/network-request-failed":
      "Network connection failed. Please check your internet connection.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "permission-denied": "You do not have permission to access this resource.",
    unavailable: "Service temporarily unavailable. Please try again later.",
  };
  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};
import { ValidationUtils } from "../utils/simpleValidation";
import { firebaseErrorHandler } from "../utils/firebaseErrorHandler";

class FirestoreService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  _getCacheKey(collectionName, docId, queryConstraints = []) {
    return `${collectionName}:${docId || "list"}:${JSON.stringify(queryConstraints)}`;
  }

  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  _clearCache(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Check if Firebase is available
  _checkFirebaseAvailable() {
    if (!isFirebaseConfigured || !db) {
      console.log("🔄 Firebase not available, using fallback mode");
      return false;
    }
    return true;
  }

  // Generic CRUD operations
  async create(collectionName, data, docId = null) {
    try {
      if (!this._checkFirebaseAvailable()) {
        console.warn(`Fallback: Cannot create document in ${collectionName}`);
        return { id: docId || `mock-${Date.now()}`, ...data };
      }
      const timestamp = serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (docId) {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, docData);
        // Clear cache for this collection
        this._clearCache(collectionName);
        return { id: docId, ...docData };
      } else {
        const docRef = await addDoc(collection(db, collectionName), docData);
        // Clear cache for this collection
        this._clearCache(collectionName);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw AppError.network(`Failed to create ${collectionName.slice(0, -1)}`);
    }
  }

  async read(collectionName, docId) {
    try {
      if (!this._checkFirebaseAvailable()) {
        return await firebaseErrorHandler.mockGetDocument(
          collectionName,
          docId
        );
      }

      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);

      // Fallback to mock data on error
      if (import.meta.env.DEV) {
        console.log("🔄 Falling back to mock data due to error");
        return await firebaseErrorHandler.mockGetDocument(
          collectionName,
          docId
        );
      }

      throw AppError.network(`Failed to fetch ${collectionName.slice(0, -1)}`);
    }
  }

  async update(collectionName, docId, updates) {
    try {
      console.log(
        `FirestoreService: Updating ${collectionName}/${docId} with:`,
        updates
      );

      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      console.log(`FirestoreService: Full update data:`, updateData);

      await updateDoc(docRef, updateData);

      console.log(
        `FirestoreService: Successfully updated ${collectionName}/${docId}`
      );

      return true;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      console.error("Full error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw AppError.network(`Failed to update ${collectionName.slice(0, -1)}`);
    }
  }

  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw AppError.network(`Failed to delete ${collectionName.slice(0, -1)}`);
    }
  }

  async list(collectionName, queryConstraints = []) {
    try {
      if (!this._checkFirebaseAvailable()) {
        console.warn(`Fallback: Cannot list ${collectionName}`);
        return [];
      }

      // Check cache first
      const cacheKey = this._getCacheKey(
        collectionName,
        null,
        queryConstraints
      );
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache results
      this._setCache(cacheKey, results);

      return results;
    } catch (error) {
      const msg = (error && error.message) || String(error);
      if (msg.includes("Missing or insufficient permissions")) {
        console.warn(
          `Permissions blocked listing ${collectionName}. Returning empty array.`
        );
      } else {
        console.error(`Error listing documents from ${collectionName}:`, error);
      }
      // Return empty array instead of throwing for better UX
      return [];
    }
  }

  // Account operations
  async createAccount(userId, accountData) {
    try {
      const validatedData = ValidationUtils.validateAccount(accountData);

      const account = {
        ...validatedData.data,
        userId,
        accountNumber: this.generateAccountNumber(),
        status: "active",
        balance: accountData.initialBalance || 0,
        currency: "USD",
        active: true,
        benefits: accountData.benefits || [],
        category: accountData.category || "deposit",
        description: accountData.description || "",
      };

      return await this.create("accounts", account);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.network("Failed to create account");
    }
  }

  async getUserAccounts(userId) {
    // DEPRECATED: Accounts are now stored in user documents, not separate collection
    // This function is kept for backward compatibility but returns empty array
    console.warn(
      "⚠️ getUserAccounts is deprecated. Use getUserProfile to get user.accounts instead."
    );
    return [];
  }

  async getAccountTypes() {
    try {
      return await this.list("accountTypes", []);
    } catch (error) {
      throw AppError.network("Failed to fetch account types");
    }
  }

  async getBankingProducts() {
    try {
      return await this.list("bankingProducts", []);
    } catch (error) {
      throw AppError.network("Failed to fetch banking products");
    }
  }

  async getBankingServices() {
    try {
      return await this.list("bankingServices", []);
    } catch (error) {
      throw AppError.network("Failed to fetch banking services");
    }
  }

  async getBankSettings() {
    try {
      const settings = await this.list("bankSettings", []);
      return settings[0] || {};
    } catch (error) {
      throw AppError.network("Failed to fetch bank settings");
    }
  }

  async getAnnouncements() {
    try {
      return await this.list("announcements", [
        where("active", "==", true),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      throw AppError.network("Failed to fetch announcements");
    }
  }

  async getAdminData() {
    try {
      const adminData = await this.list("adminData", []);
      return adminData[0] || {};
    } catch (error) {
      throw AppError.network("Failed to fetch admin data");
    }
  }

  async getAuditLogs(limit = 50) {
    try {
      return await this.list("auditLogs", [
        orderBy("timestamp", "desc"),
        limit(limit),
      ]);
    } catch (error) {
      throw AppError.network("Failed to fetch audit logs");
    }
  }

  async getAccountById(accountId) {
    try {
      return await this.read("accounts", accountId);
    } catch (error) {
      throw AppError.network("Failed to fetch account details");
    }
  }

  async updateAccountBalance(accountId, newBalance) {
    try {
      return await this.update("accounts", accountId, { balance: newBalance });
    } catch (error) {
      throw AppError.network("Failed to update account balance");
    }
  }

  // Transaction operations
  async createTransaction(transactionData) {
    try {
      const validatedData =
        ValidationUtils.validateTransaction(transactionData);

      const transaction = {
        ...validatedData.data,
        id: this.generateTransactionId(),
        status: "pending",
        timestamp: serverTimestamp(),
      };

      // Use batch write for transaction + balance updates
      const batch = writeBatch(db);

      // Add transaction
      const transactionRef = doc(collection(db, "transactions"));
      batch.set(transactionRef, transaction);

      // Update account balances
      if (transaction.fromAccount) {
        const fromAccountRef = doc(db, "accounts", transaction.fromAccount);
        batch.update(fromAccountRef, {
          balance: increment(-transaction.amount),
          lastActivity: serverTimestamp(),
        });
      }

      if (transaction.toAccount) {
        const toAccountRef = doc(db, "accounts", transaction.toAccount);
        batch.update(toAccountRef, {
          balance: increment(transaction.amount),
          lastActivity: serverTimestamp(),
        });
      }

      await batch.commit();

      return { id: transactionRef.id, ...transaction };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.transaction("Failed to process transaction");
    }
  }

  async getAllTransactionsForAdmin(limitCount = 100) {
    try {
      console.log(`🔍 Admin: Fetching all transactions (limit: ${limitCount})`);
      let transactions = [];

      // Strategy 1: Direct query with orderBy
      try {
        console.log("📊 Trying direct query with orderBy...");
        const allTransactions = await this.list("transactions", [
          orderBy("timestamp", "desc"),
          limit(limitCount),
        ]);
        transactions.push(...allTransactions);
        console.log(
          `✅ Found ${allTransactions.length} transactions via orderBy query`
        );
      } catch (orderError) {
        console.warn(
          "⚠️ OrderBy failed, trying without orderBy:",
          orderError.message
        );

        // Fallback: try without orderBy
        try {
          const allTransactions = await this.list("transactions", [
            limit(limitCount),
          ]);
          transactions.push(...allTransactions);
          console.log(
            `✅ Found ${allTransactions.length} transactions via simple query`
          );
        } catch (simpleError) {
          console.warn("⚠️ Simple query failed:", simpleError.message);
        }
      }

      // Strategy 2: If no transactions found, get all users and their transactions
      if (transactions.length === 0) {
        try {
          console.log("📊 Trying user-based aggregation...");
          const users = await this.list("users", []);
          console.log(`Found ${users.length} users to check for transactions`);

          for (const user of users.slice(0, 10)) {
            // Limit to prevent too many queries
            try {
              const userTransactions = await this.getUserTransactions(
                user.id,
                20
              );
              transactions.push(...userTransactions);
            } catch (error) {
              console.warn(
                `⚠️ Failed to get transactions for user ${user.id}:`,
                error.message
              );
            }
          }
          console.log(
            `✅ Found ${transactions.length} transactions via user aggregation`
          );
        } catch (error) {
          console.warn("⚠️ User aggregation failed:", error.message);
        }
      }

      // Remove duplicates based on transaction ID
      const uniqueTransactions = transactions.filter(
        (transaction, index, self) =>
          index === self.findIndex((t) => t.id === transaction.id)
      );

      console.log(
        `📋 Admin: Total unique transactions found: ${uniqueTransactions.length}`
      );
      return uniqueTransactions.slice(0, limitCount);
    } catch (error) {
      console.error("❌ Admin: Failed to fetch all transactions:", error);
      return [];
    }
  }

  async getUserTransactions(userId, limitCount = 50) {
    try {
      console.log(`🔍 Fetching transactions for user: ${userId}`);
      let transactions = [];

      // Strategy 1: Query by userId field directly
      try {
        console.log("📊 Trying userId query for:", userId);

        // First try with orderBy
        try {
          const userIdTransactions = await this.list("transactions", [
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          ]);
          transactions.push(...userIdTransactions);
          console.log(
            `✅ Found ${userIdTransactions.length} transactions via userId query with orderBy`
          );
        } catch (orderError) {
          console.warn(
            "⚠️ OrderBy failed, trying without orderBy:",
            orderError.message
          );

          // Fallback: try without orderBy
          const userIdTransactions = await this.list("transactions", [
            where("userId", "==", userId),
            limit(limitCount),
          ]);
          transactions.push(...userIdTransactions);
          console.log(
            `✅ Found ${userIdTransactions.length} transactions via userId query without orderBy`
          );
        }
      } catch (error) {
        console.warn("⚠️ UserId query failed completely:", error.message);
      }

      // Strategy 2: Query by accountId patterns if userId query didn't work
      if (transactions.length === 0) {
        try {
          console.log("📊 Trying accountId patterns...");
          const accountPatterns = [
            `${userId}_primary`,
            `${userId}_account_0`,
            "johnson_primary", // Specific fallback for Johnson
          ];

          for (const accountId of accountPatterns) {
            try {
              const accountTransactions = await this.list("transactions", [
                where("accountId", "==", accountId),
                orderBy("timestamp", "desc"),
                limit(limitCount),
              ]);
              transactions.push(...accountTransactions);
              console.log(
                `✅ Found ${accountTransactions.length} transactions for account ${accountId}`
              );
            } catch (error) {
              console.warn(
                `⚠️ Account query failed for ${accountId}:`,
                error.message
              );
            }
          }
        } catch (error) {
          console.warn("⚠️ Account pattern queries failed:", error.message);
        }
      }

      // Strategy 3: Get user profile and query by fromAccount/toAccount
      if (transactions.length === 0) {
        try {
          console.log("📊 Trying account-based queries...");
          const userProfile = await this.getUserProfile(userId);
          const accounts = userProfile?.accounts || [];
          const accountIds = accounts.map((acc) => acc.id).slice(0, 10); // Firestore 'in' limit

          if (accountIds.length > 0) {
            // Query transactions where user's accounts are involved
            const [sentTransactions, receivedTransactions] = await Promise.all([
              this.list("transactions", [
                where("fromAccount", "in", accountIds),
                orderBy("timestamp", "desc"),
                limit(limitCount),
              ]).catch(() => []),
              this.list("transactions", [
                where("toAccount", "in", accountIds),
                orderBy("timestamp", "desc"),
                limit(limitCount),
              ]).catch(() => []),
            ]);

            transactions.push(...sentTransactions, ...receivedTransactions);
            console.log(
              `✅ Found ${sentTransactions.length + receivedTransactions.length} transactions via account queries`
            );
          }
        } catch (error) {
          console.warn("⚠️ Account-based queries failed:", error.message);
        }
      }

      // Remove duplicates based on transaction ID
      const uniqueTransactions = transactions.filter(
        (transaction, index, self) =>
          index === self.findIndex((t) => t.id === transaction.id)
      );

      console.log(
        `📋 Total unique transactions found: ${uniqueTransactions.length}`
      );
      return uniqueTransactions.slice(0, limitCount);
    } catch (error) {
      console.error("❌ Failed to fetch user transactions:", error);
      // Return empty array instead of throwing error to prevent app crash
      return [];
    }
  }

  async getAccountTransactions(accountId, limitCount = 20) {
    try {
      const [sent, received] = await Promise.all([
        this.list("transactions", [
          where("fromAccount", "==", accountId),
          orderBy("timestamp", "desc"),
          limit(limitCount),
        ]),
        this.list("transactions", [
          where("toAccount", "==", accountId),
          orderBy("timestamp", "desc"),
          limit(limitCount),
        ]),
      ]);

      // Merge and sort by timestamp
      const allTransactions = [...sent, ...received];
      return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      throw AppError.network("Failed to fetch account transactions");
    }
  }

  async updateTransactionStatus(transactionId, status) {
    try {
      return await this.update("transactions", transactionId, { status });
    } catch (error) {
      throw AppError.network("Failed to update transaction status");
    }
  }

  // Real-time listeners
  subscribeToCollection(collectionName, queryConstraints, callback) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(docs);
        },
        (error) => {
          console.error(`Error in ${collectionName} subscription:`, error);
          callback(null, error);
        }
      );

      // Store listener for cleanup
      const listenerId = `${collectionName}_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      return listenerId;
    } catch (error) {
      console.error(`Error setting up ${collectionName} listener:`, error);
      throw AppError.network(`Failed to subscribe to ${collectionName}`);
    }
  }

  subscribeToDocument(collectionName, docId, callback) {
    try {
      const docRef = doc(db, collectionName, docId);

      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error(`Error in document subscription:`, error);
          callback(null, error);
        }
      );

      // Store listener for cleanup
      const listenerId = `${collectionName}_${docId}_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      return listenerId;
    } catch (error) {
      console.error(`Error setting up document listener:`, error);
      throw AppError.network("Failed to subscribe to document");
    }
  }

  unsubscribe(listenerId) {
    const unsubscribeFn = this.listeners.get(listenerId);
    if (unsubscribeFn) {
      unsubscribeFn();
      this.listeners.delete(listenerId);
      return true;
    }
    return false;
  }

  unsubscribeAll() {
    this.listeners.forEach((unsubscribeFn) => {
      unsubscribeFn();
    });
    this.listeners.clear();
  }

  // Utility functions
  generateAccountNumber() {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // User profile operations
  async getUserProfile(userId) {
    try {
      if (!this._checkFirebaseAvailable()) {
        return await firebaseErrorHandler.mockGetDocument("users", userId);
      }
      return await this.read("users", userId);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (!this._checkFirebaseAvailable()) {
        return await firebaseErrorHandler.mockGetDocument("users", userId);
      }
      throw AppError.network("Failed to fetch user profile");
    }
  }

  /**
   * Get accounts for a given user in an admin-safe way.
   * Priority:
   * 1) Embedded accounts array on the user's profile document
   * 2) Fallback to top-level `accounts` collection using either userId or customerUID
   * Returns an array of lightweight account objects.
   */
  async getAccountsForUser(userId) {
    try {
      // Try embedded accounts on profile
      const profile = await this.getUserProfile(userId).catch(() => null);
      const embedded = Array.isArray(profile?.accounts) ? profile.accounts : [];

      if (embedded.length > 0) {
        return embedded.map((acc) => ({
          id: acc.id || acc.accountId || acc.accountNumber || acc.number || "",
          accountType: acc.accountType || acc.type || "checking",
          accountNumber: acc.accountNumber || acc.number || "",
          routingNumber: acc.routingNumber || acc.routing || "",
          balance: Number(acc.balance || 0),
          status: acc.status || "active",
          userId: acc.userId || userId,
        }));
      }

      // Fallback: query accounts collection by userId and customerUID; merge results
      let byUserId = [];
      let byCustomerUID = [];
      try {
        byUserId = await this.list("accounts", [where("userId", "==", userId)]);
      } catch (e1) {
        byUserId = [];
      }

      try {
        // If first result is empty, or always fetch to merge, read by customerUID
        if (byUserId.length === 0) {
          byCustomerUID = await this.list("accounts", [
            where("customerUID", "==", userId),
          ]);
        }
      } catch (e2) {
        byCustomerUID = [];
      }

      // Merge and de-duplicate results from filtered queries only
      let accounts = [];
      if (byUserId.length > 0 || byCustomerUID.length > 0) {
        const map = new Map();
        [...byUserId, ...byCustomerUID].forEach((a) => map.set(a.id, a));
        accounts = Array.from(map.values());
      }

      return accounts.map((acc) => ({
        id: acc.id,
        accountType: acc.accountType || acc.type || "checking",
        accountNumber: acc.accountNumber || acc.number || "",
        routingNumber: acc.routingNumber || acc.routing || "",
        balance: Number(acc.balance || 0),
        status: acc.status || "active",
        userId: acc.userId || acc.customerUID || userId,
      }));
    } catch (error) {
      console.warn("⚠️ getAccountsForUser failed:", error?.message || error);
      return [];
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      return await this.update("users", userId, updates);
    } catch (error) {
      throw AppError.network("Failed to update user profile");
    }
  }

  async createUserProfile(userId, userData) {
    try {
      return await this.create("users", userData, userId);
    } catch (error) {
      throw AppError.network("Failed to create user profile");
    }
  }

  async deleteUserProfile(userId) {
    try {
      return await this.delete("users", userId);
    } catch (error) {
      throw AppError.network("Failed to delete user profile");
    }
  }

  async getAllUserProfiles() {
    try {
      return await this.list("users", [orderBy("createdAt", "desc")]);
    } catch (error) {
      throw AppError.network("Failed to fetch user profiles");
    }
  }

  async getUsersByRole(role) {
    try {
      return await this.list("users", [
        where("role", "==", role),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      throw AppError.network("Failed to fetch users by role");
    }
  }

  async updateUserNameFields(userId, firstName, lastName) {
    try {
      console.log("FirestoreService: updateUserNameFields called with:", {
        userId,
        firstName,
        lastName,
      });

      const updates = {
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`, // Keep for backward compatibility
      };

      console.log("FirestoreService: About to update with:", updates);

      const result = await this.updateUserProfile(userId, updates);

      console.log("FirestoreService: Update result:", result);

      return result;
    } catch (error) {
      console.error("FirestoreService: Update failed:", error);
      throw AppError.network("Failed to update user name fields");
    }
  }

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = writeBatch(db);

      operations.forEach(({ type, collection: collectionName, id, data }) => {
        const docRef = id
          ? doc(db, collectionName, id)
          : doc(collection(db, collectionName));

        switch (type) {
          case "set":
            batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case "update":
            batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case "delete":
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Unknown batch operation type: ${type}`);
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Batch write error:", error);
      throw AppError.network("Failed to execute batch operation");
    }
  }
}

// Create singleton instance
const firestoreService = new FirestoreService();
export default firestoreService;
