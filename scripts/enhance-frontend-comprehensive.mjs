#!/usr/bin/env node
/**
 * Frontend Data Enhancement Script
 * Ensures all banking data displays properly with comprehensive fallback systems
 */

import fs from "fs";
import path from "path";

const srcPath = "src";

// Enhanced banking data with more comprehensive information
const enhancedDefaultData = {
  bankingServices: [
    {
      id: "mobile-banking",
      name: "Mobile Banking",
      description:
        "Access your accounts anytime, anywhere with our secure mobile app featuring biometric login and real-time notifications",
      category: "digital",
      features: [
        "Account access",
        "Mobile deposits",
        "Bill pay",
        "Transfers",
        "ATM locator",
        "Card controls",
        "Biometric login",
      ],
      isActive: true,
      icon: "mobile",
      priority: 1,
      fee: 0,
      requirements: ["Compatible smartphone", "Account in good standing"],
      benefits: [
        "24/7 access",
        "Real-time alerts",
        "Secure transactions",
        "Offline account viewing",
      ],
    },
    {
      id: "online-banking",
      name: "Online Banking",
      description:
        "Full-featured online banking platform with advanced portfolio management and comprehensive account tools",
      category: "digital",
      features: [
        "24/7 access",
        "Bill pay",
        "eStatements",
        "Account management",
        "Investment tracking",
        "Budget tools",
        "Alerts",
      ],
      isActive: true,
      icon: "computer",
      priority: 2,
      fee: 0,
      requirements: ["Internet access", "Valid email address"],
      benefits: [
        "Paperless statements",
        "Transaction history",
        "Financial planning tools",
        "Multi-account view",
      ],
    },
    {
      id: "wire-transfers",
      name: "Wire Transfers",
      description:
        "Fast and secure domestic and international wire transfers with same-day processing and tracking",
      category: "transfer",
      features: [
        "Same-day processing",
        "International transfers",
        "SWIFT network",
        "Transfer tracking",
        "Beneficiary management",
      ],
      isActive: true,
      icon: "transfer",
      priority: 3,
      fee: 25,
      requirements: ["Valid recipient information", "Sufficient funds"],
      benefits: [
        "Secure transmission",
        "Global reach",
        "Fast processing",
        "Confirmation receipts",
      ],
    },
    {
      id: "bill-pay",
      name: "Bill Pay Service",
      description:
        "Convenient automated bill payment service with scheduling, recurring payments, and payee management",
      category: "payment",
      features: [
        "Automatic payments",
        "Payment scheduling",
        "Payee management",
        "Payment history",
        "Due date reminders",
      ],
      isActive: true,
      icon: "bill",
      priority: 4,
      fee: 0,
      requirements: ["Active checking account", "Valid payee information"],
      benefits: [
        "Never miss payments",
        "Save time",
        "Reduce late fees",
        "Eco-friendly",
      ],
    },
    {
      id: "card-services",
      name: "Card Services",
      description:
        "Comprehensive debit and credit card management with fraud protection and instant controls",
      category: "cards",
      features: [
        "Card controls",
        "Replace cards",
        "PIN management",
        "Transaction alerts",
        "Fraud protection",
        "Spending limits",
      ],
      isActive: true,
      icon: "card",
      priority: 5,
      fee: 0,
      requirements: ["Valid account", "Identity verification"],
      benefits: [
        "Enhanced security",
        "Instant notifications",
        "Emergency replacement",
        "Spending insights",
      ],
    },
    {
      id: "customer-support",
      name: "24/7 Customer Support",
      description:
        "Round-the-clock customer service with multiple contact options and specialized support teams",
      category: "support",
      features: [
        "24/7 availability",
        "Multiple channels",
        "Specialized teams",
        "Live chat",
        "Phone support",
        "Email support",
      ],
      isActive: true,
      icon: "support",
      priority: 6,
      fee: 0,
      requirements: ["Account verification"],
      benefits: [
        "Always available",
        "Expert assistance",
        "Multiple languages",
        "Quick resolution",
      ],
    },
  ],

  bankingProducts: [
    {
      id: "checking-premium",
      name: "Premium Checking Account",
      description:
        "Feature-rich checking account designed for everyday banking with premium benefits and no monthly fees",
      category: "deposit",
      minimumBalance: 1000,
      monthlyFee: 0,
      interestRate: 0.05,
      features: [
        "No minimum balance fee",
        "Free online banking",
        "Mobile deposit",
        "Bill pay",
        "ATM fee refunds",
        "Overdraft protection",
      ],
      benefits: [
        "FDIC insured up to $250,000",
        "24/7 customer service",
        "Free checks",
        "Worldwide ATM access",
      ],
      isActive: true,
      targetAudience: "general",
      accountType: "checking",
      promotionalRate: null,
      requirements: ["$1,000 minimum opening deposit", "Valid identification"],
    },
    {
      id: "savings-high-yield",
      name: "High-Yield Savings Account",
      description:
        "Competitive interest rates to help your money grow faster with easy access and no monthly maintenance fees",
      category: "deposit",
      minimumBalance: 500,
      monthlyFee: 0,
      interestRate: 2.5,
      features: [
        "High interest rate",
        "No monthly fees",
        "Online access",
        "Mobile banking",
        "Automatic transfers",
      ],
      benefits: [
        "FDIC insured",
        "Compound interest",
        "Easy transfers",
        "No withdrawal limits",
        "Goal tracking",
      ],
      isActive: true,
      targetAudience: "savers",
      accountType: "savings",
      promotionalRate: 3.0,
      requirements: ["$500 minimum opening deposit"],
    },
    {
      id: "business-checking",
      name: "Business Checking Account",
      description:
        "Professional banking solutions designed specifically for small to medium businesses with advanced cash management",
      category: "business",
      minimumBalance: 2500,
      monthlyFee: 15,
      interestRate: 0.1,
      features: [
        "Business banking tools",
        "Cash management",
        "ACH services",
        "Multiple users",
        "Business debit cards",
      ],
      benefits: [
        "Dedicated business support",
        "Merchant services",
        "Payroll services",
        "Business loan access",
        "Tax preparation",
      ],
      isActive: true,
      targetAudience: "business",
      accountType: "checking",
      promotionalRate: null,
      requirements: [
        "Business license",
        "EIN number",
        "$2,500 minimum deposit",
      ],
    },
    {
      id: "cd-12month",
      name: "12-Month Certificate of Deposit",
      description:
        "Secure investment option with guaranteed returns and flexible renewal options for conservative investors",
      category: "investment",
      minimumBalance: 1000,
      monthlyFee: 0,
      interestRate: 3.25,
      features: [
        "Fixed interest rate",
        "FDIC insured",
        "Automatic renewal options",
        "Early withdrawal options",
      ],
      benefits: [
        "Guaranteed returns",
        "Various term lengths",
        "Penalty-free withdrawals after maturity",
        "Interest compounding",
      ],
      isActive: true,
      targetAudience: "investors",
      accountType: "cd",
      promotionalRate: 3.5,
      requirements: ["$1,000 minimum deposit", "12-month commitment"],
    },
    {
      id: "money-market",
      name: "Money Market Account",
      description:
        "High-yield account combining savings benefits with checking account accessibility and tiered interest rates",
      category: "deposit",
      minimumBalance: 2500,
      monthlyFee: 0,
      interestRate: 2.25,
      features: [
        "Tiered interest rates",
        "Check writing",
        "Debit card access",
        "Limited transactions",
        "Online banking",
      ],
      benefits: [
        "Higher interest than regular savings",
        "Check writing privileges",
        "Debit card access",
        "FDIC insured",
      ],
      isActive: true,
      targetAudience: "savers",
      accountType: "money-market",
      promotionalRate: 2.75,
      requirements: [
        "$2,500 minimum balance",
        "Maximum 6 withdrawals per month",
      ],
    },
    {
      id: "student-checking",
      name: "Student Checking Account",
      description:
        "Fee-free checking account designed for students with educational resources and financial literacy tools",
      category: "student",
      minimumBalance: 0,
      monthlyFee: 0,
      interestRate: 0.01,
      features: [
        "No monthly fees",
        "No minimum balance",
        "Mobile banking",
        "Financial education",
        "Budgeting tools",
      ],
      benefits: [
        "Free for students",
        "Financial literacy resources",
        "No overdraft fees",
        "Easy account management",
      ],
      isActive: true,
      targetAudience: "students",
      accountType: "checking",
      promotionalRate: null,
      requirements: [
        "Valid student ID",
        "Age 16-25",
        "School enrollment verification",
      ],
    },
  ],

  accountTypes: [
    {
      id: "checking",
      name: "Checking Account",
      category: "deposit",
      description:
        "Primary transaction account for daily banking needs with unlimited transactions",
      features: [
        "Debit card",
        "Check writing",
        "Online banking",
        "Bill pay",
        "Direct deposit",
      ],
      isActive: true,
      minimumAge: 18,
      documentation: [
        "Government ID",
        "Social Security number",
        "Proof of address",
      ],
    },
    {
      id: "savings",
      name: "Savings Account",
      category: "deposit",
      description:
        "Interest-bearing account designed for saving money with competitive rates",
      features: [
        "Interest earning",
        "Online access",
        "Automatic transfers",
        "Goal tracking",
      ],
      isActive: true,
      minimumAge: 18,
      documentation: ["Government ID", "Social Security number"],
    },
    {
      id: "business",
      name: "Business Account",
      category: "business",
      description:
        "Professional accounts designed for business banking needs with commercial features",
      features: [
        "Business tools",
        "Multiple users",
        "Cash management",
        "Merchant services",
      ],
      isActive: true,
      minimumAge: 18,
      documentation: [
        "Business license",
        "EIN",
        "Articles of incorporation",
        "Government ID",
      ],
    },
    {
      id: "cd",
      name: "Certificate of Deposit",
      category: "investment",
      description:
        "Fixed-term investment with guaranteed returns and various maturity options",
      features: [
        "Fixed rate",
        "Term options",
        "FDIC insured",
        "Automatic renewal",
      ],
      isActive: true,
      minimumAge: 18,
      documentation: [
        "Government ID",
        "Social Security number",
        "Funding source",
      ],
    },
    {
      id: "money-market",
      name: "Money Market Account",
      category: "deposit",
      description:
        "High-yield account with limited transaction privileges and tiered interest rates",
      features: [
        "Tiered rates",
        "Check writing",
        "Debit card",
        "Limited transactions",
      ],
      isActive: true,
      minimumAge: 18,
      documentation: [
        "Government ID",
        "Social Security number",
        "Minimum deposit",
      ],
    },
    {
      id: "student",
      name: "Student Account",
      category: "student",
      description:
        "Special accounts for students with reduced fees and educational benefits",
      features: [
        "No fees",
        "Educational resources",
        "Budgeting tools",
        "Mobile banking",
      ],
      isActive: true,
      minimumAge: 16,
      documentation: [
        "Government ID",
        "Student ID",
        "School enrollment verification",
      ],
    },
  ],

  bankSettings: {
    id: "main-settings",
    bankName: "CL Bank",
    bankFullName: "CL Banking Corporation",
    bankCode: "CLBANK",
    routingNumber: "021000021",
    swiftCode: "CLBKUS33",
    currency: "USD",
    timezone: "America/New_York",
    businessHours: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed",
    },
    contactInfo: {
      phone: "1-800-CL-BANK",
      email: "support@clbank.com",
      website: "https://clbank.com",
      address: "123 Banking Street, Financial District, NY 10001",
    },
    features: {
      mobileApp: true,
      onlineBanking: true,
      billPay: true,
      mobileDeposit: true,
      cardManagement: true,
      wireTransfers: true,
      investmentServices: true,
      businessBanking: true,
    },
    limits: {
      dailyTransferLimit: 10000,
      dailyWithdrawalLimit: 1000,
      monthlyTransferLimit: 50000,
      mobileDepositLimit: 5000,
      billPayLimit: 25000,
    },
    fees: {
      overdraftFee: 35,
      insufficientFundsFee: 35,
      foreignTransactionFee: 3.0,
      wireTransferDomestic: 25,
      wireTransferInternational: 45,
      cashierCheckFee: 10,
    },
    security: {
      fdic_insured: true,
      encryption: "AES-256",
      two_factor_auth: true,
      fraud_monitoring: true,
      identity_protection: true,
    },
  },
};

// Enhanced BankDataContext with better error handling and more comprehensive fallback
const enhancedBankDataContext = `import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { where, orderBy, limit, onSnapshot } from "firebase/firestore";
import firestoreService from "../services/firestoreService";
import { useAuth } from "./AuthContext";
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
  const { user } = useAuth();
  
  // Banking data state
  const [bankingServices, setBankingServices] = useState([]);
  const [bankingProducts, setBankingProducts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [bankSettings, setBankSettings] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  
  // Loading states
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
    services: 'loading',
    products: 'loading',
    accountTypes: 'loading',
    settings: 'loading'
  });

  // Helper function to safely fetch data with fallback
  const fetchDataWithFallback = useCallback(async (fetchFunction, fallbackData, dataKey) => {
    try {
      console.log(\`🔄 Fetching \${dataKey}...\`);
      const data = await fetchFunction();
      
      if (data && data.length > 0) {
        console.log(\`✅ Loaded \${data.length} \${dataKey} from Firebase\`);
        setDataSource(prev => ({ ...prev, [dataKey]: 'firebase' }));
        return data;
      } else {
        console.log(\`⚠️  No \${dataKey} found in Firebase, using fallback data\`);
        setDataSource(prev => ({ ...prev, [dataKey]: 'fallback' }));
        return fallbackData;
      }
    } catch (error) {
      console.log(\`❌ Error fetching \${dataKey}, using fallback:\`, error.message);
      setDataSource(prev => ({ ...prev, [dataKey]: 'fallback' }));
      return fallbackData;
    }
  }, []);

  // Load banking services
  const loadBankingServices = useCallback(async () => {
    try {
      const services = await fetchDataWithFallback(
        () => firestoreService.getBankingServices(),
        defaultBankData.bankingServices,
        'services'
      );
      setBankingServices(services);
    } catch (error) {
      console.error("Error loading banking services:", error);
      setErrors(prev => ({ ...prev, services: error.message }));
      setBankingServices(defaultBankData.bankingServices);
      setDataSource(prev => ({ ...prev, services: 'fallback' }));
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, [fetchDataWithFallback]);

  // Load banking products
  const loadBankingProducts = useCallback(async () => {
    try {
      const products = await fetchDataWithFallback(
        () => firestoreService.getBankingProducts(),
        defaultBankData.bankingProducts,
        'products'
      );
      setBankingProducts(products);
    } catch (error) {
      console.error("Error loading banking products:", error);
      setErrors(prev => ({ ...prev, products: error.message }));
      setBankingProducts(defaultBankData.bankingProducts);
      setDataSource(prev => ({ ...prev, products: 'fallback' }));
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, [fetchDataWithFallback]);

  // Load account types
  const loadAccountTypes = useCallback(async () => {
    try {
      const types = await fetchDataWithFallback(
        () => firestoreService.getAccountTypes(),
        defaultBankData.accountTypes,
        'accountTypes'
      );
      setAccountTypes(types);
    } catch (error) {
      console.error("Error loading account types:", error);
      setErrors(prev => ({ ...prev, accountTypes: error.message }));
      setAccountTypes(defaultBankData.accountTypes);
      setDataSource(prev => ({ ...prev, accountTypes: 'fallback' }));
    } finally {
      setLoading(prev => ({ ...prev, accountTypes: false }));
    }
  }, [fetchDataWithFallback]);

  // Load bank settings
  const loadBankSettings = useCallback(async () => {
    try {
      const settings = await fetchDataWithFallback(
        () => firestoreService.getBankSettings(),
        defaultBankData.bankSettings,
        'settings'
      );
      setBankSettings(settings);
    } catch (error) {
      console.error("Error loading bank settings:", error);
      setErrors(prev => ({ ...prev, settings: error.message }));
      setBankSettings(defaultBankData.bankSettings);
      setDataSource(prev => ({ ...prev, settings: 'fallback' }));
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  }, [fetchDataWithFallback]);

  // Load announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      const announcements = await firestoreService.getAnnouncements();
      setAnnouncements(announcements || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      setErrors(prev => ({ ...prev, announcements: error.message }));
      setAnnouncements([]);
    } finally {
      setLoading(prev => ({ ...prev, announcements: false }));
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
  const getServiceById = useCallback((serviceId) => {
    return bankingServices.find(service => service.id === serviceId);
  }, [bankingServices]);

  // Get product by ID
  const getProductById = useCallback((productId) => {
    return bankingProducts.find(product => product.id === productId);
  }, [bankingProducts]);

  // Get products by category
  const getProductsByCategory = useCallback((category) => {
    return bankingProducts.filter(product => product.category === category);
  }, [bankingProducts]);

  // Get services by category
  const getServicesByCategory = useCallback((category) => {
    return bankingServices.filter(service => service.category === category);
  }, [bankingServices]);

  // Check if all data is loaded
  const isDataLoaded = !Object.values(loading).some(isLoading => isLoading);
  
  // Check if any data source is fallback
  const usingFallbackData = Object.values(dataSource).some(source => source === 'fallback');

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
        console.log("⚠️  Some data is using fallback - this is normal if Firebase collections are empty");
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
    
    // Loading states
    loading,
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
`;

async function updateDefaultDataFile() {
  const defaultDataPath = path.join(srcPath, "utils", "defaultBankData.js");

  const content = `/**
 * Default Banking Data
 * Comprehensive fallback data for when Firebase collections are empty or inaccessible
 */

export const defaultBankData = ${JSON.stringify(enhancedDefaultData, null, 2)};

// Helper functions for accessing default data
export const getDefaultBankingServices = () => defaultBankData.bankingServices;
export const getDefaultBankingProducts = () => defaultBankData.bankingProducts;
export const getDefaultAccountTypes = () => defaultBankData.accountTypes;
export const getDefaultBankSettings = () => defaultBankData.bankSettings;

// Category filters
export const getServicesByCategory = (category) => 
  defaultBankData.bankingServices.filter(service => service.category === category);

export const getProductsByCategory = (category) => 
  defaultBankData.bankingProducts.filter(product => product.category === category);

// Product type filters
export const getProductsByType = (accountType) => 
  defaultBankData.bankingProducts.filter(product => product.accountType === accountType);

// Fee information
export const getServiceFees = () => 
  defaultBankData.bankingServices.reduce((acc, service) => {
    acc[service.id] = service.fee || 0;
    return acc;
  }, {});

export default defaultBankData;
`;

  // Ensure directory exists
  const utilsDir = path.join(srcPath, "utils");
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }

  fs.writeFileSync(defaultDataPath, content);
  console.log("✅ Updated defaultBankData.js with enhanced data");
}

async function updateBankDataContext() {
  const contextPath = path.join(srcPath, "context", "BankDataContext.jsx");

  fs.writeFileSync(contextPath, enhancedBankDataContext);
  console.log("✅ Updated BankDataContext.jsx with enhanced fallback handling");
}

async function createDataValidationComponent() {
  const componentPath = path.join(
    srcPath,
    "components",
    "admin",
    "DataStatusPanel.jsx"
  );

  const content = `import React from 'react';
import { useBankData } from '../../context/BankDataContext';

const DataStatusPanel = () => {
  const { 
    dataSource, 
    usingFallbackData, 
    loading, 
    errors, 
    isDataLoaded,
    bankingServices,
    bankingProducts,
    accountTypes,
    bankSettings
  } = useBankData();

  const getStatusIcon = (source) => {
    switch (source) {
      case 'firebase': return '🔥';
      case 'fallback': return '💾';
      case 'loading': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (source) => {
    switch (source) {
      case 'firebase': return 'text-green-600';
      case 'fallback': return 'text-yellow-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Data Status</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading banking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Data Status Panel</h3>
      
      {usingFallbackData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            ⚠️ Some data is using fallback mode. This is normal if Firebase collections are empty or inaccessible.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Banking Services</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.services)}>
              {getStatusIcon(dataSource.services)} {dataSource.services}
            </span>
            <span className="text-gray-500">({bankingServices.length} items)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Banking Products</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.products)}>
              {getStatusIcon(dataSource.products)} {dataSource.products}
            </span>
            <span className="text-gray-500">({bankingProducts.length} items)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Account Types</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.accountTypes)}>
              {getStatusIcon(dataSource.accountTypes)} {dataSource.accountTypes}
            </span>
            <span className="text-gray-500">({accountTypes.length} items)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Bank Settings</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.settings)}>
              {getStatusIcon(dataSource.settings)} {dataSource.settings}
            </span>
            <span className="text-gray-500">({Object.keys(bankSettings).length} settings)</span>
          </div>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-red-800 font-medium mb-2">Errors:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>• {key}: {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>🔥 Firebase: Data loaded from Firebase</p>
        <p>💾 Fallback: Using default/cached data</p>
        <p>⏳ Loading: Data being fetched</p>
      </div>
    </div>
  );
};

export default DataStatusPanel;
`;

  // Ensure directory exists
  const adminDir = path.join(srcPath, "components", "admin");
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }

  fs.writeFileSync(componentPath, content);
  console.log(
    "✅ Created DataStatusPanel.jsx component for data source monitoring"
  );
}

async function main() {
  console.log("🚀 Enhancing Frontend Data Systems");
  console.log("=".repeat(50));

  try {
    // Update default data with enhanced information
    await updateDefaultDataFile();

    // Update BankDataContext with better fallback handling
    await updateBankDataContext();

    // Create data status monitoring component
    await createDataValidationComponent();

    console.log("\\n🎉 Frontend Enhancement Complete!");
    console.log("\\nEnhancements made:");
    console.log(
      "✅ Enhanced defaultBankData.js with comprehensive banking information"
    );
    console.log(
      "✅ Updated BankDataContext.jsx with improved fallback handling"
    );
    console.log("✅ Created DataStatusPanel.jsx for monitoring data sources");
    console.log("\\n🔗 Next steps:");
    console.log("1. Start the application: npm run dev");
    console.log("2. Check that all banking data displays properly");
    console.log("3. Use DataStatusPanel to monitor data source status");
    console.log("4. Test user registration and account features");
  } catch (error) {
    console.error("❌ Error during enhancement:", error.message);
  }
}

main().catch(console.error);
