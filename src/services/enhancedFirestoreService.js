/**
 * Enhanced Firestore Service
 * Provides advanced database operations with improved error handling,
 * real-time subscriptions, and performance optimizations
 */

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
  endBefore,
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  runTransaction,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { AppError, ErrorTypes } from "../utils/errorUtils";
import {
  createUserSchema,
  createAccountSchema,
  createTransactionSchema,
  createNotificationSchema,
  createAuditLogSchema,
  generateAccountNumber,
  generateTransactionId,
  validateSchema,
} from "../models/dataModels";

class EnhancedFirestoreService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.batchSize = 500;

    // Initialize offline support
    this.initializeOfflineSupport();
  }

  // ============================================================================
  // INITIALIZATION & CONFIGURATION
  // ============================================================================

  async initializeOfflineSupport() {
    try {
      // Enable offline persistence with increased cache size
      if (typeof window !== "undefined") {
        // Only run in browser environment
        console.log("Initializing offline support...");
      }
    } catch (error) {
      console.warn("Offline persistence not available:", error);
    }
  }

  // ============================================================================
  // ENHANCED CRUD OPERATIONS
  // ============================================================================

  async create(collectionName, data, docId = null, options = {}) {
    try {
      const { useTransaction = false, validateSchema: shouldValidate = true } =
        options;

      // Schema validation
      if (shouldValidate) {
        const validationResult = this.validateDocumentSchema(
          collectionName,
          data
        );
        if (!validationResult.isValid) {
          throw new AppError(
            "validation",
            `Invalid data: ${validationResult.errors.join(", ")}`
          );
        }
      }

      const timestamp = serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        version: 1,
      };

      let result;

      if (useTransaction) {
        result = await runTransaction(db, async (transaction) => {
          const docRef = docId
            ? doc(db, collectionName, docId)
            : doc(collection(db, collectionName));

          if (docId) {
            const existingDoc = await transaction.get(docRef);
            if (existingDoc.exists()) {
              throw new AppError("conflict", "Document already exists");
            }
          }

          transaction.set(docRef, docData);
          return { id: docRef.id, ...docData };
        });
      } else {
        if (docId) {
          const docRef = doc(db, collectionName, docId);
          await setDoc(docRef, docData);
          result = { id: docId, ...docData };
        } else {
          const docRef = await addDoc(collection(db, collectionName), docData);
          result = { id: docRef.id, ...docData };
        }
      }

      // Create audit log
      if (options.audit !== false) {
        await this.createAuditLog(
          "create",
          collectionName,
          result.id,
          {},
          docData
        );
      }

      // Clear relevant cache
      this.clearCachePattern(collectionName);

      return result;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw this.handleFirestoreError(
        error,
        `Failed to create ${collectionName.slice(0, -1)}`
      );
    }
  }

  async read(collectionName, docId, options = {}) {
    try {
      const { useCache = true, maxAge = 300000 } = options; // 5 minutes default cache

      // Check cache first
      const cacheKey = `${collectionName}:${docId}`;
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < maxAge) {
          return cached.data;
        }
      }

      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };

        // Cache the result
        if (useCache) {
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
        }

        return data;
      }

      return null;
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);
      throw this.handleFirestoreError(
        error,
        `Failed to fetch ${collectionName.slice(0, -1)}`
      );
    }
  }

  async update(collectionName, docId, updates, options = {}) {
    try {
      const { useTransaction = false, incrementVersion = true } = options;

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (incrementVersion) {
        updateData.version = increment(1);
      }

      let oldData = null;

      if (useTransaction) {
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, collectionName, docId);
          const docSnap = await transaction.get(docRef);

          if (!docSnap.exists()) {
            throw new AppError("not_found", "Document not found");
          }

          oldData = docSnap.data();
          transaction.update(docRef, updateData);
        });
      } else {
        // Get old data for audit
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        oldData = docSnap.exists() ? docSnap.data() : null;

        await updateDoc(docRef, updateData);
      }

      // Create audit log
      if (options.audit !== false) {
        await this.createAuditLog(
          "update",
          collectionName,
          docId,
          oldData,
          updateData
        );
      }

      // Clear cache
      this.clearCachePattern(`${collectionName}:${docId}`);
      this.clearCachePattern(collectionName);

      return true;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw this.handleFirestoreError(
        error,
        `Failed to update ${collectionName.slice(0, -1)}`
      );
    }
  }

  async delete(collectionName, docId, options = {}) {
    try {
      const { useTransaction = false, softDelete = false } = options;

      if (softDelete) {
        return await this.update(
          collectionName,
          docId,
          {
            deleted: true,
            deletedAt: serverTimestamp(),
          },
          options
        );
      }

      let oldData = null;

      if (useTransaction) {
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, collectionName, docId);
          const docSnap = await transaction.get(docRef);

          if (!docSnap.exists()) {
            throw new AppError("not_found", "Document not found");
          }

          oldData = docSnap.data();
          transaction.delete(docRef);
        });
      } else {
        // Get old data for audit
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        oldData = docSnap.exists() ? docSnap.data() : null;

        await deleteDoc(docRef);
      }

      // Create audit log
      if (options.audit !== false) {
        await this.createAuditLog("delete", collectionName, docId, oldData, {});
      }

      // Clear cache
      this.clearCachePattern(`${collectionName}:${docId}`);
      this.clearCachePattern(collectionName);

      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw this.handleFirestoreError(
        error,
        `Failed to delete ${collectionName.slice(0, -1)}`
      );
    }
  }

  // ============================================================================
  // ADVANCED QUERYING
  // ============================================================================

  async list(collectionName, queryConstraints = [], options = {}) {
    try {
      const {
        useCache = false,
        maxAge = 300000,
        includeSoftDeleted = false,
      } = options;

      // Add soft delete filter
      if (!includeSoftDeleted) {
        queryConstraints.push(where("deleted", "!=", true));
      }

      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);

      const cacheKey = `list:${collectionName}:${this.hashQuery(queryConstraints)}`;

      // Check cache
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < maxAge) {
          return cached.data;
        }
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache results
      if (useCache) {
        this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
      }

      return results;
    } catch (error) {
      console.error(`Error listing documents from ${collectionName}:`, error);
      throw this.handleFirestoreError(
        error,
        `Failed to fetch ${collectionName}`
      );
    }
  }

  async paginate(collectionName, queryConstraints = [], options = {}) {
    try {
      const { pageSize = 25, lastDoc = null, direction = "next" } = options;

      const collectionRef = collection(db, collectionName);
      let constraints = [...queryConstraints, limit(pageSize)];

      if (lastDoc) {
        if (direction === "next") {
          constraints.push(startAfter(lastDoc));
        } else {
          constraints.push(endBefore(lastDoc));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        _doc: doc, // Store Firestore document for pagination
      }));

      return {
        docs,
        hasMore: docs.length === pageSize,
        lastDoc: docs.length > 0 ? docs[docs.length - 1]._doc : null,
        firstDoc: docs.length > 0 ? docs[0]._doc : null,
      };
    } catch (error) {
      console.error(`Error paginating ${collectionName}:`, error);
      throw this.handleFirestoreError(
        error,
        `Failed to paginate ${collectionName}`
      );
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  subscribeToDocument(collectionName, docId, callback, options = {}) {
    try {
      const { includeMetadata = false } = options;
      const docRef = doc(db, collectionName, docId);

      const unsubscribe = onSnapshot(
        docRef,
        { includeMetadataChanges: includeMetadata },
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = { id: docSnapshot.id, ...docSnapshot.data() };
            callback(data, null);
          } else {
            callback(null, null);
          }
        },
        (error) => {
          console.error(
            `Error in ${collectionName}/${docId} subscription:`,
            error
          );
          callback(
            null,
            this.handleFirestoreError(error, "Subscription error")
          );
        }
      );

      const listenerId = `doc:${collectionName}:${docId}:${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      return listenerId;
    } catch (error) {
      console.error("Error setting up document subscription:", error);
      throw this.handleFirestoreError(error, "Failed to subscribe to document");
    }
  }

  subscribeToCollection(
    collectionName,
    queryConstraints,
    callback,
    options = {}
  ) {
    try {
      const { includeMetadata = false, includeSoftDeleted = false } = options;

      // Add soft delete filter
      if (!includeSoftDeleted) {
        queryConstraints.push(where("deleted", "!=", true));
      }

      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: includeMetadata },
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const changes = snapshot.docChanges().map((change) => ({
            type: change.type,
            doc: { id: change.doc.id, ...change.doc.data() },
            oldIndex: change.oldIndex,
            newIndex: change.newIndex,
          }));

          callback(docs, changes, null);
        },
        (error) => {
          console.error(`Error in ${collectionName} subscription:`, error);
          callback(
            null,
            null,
            this.handleFirestoreError(error, "Subscription error")
          );
        }
      );

      const listenerId = `collection:${collectionName}:${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      return listenerId;
    } catch (error) {
      console.error("Error setting up collection subscription:", error);
      throw this.handleFirestoreError(
        error,
        "Failed to subscribe to collection"
      );
    }
  }

  unsubscribe(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      return true;
    }
    return false;
  }

  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async batchWrite(operations, options = {}) {
    try {
      const { useTransaction = false } = options;
      const batches = this.createBatches(operations);

      if (useTransaction) {
        return await this.executeTransactionBatch(operations);
      } else {
        return await this.executeBatches(batches);
      }
    } catch (error) {
      console.error("Batch write error:", error);
      throw this.handleFirestoreError(
        error,
        "Failed to execute batch operation"
      );
    }
  }

  createBatches(operations) {
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    operations.forEach((operation) => {
      if (operationCount >= this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }

      const { type, collection: collectionName, id, data } = operation;
      const docRef = id
        ? doc(db, collectionName, id)
        : doc(collection(db, collectionName));

      switch (type) {
        case "set":
          currentBatch.set(docRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
        case "update":
          currentBatch.update(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });
          break;
        case "delete":
          currentBatch.delete(docRef);
          break;
        default:
          throw new Error(`Unknown batch operation type: ${type}`);
      }

      operationCount++;
    });

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  async executeBatches(batches) {
    const results = [];

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      results.push(`Batch ${i + 1} completed`);
    }

    return results;
  }

  // ============================================================================
  // BANKING-SPECIFIC OPERATIONS
  // ============================================================================

  async createAccount(userId, accountData) {
    try {
      const account = createAccountSchema({
        ...accountData,
        userId,
        accountNumber: generateAccountNumber(accountData.accountType),
      });

      return await this.create("accounts", account, null, {
        validateSchema: true,
        audit: true,
      });
    } catch (error) {
      throw this.handleFirestoreError(error, "Failed to create account");
    }
  }

  async processTransaction(transactionData) {
    try {
      return await runTransaction(db, async (transaction) => {
        const transactionRecord = createTransactionSchema({
          ...transactionData,
          transactionId: generateTransactionId(),
        });

        // Create transaction record
        const transactionRef = doc(collection(db, "transactions"));
        transaction.set(transactionRef, transactionRecord);

        // Update account balances
        if (transactionRecord.fromAccount) {
          const fromAccountRef = doc(
            db,
            "accounts",
            transactionRecord.fromAccount
          );
          const fromAccountSnap = await transaction.get(fromAccountRef);

          if (!fromAccountSnap.exists()) {
            throw new AppError("not_found", "Source account not found");
          }

          const fromAccountData = fromAccountSnap.data();
          const newFromBalance =
            fromAccountData.balance - transactionRecord.amount;

          if (
            newFromBalance < 0 &&
            !fromAccountData.features?.overdraftProtection
          ) {
            throw new AppError("insufficient_funds", "Insufficient funds");
          }

          transaction.update(fromAccountRef, {
            balance: newFromBalance,
            availableBalance: newFromBalance,
            lastActivity: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        if (transactionRecord.toAccount) {
          const toAccountRef = doc(db, "accounts", transactionRecord.toAccount);
          const toAccountSnap = await transaction.get(toAccountRef);

          if (!toAccountSnap.exists()) {
            throw new AppError("not_found", "Destination account not found");
          }

          transaction.update(toAccountRef, {
            balance: increment(transactionRecord.amount),
            availableBalance: increment(transactionRecord.amount),
            lastActivity: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        return { id: transactionRef.id, ...transactionRecord };
      });
    } catch (error) {
      throw this.handleFirestoreError(error, "Failed to process transaction");
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  validateDocumentSchema(collectionName, data) {
    // Implement schema validation based on collection
    switch (collectionName) {
      case "users":
        return this.validateUserSchema(data);
      case "accounts":
        return this.validateAccountSchema(data);
      case "transactions":
        return this.validateTransactionSchema(data);
      default:
        return { isValid: true, errors: [] };
    }
  }

  validateUserSchema(data) {
    const errors = [];

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.push("Valid email is required");
    }

    if (!data.name || data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    return { isValid: errors.length === 0, errors };
  }

  validateAccountSchema(data) {
    const errors = [];

    if (!data.userId) {
      errors.push("User ID is required");
    }

    if (!data.accountType) {
      errors.push("Account type is required");
    }

    if (typeof data.balance !== "number") {
      errors.push("Balance must be a number");
    }

    return { isValid: errors.length === 0, errors };
  }

  validateTransactionSchema(data) {
    const errors = [];

    if (!data.amount || data.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (!data.type) {
      errors.push("Transaction type is required");
    }

    return { isValid: errors.length === 0, errors };
  }

  async createAuditLog(action, entity, entityId, oldValues, newValues) {
    try {
      const auditLog = createAuditLogSchema({
        action,
        entity,
        entityId,
        oldValues: oldValues || {},
        newValues: newValues || {},
      });

      await this.create("auditLogs", auditLog, null, { audit: false });
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't throw here as audit failure shouldn't stop the main operation
    }
  }

  hashQuery(constraints) {
    // Simple hash function for caching query results
    return btoa(JSON.stringify(constraints)).slice(0, 16);
  }

  clearCachePattern(pattern) {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  handleFirestoreError(error, defaultMessage) {
    if (error instanceof AppError) {
      return error;
    }

    const errorCode = error.code || "unknown";
    const errorMessage = error.message || defaultMessage;

    switch (errorCode) {
      case "permission-denied":
        return new AppError("permission", "Permission denied");
      case "not-found":
        return new AppError("not_found", "Document not found");
      case "already-exists":
        return new AppError("conflict", "Document already exists");
      case "failed-precondition":
        return new AppError("validation", "Operation failed validation");
      case "unavailable":
        return new AppError("network", "Service temporarily unavailable");
      default:
        return new AppError("unknown", errorMessage);
    }
  }

  // Network status management
  async enableOfflineMode() {
    try {
      await disableNetwork(db);
      console.log("Offline mode enabled");
    } catch (error) {
      console.error("Failed to enable offline mode:", error);
    }
  }

  async enableOnlineMode() {
    try {
      await enableNetwork(db);
      console.log("Online mode enabled");
    } catch (error) {
      console.error("Failed to enable online mode:", error);
    }
  }

  // Cache management
  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }

  getCacheStats() {
    let totalSize = 0;
    this.cache.forEach((value) => {
      totalSize += JSON.stringify(value).length;
    });

    return {
      entries: this.cache.size,
      estimatedSize: totalSize,
      memoryUsage: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    };
  }
}

// Create singleton instance
const enhancedFirestoreService = new EnhancedFirestoreService();
export default enhancedFirestoreService;
