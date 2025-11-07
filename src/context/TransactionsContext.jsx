import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

const TransactionsContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return context;
};

export const TransactionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for user's transactions
  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log(
      "📡 Setting up real-time transactions listener for user:",
      user.uid
    );

    // Query transactions where customerUID matches
    // Note: We're not using orderBy to avoid requiring a composite index
    // We'll sort in memory instead
    const transactionsRef = collection(db, "transactions");
    const q = query(
      transactionsRef,
      where("customerUID", "==", user.uid),
      limit(100) // Load last 100 transactions
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const transactionsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Ensure timestamps are converted
            timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
            processedAt:
              doc.data().processedAt?.toDate?.() || doc.data().processedAt,
          }))
          // Sort in memory by timestamp descending
          .sort((a, b) => {
            const timeA =
              a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
            const timeB =
              b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
            return timeB - timeA;
          });

        console.log(
          `✅ Loaded ${transactionsData.length} transactions from Firestore (real-time)`
        );
        setTransactions(transactionsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("❌ Error in transactions listener:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("🔌 Cleaning up transactions listener");
      unsubscribe();
    };
  }, [user?.uid]);

  // Create transaction
  const createTransaction = useCallback(
    async (transactionData) => {
      try {
        console.log("➕ Creating new transaction");
        const transactionsRef = collection(db, "transactions");
        const newTransaction = {
          ...transactionData,
          customerUID: user.uid,
          userId: user.uid,
          userEmail: user.email,
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: transactionData.status || "pending",
        };
        const docRef = await addDoc(transactionsRef, newTransaction);
        console.log("✅ Transaction created with ID:", docRef.id);
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error("❌ Error creating transaction:", error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  // Update transaction
  const updateTransaction = useCallback(async (transactionId, updates) => {
    try {
      console.log("💾 Updating transaction:", transactionId);
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Transaction updated successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating transaction:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      console.log("🗑️ Deleting transaction:", transactionId);
      const transactionRef = doc(db, "transactions", transactionId);
      await deleteDoc(transactionRef);
      console.log("✅ Transaction deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting transaction:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get transaction by ID
  const getTransaction = useCallback(
    (transactionId) => {
      return transactions.find((txn) => txn.id === transactionId);
    },
    [transactions]
  );

  // Get transactions by type
  const getTransactionsByType = useCallback(
    (type) => {
      return transactions.filter((txn) => txn.type === type);
    },
    [transactions]
  );

  // Get transactions by date range
  const getTransactionsByDateRange = useCallback(
    (startDate, endDate) => {
      return transactions.filter((txn) => {
        const txnDate = txn.timestamp;
        return txnDate >= startDate && txnDate <= endDate;
      });
    },
    [transactions]
  );

  // Calculate total by type
  const getTotalByType = useCallback(
    (type) => {
      return transactions
        .filter((txn) => txn.type === type && txn.status === "completed")
        .reduce((sum, txn) => sum + Math.abs(txn.amount || 0), 0);
    },
    [transactions]
  );

  const value = {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    getTransactionsByType,
    getTransactionsByDateRange,
    getTotalByType,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};
