import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import TransferModal from "../components/TransferModal";
import WithdrawModal from "../components/WithdrawModal";
import DepositModal from "../components/DepositModal";
import ReceiveMoneyModal from "../components/ReceiveMoneyModal";
import LoadingSpinner from "../components/LoadingSpinner";
import AccountCard from "../components/dashboard/AccountCard";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";
import FinancialOverview from "../components/dashboard/FinancialOverview";
import AccountBenefits from "../components/dashboard/AccountBenefits";
import RecentActivity from "../components/dashboard/RecentActivity";
import TransactionHistoryWidget from "../components/dashboard/TransactionHistoryWidget";
import MobileNavigation from "../components/dashboard/MobileNavigation";
import BankingInformation from "../components/dashboard/BankingInformation";
import NotificationModal from "../components/dashboard/NotificationModal";
import SecurityStatusWidget from "../components/dashboard/SecurityStatusWidget";
import CreditScoreWidget from "../components/dashboard/CreditScoreWidget";
import SpendingAnalyticsWidget from "../components/dashboard/SpendingAnalyticsWidget";
import NotificationSystemWidget from "../components/dashboard/NotificationSystemWidget";
import AccountManagementWidget from "../components/dashboard/AccountManagementWidget";

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
} from "react-icons/fa";
import {
  MdHome,
  MdAnalytics,
  MdTrendingUp,
  MdPerson,
  MdAccountBalance,
} from "react-icons/md";
import clbg1 from "../assets/images/clbg1.jpg";
import { getBankingData, getMockStatements } from "../utils/bankingUtils";

const DashboardPage = () => {
  const { user, logout: _logout } = useAuth();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [notification, setNotification] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showNotification = (
    title,
    message,
    type = "info",
    icon = FaInfoCircle
  ) => {
    setNotification({
      title,
      message,
      type,
      icon,
      id: Date.now(), // Simple ID for uniqueness
    });

    // Auto-close after 8 seconds for non-critical notifications
    if (type !== "error") {
      setTimeout(() => {
        setNotification(null);
      }, 8000);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleQuickAction = (action) => {
    setShowAccountDropdown(false); // Close dropdown when opening modals
    setActiveModal(action);
  };

  const handleMobileNavigation = (tabName) => {
    const navigationActions = {
      Home: () => {
        navigate("/");
      },
      Cards: () => {
        showNotification(
          "Card Services",
          "No cards have been added yet. Visit any of our Swift Bank branches to get your premium card and enjoy exclusive benefits.",
          "info",
          MdAccountBalance
        );
      },
      Profile: () => {
        navigate("/profile");
      },
    };

    if (navigationActions[tabName]) {
      navigationActions[tabName]();
    }
  };
  // Banking service actions
  const handleBankingService = (action) => {
    const serviceInfo = {
      "account-details": {
        title: "Account Details",
        message: `Routing Number: ${
          bankingDetails.routingNumber
        }\nAccount Type: ${
          bankingDetails.accountType
        }\nFDIC Insured: Up to $${bankingDetails.fdicLimit.toLocaleString()}\nDaily Withdrawal Limit: $${bankingDetails.dailyWithdrawalLimit.toLocaleString()}\nCustomer Service: ${
          bankingDetails.customerService
        }`,
        icon: FaInfoCircle,
        type: "info",
      },
      statements: {
        title: "E-Statements",
        message:
          "E-Statements are available in your account portal. You can view and download up to 7 years of statements. Would you like to access your statements?",
        icon: FaFileAlt,
        type: "info",
      },
      "bill-pay": {
        title: "Bill Pay Service",
        message:
          "Bill Pay service allows you to pay bills directly from your account. Set up one-time or recurring payments to over 20,000 billers nationwide. This service is free with your Premium account.",
        icon: FaCalculator,
        type: "info",
      },
      "wire-transfer": {
        title: "Wire Transfer Services",
        message: `Domestic Wires: Same-day processing\nInternational Wires: 1-2 business days\nSWIFT Code: ${bankingDetails.swiftCode}\nFees may apply. Contact customer service for details.`,
        icon: FaGlobe,
        type: "info",
      },
      "mobile-deposit": {
        title: "Mobile Deposit",
        message:
          "Mobile Deposit allows you to deposit checks using your smartphone camera. Available 24/7 with immediate availability for deposits under $200. Download our mobile app to get started.",
        icon: FaMobile,
        type: "info",
      },
      "card-controls": {
        title: "Card Controls",
        message:
          "Card Controls let you manage your debit card settings including:\n• Turn card on/off instantly\n• Set spending limits\n• Block certain transaction types\n• Get real-time alerts\n• View recent transactions",
        icon: FaCreditCard,
        type: "info",
      },
      security: {
        title: "Security Features",
        message: `• ${bankingDetails.encryption} encryption\n• Two-factor authentication\n• Fraud monitoring\n• Identity theft protection\n• Account alerts\n• Secure online banking`,
        icon: FaShieldAlt,
        type: "info",
      },
      "customer-service": {
        title: "Customer Service",
        message: `Phone: ${
          bankingDetails.customerService
        }\nAvailable: 24/7/365\nOnline Chat: Available in mobile app\nBranches: ${bankingDetails.branchCount.toLocaleString()}+ locations\nATMs: ${bankingDetails.atmCount.toLocaleString()}+ nationwide`,
        icon: FaPhone,
        type: "info",
      },
      // Transaction actions that open modals
      "send-money": () => setActiveModal("transfer"),
      "receive-money": () => setActiveModal("receive"),
      deposit: () => setActiveModal("deposit"),
      withdraw: () => setActiveModal("withdraw"),
    };

    // Handle transaction actions that are functions
    if (typeof serviceInfo[action] === "function") {
      serviceInfo[action]();
      return;
    }

    const info = serviceInfo[action] || {
      title: "Service Information",
      message:
        "Service information not available. Please contact customer service for assistance.",
      icon: FaInfoCircle,
      type: "warning",
    };

    showNotification(info.title, info.message, info.type, info.icon);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh action
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  if (!user) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  const primaryAccount = user.accounts[0];

  // Get shared data from utilities
  const bankingDetails = getBankingData(primaryAccount);
  const statements = getMockStatements();

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${clbg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/95"></div>

      <div className="relative z-10">
        <Header customerName={user.name} />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-24 sm:pt-24 pb-20 lg:pb-6">
          {/* Mobile Greeting */}
          <div className="block sm:hidden mb-6 mt-2">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                {(() => {
                  // Get current time in US Eastern Time (ET)
                  const now = new Date();
                  const usEasternTime = new Intl.DateTimeFormat("en-US", {
                    timeZone: "America/New_York",
                    hour: "numeric",
                    hour12: false,
                  }).format(now);

                  const hour = parseInt(usEasternTime);

                  if (hour < 12) return "Good Morning";
                  if (hour < 17) return "Good Afternoon";
                  if (hour < 21) return "Good Evening";
                  return "Good Night";
                })()}
                ,
              </p>
              <p className="font-bold text-lg text-gray-800">{user.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Main Account Card & Quick Actions */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <AccountCard
                user={user}
                primaryAccount={primaryAccount}
                bankingDetails={bankingDetails}
                isRefreshing={isRefreshing}
                showAccountDropdown={showAccountDropdown}
                setShowAccountDropdown={setShowAccountDropdown}
                handleRefresh={handleRefresh}
                handleQuickAction={handleQuickAction}
                handleBankingService={handleBankingService}
                handleMobileNavigation={handleMobileNavigation}
              />
              <QuickActionsGrid handleBankingService={handleBankingService} />

              {/* Advanced Banking Widgets Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <SpendingAnalyticsWidget user={user} />
                <NotificationSystemWidget user={user} />
              </div>
            </div>

            {/* Right Column - Financial Overview & Banking Tools */}
            <div className="space-y-4 sm:space-y-6">
              <FinancialOverview />
              <SecurityStatusWidget user={user} />
              <CreditScoreWidget user={user} />
            </div>
          </div>

          {/* Bottom Row - Benefits & Transaction History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
            <AccountBenefits />
            <TransactionHistoryWidget user={user} />
          </div>

          {/* Advanced Banking Management */}
          <div className="mt-6">
            <AccountManagementWidget user={user} />
          </div>

          {/* Banking Information Panel */}
          <BankingInformation
            bankingDetails={bankingDetails}
            statements={statements}
            handleBankingService={handleBankingService}
            showNotification={showNotification}
          />

          {/* Mobile Navigation */}
          <MobileNavigation handleMobileNavigation={handleMobileNavigation} />
        </main>

        {/* Modals */}
        {activeModal === "transfer" && (
          <TransferModal
            isOpen={true}
            onClose={closeModal}
            accounts={user.accounts}
          />
        )}

        {activeModal === "receive" && (
          <ReceiveMoneyModal
            isOpen={true}
            onClose={closeModal}
            bankingDetails={bankingDetails}
            account={primaryAccount}
          />
        )}

        {activeModal === "withdraw" && (
          <WithdrawModal
            isOpen={true}
            onClose={closeModal}
            account={primaryAccount}
          />
        )}

        {activeModal === "deposit" && (
          <DepositModal
            isOpen={true}
            onClose={closeModal}
            account={primaryAccount}
          />
        )}

        {/* Custom Notification Modal */}
        {notification && (
          <NotificationModal
            title={notification.title}
            message={notification.message}
            icon={notification.icon}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
