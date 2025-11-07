// Transaction message types and configurations
export const MESSAGE_TYPES = {
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  INFO: "info",
};

export const MESSAGE_AUDIENCES = {
  ACCOUNT_HOLDER: "accountHolder",
  ADMIN: "admin",
};

export const MESSAGE_CATEGORIES = {
  UNAVAILABLE: "unavailable",
  GENERAL: "general",
  TRANSACTION: "transaction",
  SERVICE: "service",
  ACCOUNT: "account",
  SYSTEM: "system",
  AUTHENTICATION: "authentication",
  SECURITY: "security",
};

// Default message texts
export const DEFAULT_MESSAGES = {
  UNAVAILABLE:
    "Unable to perform this action. Contact the bank for further assistance.",
};

// Transaction unavailability type configurations
export const UNAVAILABILITY_TYPES = [
  {
    id: "transferUnavailable",
    label: "Money Transfer Unavailable",
    description: "Message shown when money transfers are unavailable",
    defaultTitle: "Transfer Unavailable",
    category: "transfer",
  },
  {
    id: "depositUnavailable",
    label: "Deposit Unavailable",
    description: "Message shown when deposits are unavailable",
    defaultTitle: "Deposit Unavailable",
    category: "deposit",
  },
  {
    id: "withdrawalUnavailable",
    label: "Withdrawal Unavailable",
    description: "Message shown when withdrawals are unavailable",
    defaultTitle: "Withdrawal Unavailable",
    category: "withdrawal",
  },
  {
    id: "paymentUnavailable",
    label: "Payment Unavailable",
    description: "Message shown when payments are unavailable",
    defaultTitle: "Payment Unavailable",
    category: "payment",
  },
];

// Icon mappings for transaction types
export const TRANSACTION_ICONS = {
  transfer: "FaExchangeAlt",
  deposit: "FaArrowDown",
  withdrawal: "FaArrowUp",
  payment: "FaCreditCard",
};
