import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useBankData } from "../../context/BankDataContext";
import AccountCard from "../../components/dashboard/AccountCard";
import TransferModal from "../../components/TransferModal";
import WithdrawModal from "../../components/WithdrawModal";
import DepositModal from "../../components/DepositModal";
import ReceiveMoneyModal from "../../components/ReceiveMoneyModal";
import CustomNotification from "../../components/common/CustomNotification";
import {
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaCreditCard,
} from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";

const AccountsPage = () => {
  const { user } = useAuth();
  const { accounts: bankAccounts } = useBankData();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showBalances, setShowBalances] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  // Prefer accounts from BankDataContext (collection-backed, realtime)
  // Fallback to embedded accounts in user for backward compatibility
  const accounts =
    bankAccounts && bankAccounts.length > 0
      ? bankAccounts
      : user?.accounts || [];

  const openModal = (modalType, account = null) => {
    setActiveModal(modalType);
    if (account) setSelectedAccount(account);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAccount(null);
  };

  const totalBalance = accounts.reduce(
    (sum, account) => sum + (account.balance || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <MdAccountBalance className="mr-3 text-blue-600" />
              My Accounts
            </h1>
            <p className="text-gray-600">
              Manage your accounts and view balances
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              {showBalances ? <FaEyeSlash /> : <FaEye />}
              <span>{showBalances ? "Hide" : "Show"} Balances</span>
            </button>

            <button
              onClick={() => setShowNotification(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <FaPlus />
              <span>Open New Account</span>
            </button>
          </div>
        </div>

        {/* Total Balance Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Total Balance
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {showBalances ? `$${totalBalance.toLocaleString()}` : "••••••"}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer">
                <FaDownload />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer">
                <FaCreditCard />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="relative">
        <div
          className="account-cards-scroll flex overflow-x-auto overflow-y-hidden gap-4 sm:gap-5 pl-4 pr-4 py-4 snap-x snap-mandatory scroll-smooth"
          style={{
            width: "100%",
            scrollPaddingLeft: "0",
            marginLeft: "-1rem",
            paddingLeft: "1rem",
            marginRight: "-1rem",
            paddingRight: "1rem",
          }}>
          {accounts.map((account, index) => (
            <div
              key={account.id || index}
              className="flex-shrink-0 snap-start min-w-[280px] w-[300px] sm:min-w-[320px] sm:w-[360px]">
              <AccountCard
                account={account}
                isPrimary={index === 0}
                onAction={(action) => openModal(action, account)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Account Features */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
        <h2 className="hidden lg:block text-2xl font-bold text-gray-800 mb-6">
          Account Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Mobile Deposits",
              description: "Deposit checks using your mobile device",
              icon: "📱",
              available: true,
            },
            {
              title: "ATM Access",
              description: "Free access to over 40,000 ATMs nationwide",
              icon: "🏧",
              available: true,
            },
            {
              title: "Online Bill Pay",
              description: "Pay bills directly from your account",
              icon: "💰",
              available: true,
            },
            {
              title: "Wire Transfers",
              description: "Send money domestically and internationally",
              icon: "🌐",
              available: true,
            },
            {
              title: "Overdraft Protection",
              description: "Automatic protection from overdraft fees",
              icon: "🛡️",
              available: false,
            },
            {
              title: "Investment Services",
              description: "Grow your wealth with investment options",
              icon: "📈",
              available: false,
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all ${
                feature.available
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}>
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {feature.description}
              </p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  feature.available
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}>
                {feature.available ? "Available" : "Coming Soon"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeModal === "transfer" && (
        <TransferModal
          isOpen={true}
          onClose={closeModal}
          accounts={accounts}
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

      {/* Custom Notification for Open New Account */}
      <CustomNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        messageId="openAccountUnavailable"
        title="Account Opening Unavailable"
        message="Unable to perform this action. Contact the bank for further assistance."
        type="warning"
      />
    </div>
  );
};

export default AccountsPage;
