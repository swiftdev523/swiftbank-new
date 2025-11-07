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
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

const AccountsContext = createContext();

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountsProvider");
  }
  return context;
};

export const AccountsProvider = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for user's accounts
  useEffect(() => {
    if (!user?.uid) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log(
      "📡 Setting up real-time accounts listener for user:",
      user.uid
    );

    // Query accounts where userId OR customerUID matches
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("customerUID", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const accountsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure timestamps are converted
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          openedDate:
            doc.data().openedDate?.toDate?.() || doc.data().openedDate,
          lastTransactionDate:
            doc.data().lastTransactionDate?.toDate?.() ||
            doc.data().lastTransactionDate,
        }));

        // Sort accounts: primary first, then by type, then by balance
        const sortedAccounts = accountsData.sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          if (a.accountType !== b.accountType) {
            return a.accountType.localeCompare(b.accountType);
          }
          return (b.balance || 0) - (a.balance || 0);
        });

        console.log(
          `✅ Loaded ${sortedAccounts.length} accounts from Firestore (real-time)`
        );
        setAccounts(sortedAccounts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("❌ Error in accounts listener:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("🔌 Cleaning up accounts listener");
      unsubscribe();
    };
  }, [user?.uid]);

  // Update account
  const updateAccount = useCallback(async (accountId, updates) => {
    try {
      console.log("💾 Updating account:", accountId, updates);
      const accountRef = doc(db, "accounts", accountId);
      await updateDoc(accountRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Account updated successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating account:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Create account
  const createAccount = useCallback(
    async (accountData) => {
      try {
        console.log("➕ Creating new account");
        const accountsRef = collection(db, "accounts");
        const newAccount = {
          ...accountData,
          customerUID: user.uid,
          userId: user.uid,
          userEmail: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(accountsRef, newAccount);
        console.log("✅ Account created with ID:", docRef.id);
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error("❌ Error creating account:", error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  // Delete account
  const deleteAccount = useCallback(async (accountId) => {
    try {
      console.log("🗑️ Deleting account:", accountId);
      const accountRef = doc(db, "accounts", accountId);
      await deleteDoc(accountRef);
      console.log("✅ Account deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get account by ID
  const getAccount = useCallback(
    (accountId) => {
      return accounts.find((acc) => acc.id === accountId);
    },
    [accounts]
  );

  // Get total balance across all accounts
  const getTotalBalance = useCallback(() => {
    return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [accounts]);

  const value = {
    accounts,
    loading,
    error,
    updateAccount,
    createAccount,
    deleteAccount,
    getAccount,
    getTotalBalance,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};
