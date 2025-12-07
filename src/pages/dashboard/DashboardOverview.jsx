import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBankData } from "../../context/BankDataContext";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";
import TransferModal from "../../components/TransferModal";
import WithdrawModal from "../../components/WithdrawModal";
import DepositModal from "../../components/DepositModal";
import ReceiveMoneyModal from "../../components/ReceiveMoneyModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import AccountCard from "../../components/dashboard/AccountCard";
import QuickActionsGrid from "../../components/dashboard/QuickActionsGrid";
import FinancialOverview from "../../components/dashboard/FinancialOverview";
import AccountBenefits from "../../components/dashboard/AccountBenefits";
import RecentActivity from "../../components/dashboard/RecentActivity";
import TransactionHistoryWidget from "../../components/dashboard/TransactionHistoryWidget";
import BankingInformation from "../../components/dashboard/BankingInformation";
import NotificationModal from "../../components/dashboard/NotificationModal";
import SecurityStatusWidget from "../../components/dashboard/SecurityStatusWidget";
import CreditScoreWidget from "../../components/dashboard/CreditScoreWidget";
import SpendingAnalyticsWidget from "../../components/dashboard/SpendingAnalyticsWidget";
import NotificationSystemWidget from "../../components/dashboard/NotificationSystemWidget";
import AccountManagementWidget from "../../components/dashboard/AccountManagementWidget";
import CardsServicesWidget from "../../components/dashboard/CardsServicesWidget";
import firestoreService from "../../services/firestoreService";
import {
  FaInfoCircle,
  FaFileAlt,
  FaCalculator,
  FaGlobe,
  FaMobile,
  FaShieldAlt,
  FaPhone,
  FaCreditCard,
  FaTimes,
  FaCopy,
  FaDownload,
  FaExchangeAlt,
} from "react-icons/fa";
import {
  MdHome,
  MdAnalytics,
  MdTrendingUp,
  MdPerson,
  MdAccountBalance,
  MdHistory,
} from "react-icons/md";
import {
  getBankingData,
  generateAccountNumber,
} from "../../utils/bankingUtils";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { emergencyMode } from "../../utils/emergencyMode";
import { withCircuitBreaker } from "../../utils/firebaseCircuitBreaker";

const DashboardOverview = () => {
  const { user, logout, userData } = useAuth();
  const { accounts: bankAccounts } = useBankData();
  const { settings } = useWebsiteSettings();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showBankingInfo, setShowBankingInfo] = useState(false);
  const [accountTypes, setAccountTypes] = useState([]);
  const [creatingAccounts, setCreatingAccounts] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(
    emergencyMode.isActive
  );
  const [emergencyAccounts, setEmergencyAccounts] = useState([]);
  const modalRef = useRef(null);

  // Prefer accounts from BankDataContext (collection-backed, realtime)
  // Fallback to embedded accounts in userData for backward compatibility
  const rawAccounts =
    bankAccounts && bankAccounts.length > 0
      ? bankAccounts
      : userData?.accounts || [];

  // Sort accounts: primary first, then by account type, then by balance descending
  const accounts = [...rawAccounts].sort((a, b) => {
    // Primary account always first
    if (a.accountType === "primary" && b.accountType !== "primary") return -1;
    if (b.accountType === "primary" && a.accountType !== "primary") return 1;

    // Then sort by account type alphabetically
    if (a.accountType !== b.accountType) {
      return a.accountType.localeCompare(b.accountType);
    }

    // Finally sort by balance (highest first)
    return (b.balance || 0) - (a.balance || 0);
  });

  const primaryAccount =
    accounts.find((acc) => acc.accountType === "primary") || accounts[0];
  const bankingData = getBankingData(primaryAccount, settings?.bankName);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (accounts?.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts]);

  // Initialize emergency mode listeners
  useEffect(() => {
    const handleEmergencyActivated = () => {
      setIsEmergencyMode(true);
      const mockAccounts = emergencyMode.getMockAccountData();
      setEmergencyAccounts(mockAccounts);
    };

    const handleEmergencyDeactivated = () => {
      setIsEmergencyMode(false);
      setEmergencyAccounts([]);
    };

    window.addEventListener("emergencyModeActivated", handleEmergencyActivated);
    window.addEventListener(
      "emergencyModeDeactivated",
      handleEmergencyDeactivated
    );

    // Check initial emergency mode state
    if (emergencyMode.isActive) {
      handleEmergencyActivated();
    }

    return () => {
      window.removeEventListener(
        "emergencyModeActivated",
        handleEmergencyActivated
      );
      window.removeEventListener(
        "emergencyModeDeactivated",
        handleEmergencyDeactivated
      );
    };
  }, []);

  // DISABLED: Balance update function to prevent Firebase quota exhaustion
  const updateJohnsonBalances = async () => {
    // Dynamic user check - no hardcoded UIDs
    if (!user?.uid || !user?.email) {
      return;
    }

    if (emergencyMode.isActive) {
      alert(
        "Balance updates are disabled during emergency mode. Please wait for Firebase connectivity to be restored."
      );
      return;
    }

    // Enhanced throttling - 10 minutes minimum between updates
    const lastUpdate = localStorage.getItem("lastBalanceUpdate");
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (lastUpdate && now - parseInt(lastUpdate) < tenMinutes) {
      const remainingTime = Math.ceil(
        (tenMinutes - (now - parseInt(lastUpdate))) / 1000
      );

      alert(
        `Please wait ${remainingTime} seconds before updating balances again.`
      );
      return;
    }

    console.log(
      "🏦 Starting Johnson Boseman balance update with circuit breaker protection..."
    );

    // More realistic balance amounts with varied digits
    const balanceUpdates = {
      johnson_checking: {
        balance: 2847293.67, // ~$2.85M - Checking with realistic cents
        availableBalance: 2847293.67,
      },
      johnson_primary: {
        balance: 743628491.82, // ~$743.6M - Primary investment with realistic decimals
        availableBalance: 743628491.82,
      },
      johnson_savings: {
        balance: 268794736.51, // ~$268.8M - Savings with realistic growth patterns
        availableBalance: 268794736.51,
      },
    };

    // Generate realistic transaction history that adds up to balances
    const generateTransactions = (accountId, currentBalance) => {
      const transactions = [];
      const baseDate = new Date("2018-01-01"); // Account since 2018
      let runningBalance = 0;

      // Generate initial deposits and transfers to build up to current balance
      const transactionTypes = [
        {
          type: "deposit",
          description: "Wire Transfer - Investment Income",
          amount: () => Math.random() * 5000000 + 50000,
        },
        {
          type: "deposit",
          description: "ACH Transfer - Business Revenue",
          amount: () => Math.random() * 2000000 + 25000,
        },
        {
          type: "deposit",
          description: "Direct Deposit - Salary",
          amount: () => Math.random() * 500000 + 75000,
        },
        {
          type: "deposit",
          description: "Investment Return",
          amount: () => Math.random() * 10000000 + 100000,
        },
        {
          type: "withdrawal",
          description: "Wire Transfer - Investment",
          amount: () => Math.random() * 1000000 + 10000,
        },
        {
          type: "withdrawal",
          description: "Payment - Real Estate",
          amount: () => Math.random() * 500000 + 5000,
        },
        {
          type: "transfer",
          description: "Internal Transfer",
          amount: () => Math.random() * 100000 + 1000,
        },
      ];

      // Build up balance over time with realistic transactions
      while (runningBalance < currentBalance * 0.95) {
        // Build to 95% of target
        const transType =
          transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = Math.min(
          transType.amount(),
          currentBalance - runningBalance
        );

        if (transType.type === "withdrawal" && amount > runningBalance)
          continue; // Skip if insufficient funds

        const transactionAmount =
          transType.type === "withdrawal" ? -amount : amount;
        runningBalance += transactionAmount;

        transactions.push({
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accountId,
          userId: user.uid,
          type: transType.type,
          amount: Math.abs(transactionAmount),
          description: transType.description,
          status: "completed",
          timestamp: new Date(
            baseDate.getTime() +
              Math.random() * (Date.now() - baseDate.getTime())
          ),
          balanceAfter: runningBalance,
        });
      }

      // Final adjustment transaction to reach exact balance
      const finalAdjustment = currentBalance - runningBalance;
      if (Math.abs(finalAdjustment) > 0.01) {
        transactions.push({
          id: `txn_${Date.now()}_final_${Math.random().toString(36).substr(2, 9)}`,
          accountId,
          userId: user.uid,
          type: finalAdjustment > 0 ? "deposit" : "withdrawal",
          amount: Math.abs(finalAdjustment),
          description:
            finalAdjustment > 0
              ? "Balance Adjustment - Portfolio Revaluation"
              : "Balance Adjustment - Fee",
          status: "completed",
          timestamp: new Date(),
          balanceAfter: currentBalance,
        });
      }

      return transactions.sort((a, b) => a.timestamp - b.timestamp);
    };

    try {
      console.log(
        "🏦 Updating account balances with throttling to prevent quota issues..."
      );

      // Process accounts one by one with delays to prevent quota exhaustion
      const accountEntries = Object.entries(balanceUpdates);

      for (let i = 0; i < accountEntries.length; i++) {
        const [accountId, balances] = accountEntries[i];

        try {
          console.log(
            `💰 Updating ${accountId} to $${balances.balance.toLocaleString()}`
          );

          // Update account balance with circuit breaker protection
          await withCircuitBreaker(async () => {
            const accountRef = doc(db, "accounts", accountId);
            return await updateDoc(accountRef, balances);
          }, `update-account-${accountId}`);

          // Add delay between updates to prevent quota issues
          if (i < accountEntries.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (updateError) {
          console.error(`❌ Error updating ${accountId}:`, updateError);
          // Continue with other accounts even if one fails
          continue;
        }

        try {
          // Generate and create matching transaction history with throttling

          const transactions = generateTransactions(
            accountId,
            balances.balance
          );

          // Limit transactions to prevent quota issues
          const recentTransactions = transactions.slice(-20); // Reduced from 50 to 20

          if (recentTransactions.length > 0) {
            let batch = writeBatch(db);
            let batchCount = 0;

            for (const transaction of recentTransactions) {
              if (batchCount >= 100) {
                // Reduced batch size from 400 to 100
                await batch.commit();
                // Add delay between batches
                await new Promise((resolve) => setTimeout(resolve, 500));
                batch = writeBatch(db);
                batchCount = 0;
              }

              const transactionRef = doc(collection(db, "transactions"));
              batch.set(transactionRef, transaction);
              batchCount++;
            }

            if (batchCount > 0) {
              await withCircuitBreaker(async () => {
                return await batch.commit();
              }, `commit-transactions-${accountId}`);
            }
          }

          console.log(
            `✅ ${accountId} updated with ${recentTransactions.length} transactions`
          );
        } catch (transactionError) {
          console.error(
            `❌ Error creating transactions for ${accountId}:`,
            transactionError
          );
          // Continue even if transaction creation fails
        }
      }

      // Store timestamp to prevent frequent updates
      localStorage.setItem("lastBalanceUpdate", now.toString());

      const totalBalance = Object.values(balanceUpdates).reduce(
        (sum, account) => sum + account.balance,
        0
      );
    } catch (error) {
      console.error("❌ Error updating balances and transactions:", error);

      // Handle specific Firebase errors
      if (
        error.code === "resource-exhausted" ||
        error.message?.includes("quota")
      ) {
        console.error(
          "🚫 Firebase quota exceeded. Please wait before trying again."
        );
        alert(
          "Firebase quota exceeded. Please wait a few minutes before updating balances again."
        );
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  // Make function globally available with throttling
  useEffect(() => {
    window.updateJohnsonBalances = updateJohnsonBalances;

    // Disable auto-execution to prevent quota exhaustion
    // Only run manually when needed
    if (process.env.NODE_ENV === "development") {
      console.log(
        "� Balance update function available: window.updateJohnsonBalances()"
      );
    }
  }, []); // Remove dependencies to prevent frequent re-runs

  // Fetch account types from Firebase
  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        const types = await firestoreService.getAccountTypes();

        // Add a fallback primary account type if not found in Firestore
        const hasPrimary = types.some((type) => type.category === "primary");
        if (!hasPrimary) {
          console.log(
            "🔄 Primary account type missing, creating it in Firebase..."
          );

          // Try to create the primary account type in Firebase
          try {
            const primaryAccountDoc = await firestoreService.create(
              "accountTypes",
              {
                active: true,
                benefits: [
                  "No minimum balance",
                  "Free online transfers",
                  "24/7 account access",
                  "Mobile banking",
                ],
                category: "primary",
                description:
                  "Primary checking account with comprehensive banking features and unlimited access",
                features: [
                  "Online Banking",
                  "Mobile Banking",
                  "Debit Card",
                  "ATM Access",
                  "Direct Deposit",
                ],
              }
            );

            console.log(
              "✅ Primary account type created in Firebase with ID:",
              primaryAccountDoc.id
            );

            // Add the created document to our types array
            types.unshift(primaryAccountDoc);
          } catch (createError) {
            console.warn(
              "⚠️ Could not create primary account type in Firebase:",
              createError.message
            );

            // Fall back to in-memory type
            types.unshift({
              id: "primary_fallback",
              active: true,
              benefits: [
                "No minimum balance",
                "Free online transfers",
                "24/7 account access",
                "Mobile banking",
              ],
              category: "primary",
              description:
                "Primary checking account with comprehensive banking features and unlimited access",
              features: [
                "Online Banking",
                "Mobile Banking",
                "Debit Card",
                "ATM Access",
                "Direct Deposit",
              ],
            });
          }
        }

        setAccountTypes(types);
        console.log(
          `Loaded ${types.length} account types:`,
          types.map((t) => t.category)
        );
      } catch (error) {
        console.error("Error fetching account types:", error);

        // Fallback to default account types if Firebase fails
        setAccountTypes([
          {
            id: "primary_fallback",
            active: true,
            benefits: [
              "No minimum balance",
              "Free online transfers",
              "24/7 account access",
              "Mobile banking",
            ],
            category: "primary",
            description:
              "Primary checking account with comprehensive banking features and unlimited access",
            features: [
              "Online Banking",
              "Mobile Banking",
              "Debit Card",
              "ATM Access",
              "Direct Deposit",
            ],
          },
          {
            id: "checking_fallback",
            active: true,
            benefits: [
              "No minimum balance",
              "Free online transfers",
              "24/7 account access",
            ],
            category: "deposit",
            description:
              "Everyday banking account with easy access to your money",
            features: ["Online Banking", "Mobile Banking", "Debit Card"],
          },
          {
            id: "savings_fallback",
            active: true,
            benefits: [
              "Competitive interest rates",
              "No monthly fees",
              "Online access",
            ],
            category: "savings",
            description: "Savings account to grow your money",
            features: ["Online Banking", "Mobile Banking"],
          },
        ]);
      }
    };

    fetchAccountTypes();
  }, []);

  // Create accounts based on account types if user has no accounts
  const createAccountsFromTypes = async () => {
    if (!user?.uid || accounts.length > 0 || creatingAccounts) return;

    setCreatingAccounts(true);
    try {
      // Create accounts for each account type
      const accountPromises = accountTypes
        .slice(0, 3)
        .map(async (accountType, index) => {
          const accountNumber = generateAccountNumber();
          const balances = [15750.5, 8250.75, 5000.0]; // Different balances for variety

          // Determine account type based on category
          let accountTypeName = "Account";
          if (accountType.category === "primary") {
            accountTypeName = "Primary Account";
          } else if (
            accountType.category === "deposit" ||
            accountType.description?.toLowerCase().includes("everyday")
          ) {
            accountTypeName = "Checking Account";
          } else if (
            accountType.category === "savings" ||
            accountType.description?.toLowerCase().includes("savings")
          ) {
            accountTypeName = "Savings Account";
          } else if (accountType.category === "credit") {
            accountTypeName = "Credit Account";
          }

          const accountData = {
            accountType: accountTypeName,
            type: accountTypeName,
            accountNumber: `****${accountNumber}`,
            fullAccountNumber: `${accountNumber}`, // Full number for admin use
            balance: balances[index] || 5000,
            previousBalance: 0, // For tracking balance changes
            isActive: true,
            status: "active", // For admin status management
            customerUID: user.uid,
            customerEmail: user.email || "customer@swiftbank.com", // For admin lookup
            accountHolder: user.displayName || "Account Holder",
            since: "2018",
            openedDate: new Date().toISOString(), // Account opening date
            lastActivity: new Date().toISOString(), // Last activity timestamp
            accountTypeId: accountType.id,
            benefits: accountType.benefits || [],
            features: accountType.features || [],
            description: accountType.description,
            category: accountType.category,
            currency: "USD", // Currency for international support
            interestRate: accountType.category === "savings" ? 0.025 : 0, // Interest rate for savings
            minimumBalance: accountType.category === "savings" ? 100 : 0, // Minimum balance requirement
            accountFeatures: {
              overdraftProtection: accountType.category === "primary",
              directDeposit: true,
              onlineBanking: true,
              mobileApp: true,
              atmAccess: true,
              checksEnabled: accountType.category !== "credit",
            },
            adminNotes: "", // Field for admin notes
            flags: [], // Array for admin flags/alerts
          };

          // Only add credit-specific fields for credit accounts
          if (accountType.category === "credit") {
            accountData.creditLimit = 5000;
            accountData.availableCredit = 5000 + (balances[index] || 0);
          }

          return await firestoreService.create("accounts", accountData);
        });

      await Promise.all(accountPromises);
      console.log("Accounts created successfully");

      // Refresh accounts by triggering auth context to reload
      window.location.reload();
    } catch (error) {
      console.error("Error creating accounts:", error);
    } finally {
      setCreatingAccounts(false);
    }
  };

  const openModal = (modalType, account = null) => {
    setActiveModal(modalType);
    if (account) setSelectedAccount(account);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAccount(null);
  };

  const handleCardService = (serviceName) => {
    // Handle card service actions
    console.log(`Card service clicked: ${serviceName}`);

    switch (serviceName) {
      case "Virtual Cards":
        // Future: Open virtual cards management modal
        alert("Virtual Cards management coming soon!");
        break;
      case "Debit Cards":
        // Future: Open debit cards management modal
        alert("Debit Cards management coming soon!");
        break;
      case "Manage Debit Card":
        // Future: Open card settings modal
        alert("Card management settings coming soon!");
        break;
      case "Travel Notification":
        // Future: Open travel notification modal
        alert("Travel notification setup coming soon!");
        break;
      case "Credit Card Repayment":
        // For now, redirect to transfer modal for credit account
        const creditAccount = (user?.accounts || []).find(
          (acc) => acc.accountType === "credit"
        );
        if (creditAccount) {
          openModal("transfer", creditAccount);
        } else {
          alert("No credit account found for repayment");
        }
        break;
      case "Prepaid Card TopUp":
        // Future: Open prepaid card top-up modal
        alert("Prepaid card top-up coming soon!");
        break;
      default:
        alert(`${serviceName} feature coming soon!`);
    }
  };

  // No longer needed - using static accounts

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <MdHome className="text-white text-3xl" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Preparing your financial overview...
          </p>
          <div className="flex justify-center space-x-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-8" style={{ scrollBehavior: "smooth" }}>
      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-xl shadow-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-1">
                Emergency Mode Active
              </h3>
              <p className="text-amber-700 text-sm mb-2">
                We're experiencing temporary connectivity issues with our live
                data service. Your account information is being displayed from
                our secure cache to ensure continuous access to your banking
                dashboard.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-amber-600">
                <span className="inline-flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  Cached Data Active
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Auto-Recovery Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section - Compact */}
      <div className="bg-gradient-to-r from-white/90 to-gray-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/40 p-4 sm:p-6 mb-6 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <MdHome className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1 font-display">
                  Welcome back,{" "}
                  {user?.firstName ||
                    user?.name?.split(" ")[0] ||
                    "Valued Customer"}
                  !
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-gray-600 font-medium text-sm font-sans">
                    Online Banking Active
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl font-sans">
              Your comprehensive financial dashboard is ready. Monitor your
              accounts, track spending patterns, and manage transactions with
              enterprise-grade security.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg font-medium text-sm font-sans cursor-pointer w-full sm:w-auto">
              <MdPerson className="text-base" />
              <span>Manage Profile</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/analytics")}
              className="flex items-center justify-center space-x-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md font-medium text-sm font-sans cursor-pointer w-full sm:w-auto">
              <MdAnalytics className="text-base" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Cards Section - Enhanced */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="hidden lg:flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <MdAccountBalance className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Your Accounts
              </h2>
              <p className="text-gray-600 text-sm">
                Manage and monitor your financial accounts
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Portfolio</p>
            <p className="text-2xl font-bold text-gray-800">
              {accounts.length > 0
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
                  )
                : "$0.00"}
            </p>
          </div>
        </div>
        {accounts.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              No Accounts Found
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any accounts yet. Create your first account to get
              started with {settings?.bankName || "Swift Bank"}.
            </p>
            <button
              onClick={createAccountsFromTypes}
              disabled={creatingAccounts || accountTypes.length === 0}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {creatingAccounts ? "Creating Accounts..." : "Create Accounts"}
            </button>
            {accountTypes.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Loading account types...
              </p>
            )}
          </div>
        ) : (
          <div
            className="account-cards-scroll flex overflow-x-auto overflow-y-hidden gap-4 sm:gap-6 py-4 snap-x snap-mandatory scroll-smooth"
            style={{
              width: "100%",
              scrollPaddingLeft: "0",
            }}>
            {(isEmergencyMode ? emergencyAccounts : accounts).map(
              (account, index) => {
                const totalAccounts = isEmergencyMode
                  ? emergencyAccounts.length
                  : accounts.length;
                const isFirst = index === 0;
                const isLast = index === totalAccounts - 1;

                return (
                  <div
                    key={account.id || index}
                    className={`flex-shrink-0 snap-start min-w-[280px] w-[290px] sm:min-w-[320px] sm:w-[350px] ${
                      isFirst ? "ml-3 sm:ml-4" : ""
                    } ${isLast ? "mr-3 sm:mr-4" : ""}`}>
                    <AccountCard
                      account={account}
                      isPrimary={account.accountType === "primary"}
                      onAction={(action) => openModal(action, account)}
                    />
                    {isEmergencyMode && account.mockData && (
                      <div className="mt-2 px-3 py-1 bg-amber-100 border border-amber-200 rounded text-xs text-amber-700">
                        ⚠️ Cached Data - Live data will resume when Firebase is
                        restored
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="mb-10">
        <div className="hidden lg:flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaExchangeAlt className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            <p className="text-gray-600 text-sm">
              Perform common banking operations instantly
            </p>
          </div>
        </div>
        <QuickActionsGrid onAction={openModal} />
      </div>

      {/* Financial Overview and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <div className="xl:col-span-2">
          <FinancialOverview accounts={accounts || []} />
        </div>
        <div className="space-y-6">
          <CreditScoreWidget />
          <SecurityStatusWidget />
        </div>
      </div>

      {/* Enhanced Widgets Grid */}
      <div className="mb-10">
        <div className="hidden lg:flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <MdAnalytics className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Financial Insights
            </h2>
            <p className="text-gray-600 text-sm">
              Advanced analytics and account management tools
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          <SpendingAnalyticsWidget />
          <NotificationSystemWidget />
          <AccountManagementWidget />
          <CardsServicesWidget onCardServiceClick={handleCardService} />
        </div>
      </div>

      {/* Transaction History and Recent Activity */}
      <div className="mb-10">
        <div className="hidden lg:flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <MdHistory className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Activity & History
            </h2>
            <p className="text-gray-600 text-sm">
              Monitor your transactions and account activity
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <TransactionHistoryWidget />
          <RecentActivity user={user} />
        </div>
      </div>

      {/* Account Benefits */}
      <AccountBenefits />

      {/* Modals */}
      {activeModal === "transfer" && (
        <TransferModal
          isOpen={true}
          onClose={closeModal}
          accounts={user?.accounts || []}
          selectedAccount={selectedAccount}
        />
      )}

      {activeModal === "withdraw" && (
        <WithdrawModal
          isOpen={true}
          onClose={closeModal}
          account={selectedAccount}
        />
      )}

      {activeModal === "deposit" && (
        <DepositModal
          isOpen={true}
          onClose={closeModal}
          account={selectedAccount}
        />
      )}

      {activeModal === "receive" && (
        <ReceiveMoneyModal
          isOpen={true}
          onClose={closeModal}
          account={selectedAccount}
        />
      )}

      {showNotification && (
        <NotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
        />
      )}

      {showBankingInfo && (
        <BankingInformation
          isOpen={showBankingInfo}
          onClose={() => setShowBankingInfo(false)}
          bankingData={bankingData}
        />
      )}
    </div>
  );
};

export default DashboardOverview;
