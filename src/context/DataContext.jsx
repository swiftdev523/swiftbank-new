import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { where, orderBy, limit } from "firebase/firestore";
import { ContextService } from "../services/contextService";
import firestoreService from "../services/firestoreService";
import { useAuth } from "./AuthContext";
import { AppError, handleError } from "../utils/errorUtils";

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listeners, setListeners] = useState(new Set());

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      listeners.forEach((listenerId) => {
        firestoreService.unsubscribe(listenerId);
      });
    };
  }, [listeners]);

  // Load user data when authenticated (reactive to AuthContext)
  const { user } = useAuth();
  useEffect(() => {
    if (user?.uid) {
      loadUserData(user.uid);
    } else {
      // Clear data when user logs out
      setAccounts([]);
      setTransactions([]);
      clearListeners();
    }
  }, [user?.uid]);

  const clearListeners = () => {
    listeners.forEach((listenerId) => {
      firestoreService.unsubscribe(listenerId);
    });
    setListeners(new Set());
  };

  const loadUserData = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load accounts via resilient path and user transactions
      const [userAccounts, userTransactions] = await Promise.allSettled([
        firestoreService.getAccountsForUser(userId).catch(() => []),
        firestoreService.getUserTransactions(userId).catch(() => []),
      ]).then((results) =>
        results.map((result) =>
          result.status === "fulfilled" ? result.value : []
        )
      );

      setAccounts(userAccounts || []);
      setTransactions(userTransactions);

      // Set up real-time listeners
      setupRealtimeListeners(userId);
    } catch (err) {
      // Silently set empty data if collections don't exist
      setAccounts([]);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListeners = (userId) => {
    try {
      // Listen to accounts by userId and customerUID separately and merge
      let merged = [];
      const handleMerge = (a1 = [], a2 = []) => {
        const map = new Map();
        [...a1, ...a2].forEach((a) => map.set(a.id, a));
        setAccounts(Array.from(map.values()));
      };

      const accountsByUserId = firestoreService.subscribeToCollection(
        "accounts",
        [where("userId", "==", userId)],
        (accountsData, error) => {
          if (error) return; // keep previous state
          merged = [accountsData || [], merged[1] || []];
          handleMerge(merged[0], merged[1]);
        }
      );

      const accountsByCustomerUid = firestoreService.subscribeToCollection(
        "accounts",
        [where("customerUID", "==", userId)],
        (accountsData, error) => {
          if (error) return; // keep previous state
          merged = [merged[0] || [], accountsData || []];
          handleMerge(merged[0], merged[1]);
        }
      );

      // Listen to transactions changes
      const transactionsListenerId = firestoreService.subscribeToCollection(
        "transactions",
        [
          where("userId", "==", userId),
          orderBy("timestamp", "desc"),
          limit(50),
        ],
        (transactionsData, error) => {
          if (error) {
            console.error("Transactions listener error:", error);
          } else if (transactionsData) {
            setTransactions(transactionsData);
          }
        }
      );

      setListeners(
        new Set([
          accountsByUserId,
          accountsByCustomerUid,
          transactionsListenerId,
        ])
      );
    } catch (err) {
      console.error("Error setting up real-time listeners:", err);
    }
  };

  // Account operations
  const addAccount = useCallback(async (accountData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.uid) {
        throw AppError.auth("User not authenticated");
      }

      const newAccount = await firestoreService.createAccount(
        user.uid,
        accountData
      );
      return newAccount;
    } catch (err) {
      const errorInfo = handleError(err, { action: "addAccount" });
      setError(errorInfo.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (accountId, updates) => {
    try {
      setIsLoading(true);
      setError(null);

      await firestoreService.update("accounts", accountId, updates);
      return true;
    } catch (err) {
      const errorInfo = handleError(err, {
        action: "updateAccount",
        accountId,
      });
      setError(errorInfo.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Transaction operations
  const addTransaction = useCallback(async (transactionData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.uid) {
        throw AppError.auth("User not authenticated");
      }

      // Add user ID to transaction data
      const transactionWithUser = {
        ...transactionData,
        userId: user.uid,
      };

      const newTransaction =
        await firestoreService.createTransaction(transactionWithUser);
      return newTransaction;
    } catch (err) {
      const errorInfo = handleError(err, { action: "addTransaction" });
      setError(errorInfo.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAccountTransactions = useCallback(
    (accountId) => {
      return transactions.filter(
        (t) => t.fromAccount === accountId || t.toAccount === accountId
      );
    },
    [transactions]
  );

  const getAccountBalance = useCallback(
    (accountId) => {
      const account = accounts.find((a) => a.id === accountId);
      return account ? account.balance : 0;
    },
    [accounts]
  );

  // Analytics
  const getTransactionAnalytics = useCallback(
    (accountId) => {
      const accountTransactions = getAccountTransactions(accountId);

      const deposits = accountTransactions.filter(
        (t) => t.toAccount === accountId && t.type === "deposit"
      );
      const withdrawals = accountTransactions.filter(
        (t) =>
          t.fromAccount === accountId &&
          (t.type === "withdrawal" || t.type === "transfer")
      );

      return {
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
        transactionCount: accountTransactions.length,
        recentTransactions: accountTransactions
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5),
        deposits: deposits.length,
        withdrawals: withdrawals.length,
      };
    },
    [getAccountTransactions]
  );

  // Refresh data
  const refreshData = useCallback(async () => {
    const user = authService.getCurrentUser();
    if (user) {
      await loadUserData(user.id);
    }
  }, []);

  const value = {
    // State
    accounts,
    transactions,
    isLoading,
    error,

    // Account operations
    addAccount,
    updateAccount,
    getAccountBalance,

    // Transaction operations
    addTransaction,
    getAccountTransactions,
    getTransactionAnalytics,

    // Data management
    loadUserData,
    refreshData,

    // Utilities
    formatCurrency: ContextService.formatCurrency,

    // Direct service access for advanced operations
    firestoreService,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
