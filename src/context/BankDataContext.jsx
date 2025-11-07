import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { where, orderBy, limit, onSnapshot } from "firebase/firestore";
import firestoreService from "../services/firestoreService";
import { useAuth } from "./AuthContext";
import { useAccounts } from "./AccountsContext";
import { useTransactions } from "./TransactionsContext";
import { AppError, handleError } from "../utils/errorUtils";
import { defaultBankData } from "../utils/defaultBankData";

const BankDataContext = createContext();

export const useBankData = () => {
  const context = useContext(BankDataContext);
  if (!context) {
    throw new Error("useBankData must be used within a BankDataProvider");
  }
  return context;
};

export const BankDataProvider = ({ children }) => {
  const { user, userData } = useAuth();

  // Get accounts and transactions from their dedicated real-time contexts
  const { accounts, loading: accountsLoading } = useAccounts();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // Banking data state
  const [bankingServices, setBankingServices] = useState([]);
  const [bankingProducts, setBankingProducts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [bankSettings, setBankSettings] = useState({});
  const [announcements, setAnnouncements] = useState([]); // Loading states
  const [loading, setLoading] = useState({
    services: true,
    products: true,
    accountTypes: true,
    settings: true,
    announcements: true,
  });

  // Error states
  const [errors, setErrors] = useState({});

  // Data fetching flags
  const [dataSource, setDataSource] = useState({
    services: "loading",
    products: "loading",
    accountTypes: "loading",
    settings: "loading",
  });

  // Helper function to safely fetch data with fallback
  const fetchDataWithFallback = useCallback(
    async (fetchFunction, fallbackData, dataKey) => {
      try {
        console.log(`🔄 Fetching ${dataKey}...`);
        const data = await fetchFunction();

        if (data && data.length > 0) {
          console.log(`✅ Loaded ${data.length} ${dataKey} from Firebase`);
          setDataSource((prev) => ({ ...prev, [dataKey]: "firebase" }));
          return data;
        } else {
          console.log(
            `⚠️  No ${dataKey} found in Firebase, using fallback data`
          );
          setDataSource((prev) => ({ ...prev, [dataKey]: "fallback" }));
          return fallbackData;
        }
      } catch (error) {
        console.log(
          `❌ Error fetching ${dataKey}, using fallback:`,
          error.message
        );
        setDataSource((prev) => ({ ...prev, [dataKey]: "fallback" }));
        return fallbackData;
      }
    },
    []
  );

  // Load banking services
  const loadBankingServices = useCallback(async () => {
    try {
      const services = await fetchDataWithFallback(
        () => firestoreService.getBankingServices(),
        defaultBankData.bankingServices,
        "services"
      );
      setBankingServices(services);
    } catch (error) {
      console.error("Error loading banking services:", error);
      setErrors((prev) => ({ ...prev, services: error.message }));
      setBankingServices(defaultBankData.bankingServices);
      setDataSource((prev) => ({ ...prev, services: "fallback" }));
    } finally {
      setLoading((prev) => ({ ...prev, services: false }));
    }
  }, [fetchDataWithFallback]);

  // Load banking products
  const loadBankingProducts = useCallback(async () => {
    try {
      const products = await fetchDataWithFallback(
        () => firestoreService.getBankingProducts(),
        defaultBankData.bankingProducts,
        "products"
      );
      setBankingProducts(products);
    } catch (error) {
      console.error("Error loading banking products:", error);
      setErrors((prev) => ({ ...prev, products: error.message }));
      setBankingProducts(defaultBankData.bankingProducts);
      setDataSource((prev) => ({ ...prev, products: "fallback" }));
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  }, [fetchDataWithFallback]);

  // Load account types
  const loadAccountTypes = useCallback(async () => {
    try {
      const types = await fetchDataWithFallback(
        () => firestoreService.getAccountTypes(),
        defaultBankData.accountTypes,
        "accountTypes"
      );
      setAccountTypes(types);
    } catch (error) {
      console.error("Error loading account types:", error);
      setErrors((prev) => ({ ...prev, accountTypes: error.message }));
      setAccountTypes(defaultBankData.accountTypes);
      setDataSource((prev) => ({ ...prev, accountTypes: "fallback" }));
    } finally {
      setLoading((prev) => ({ ...prev, accountTypes: false }));
    }
  }, [fetchDataWithFallback]);

  // Load bank settings
  const loadBankSettings = useCallback(async () => {
    try {
      const settings = await fetchDataWithFallback(
        () => firestoreService.getBankSettings(),
        defaultBankData.bankSettings,
        "settings"
      );
      setBankSettings(settings);
    } catch (error) {
      console.error("Error loading bank settings:", error);
      setErrors((prev) => ({ ...prev, settings: error.message }));
      setBankSettings(defaultBankData.bankSettings);
      setDataSource((prev) => ({ ...prev, settings: "fallback" }));
    } finally {
      setLoading((prev) => ({ ...prev, settings: false }));
    }
  }, [fetchDataWithFallback]);

  // Load announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      const announcements = await firestoreService.getAnnouncements();
      setAnnouncements(announcements || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      setErrors((prev) => ({ ...prev, announcements: error.message }));
      setAnnouncements([]);
    } finally {
      setLoading((prev) => ({ ...prev, announcements: false }));
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading({
      services: true,
      products: true,
      accountTypes: true,
      settings: true,
      announcements: true,
    });
    setErrors({});

    await Promise.all([
      loadBankingServices(),
      loadBankingProducts(),
      loadAccountTypes(),
      loadBankSettings(),
      loadAnnouncements(),
    ]);
  }, [
    loadBankingServices,
    loadBankingProducts,
    loadAccountTypes,
    loadBankSettings,
    loadAnnouncements,
  ]);

  // Get service by ID
  const getServiceById = useCallback(
    (serviceId) => {
      return bankingServices.find((service) => service.id === serviceId);
    },
    [bankingServices]
  );

  // Get product by ID
  const getProductById = useCallback(
    (productId) => {
      return bankingProducts.find((product) => product.id === productId);
    },
    [bankingProducts]
  );

  // Get products by category
  const getProductsByCategory = useCallback(
    (category) => {
      return bankingProducts.filter((product) => product.category === category);
    },
    [bankingProducts]
  );

  // Get services by category
  const getServicesByCategory = useCallback(
    (category) => {
      return bankingServices.filter((service) => service.category === category);
    },
    [bankingServices]
  );

  // Check if all data is loaded
  const isDataLoaded = !Object.values(loading).some((isLoading) => isLoading);

  // Check if any data source is fallback
  const usingFallbackData = Object.values(dataSource).some(
    (source) => source === "fallback"
  );

  // Initial data load
  useEffect(() => {
    console.log("🚀 BankDataProvider: Loading initial data...");
    refreshData();
  }, [refreshData]);

  // Log data source information
  useEffect(() => {
    if (isDataLoaded) {
      console.log("📊 Data Source Summary:", dataSource);
      if (usingFallbackData) {
        console.log(
          "⚠️  Some data is using fallback - this is normal if Firebase collections are empty"
        );
      } else {
        console.log("✅ All data loaded from Firebase successfully");
      }
    }
  }, [isDataLoaded, dataSource, usingFallbackData]);

  const value = {
    // Data
    bankingServices,
    bankingProducts,
    accountTypes,
    bankSettings,
    announcements,
    accounts, // Real-time accounts from AccountsContext
    transactions, // Real-time transactions from TransactionsContext

    // Loading states
    loading: {
      ...loading,
      accounts: accountsLoading,
      transactions: transactionsLoading,
    },
    isDataLoaded,

    // Error states
    errors,

    // Data source info
    dataSource,
    usingFallbackData,

    // Utilities
    refreshData,
    getServiceById,
    getProductById,
    getProductsByCategory,
    getServicesByCategory,
  };
  return (
    <BankDataContext.Provider value={value}>
      {children}
    </BankDataContext.Provider>
  );
};

export { BankDataContext };
