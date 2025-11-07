// Utility functions for consistent transaction data handling across admin and user views

/**
 * Normalizes transaction data to ensure consistency across all views
 * @param {Object} rawTransaction - Raw transaction data from Firestore
 * @param {Object} options - Additional options for normalization
 * @returns {Object} Normalized transaction object
 */
export const normalizeTransaction = (rawTransaction, options = {}) => {
  const {
    includeUserInfo = false,
    includeAccountInfo = false,
    defaultStatus = "completed",
  } = options;

  // Handle different timestamp formats
  let date;
  if (rawTransaction.timestamp?.toDate) {
    date = rawTransaction.timestamp.toDate();
  } else if (rawTransaction.timestamp) {
    date = new Date(rawTransaction.timestamp);
  } else if (rawTransaction.date) {
    date = new Date(rawTransaction.date);
  } else {
    date = new Date();
  }

  // Format time string
  let timeStr = "";
  try {
    timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    timeStr = date.toISOString().substr(11, 5);
  }

  // Build a more informative description with sensible fallbacks
  const candidateDesc =
    rawTransaction.description ||
    rawTransaction.memo ||
    rawTransaction.note ||
    rawTransaction.details ||
    rawTransaction.narration ||
    rawTransaction.title ||
    rawTransaction.reference ||
    rawTransaction.ref ||
    "";

  let description =
    typeof candidateDesc === "string" ? candidateDesc.trim() : "";
  if (!description) {
    const typeLabel = (rawTransaction.type || "transaction")
      .toString()
      .toLowerCase();
    let label = "Transaction";
    if (typeLabel === "deposit") label = "Deposit";
    else if (typeLabel === "withdrawal" || typeLabel === "withdraw")
      label = "Withdrawal";
    else if (typeLabel === "transfer") label = "Transfer";

    const merchant =
      rawTransaction.merchant ||
      rawTransaction.payee ||
      rawTransaction.vendor ||
      rawTransaction.counterparty;

    if (merchant) {
      description = `${label} • ${merchant}`;
    } else {
      const tail = (acc) => (acc ? String(acc).slice(-4) : "");
      const toLast4 = tail(rawTransaction.toAccount || rawTransaction.to);
      const fromLast4 = tail(rawTransaction.fromAccount || rawTransaction.from);

      if (toLast4 && (typeLabel === "transfer" || typeLabel === "deposit")) {
        description = `${label} • ...${toLast4}`;
      } else if (
        fromLast4 &&
        (typeLabel === "withdrawal" || typeLabel === "transfer")
      ) {
        description = `${label} • ...${fromLast4}`;
      } else {
        // include short date to avoid identical labels
        const month = date.toLocaleString("en-US", { month: "short" });
        description = `${label} • ${month} ${date.getDate()}`;
      }
    }
  }

  // Base normalized transaction
  const normalized = {
    id:
      rawTransaction.id ||
      `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: rawTransaction.type || "transfer",
    amount: Number(rawTransaction.amount) || 0,
    description,
    status: rawTransaction.status || defaultStatus,
    date: date,
    time: rawTransaction.time || timeStr,
    timestamp: rawTransaction.timestamp || date,
  };

  // Add user information if requested (for admin views)
  if (includeUserInfo) {
    normalized.userId =
      rawTransaction.userId || rawTransaction.customerUID || null;
    normalized.userName =
      rawTransaction.userName || rawTransaction.customerName || "Unknown";
  }

  // Add account information if requested (for detailed views)
  if (includeAccountInfo) {
    normalized.fromAccount = rawTransaction.fromAccount || "";
    normalized.toAccount = rawTransaction.toAccount || "";
    normalized.balanceAfter = parseFloat(rawTransaction.balanceAfter) || 0;
  }

  return normalized;
};

/**
 * Normalizes an array of transactions consistently
 * @param {Array} transactions - Array of raw transaction data
 * @param {Object} options - Normalization options
 * @returns {Array} Array of normalized transactions
 */
export const normalizeTransactionArray = (transactions, options = {}) => {
  return transactions.map((transaction) =>
    normalizeTransaction(transaction, options)
  );
};

/**
 * Gets the appropriate icon for a transaction type
 * @param {string} type - Transaction type
 * @returns {string} Icon component name or class
 */
export const getTransactionTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "deposit":
      return "FaArrowDown";
    case "withdrawal":
    case "withdraw":
      return "FaArrowUp";
    case "transfer":
      return "FaExchangeAlt";
    default:
      return "FaExchangeAlt";
  }
};

/**
 * Gets the appropriate color class for a transaction type
 * @param {string} type - Transaction type
 * @returns {string} CSS color class
 */
export const getTransactionTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "deposit":
      return "text-green-500";
    case "withdrawal":
    case "withdraw":
      return "text-red-500";
    case "transfer":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
};

/**
 * Gets the appropriate background color class for a transaction type
 * @param {string} type - Transaction type
 * @returns {string} CSS background color class
 */
export const getTransactionTypeBgColor = (type) => {
  switch (type?.toLowerCase()) {
    case "deposit":
      return "bg-green-100";
    case "withdrawal":
    case "withdraw":
      return "bg-red-100";
    case "transfer":
      return "bg-blue-100";
    default:
      return "bg-gray-100";
  }
};

/**
 * Formats transaction amount with proper sign and currency
 * @param {number} amount - Transaction amount
 * @param {string} type - Transaction type
 * @returns {string} Formatted amount string
 */
export const formatTransactionAmount = (amount, type) => {
  const absAmount = Math.abs(amount);
  const sign = type === "withdrawal" || type === "withdraw" ? "-" : "+";
  return `${sign}$${absAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Filters transactions based on search term and type filter
 * @param {Array} transactions - Array of transactions to filter
 * @param {string} searchTerm - Search term to match against
 * @param {string} typeFilter - Transaction type filter
 * @param {string} dateRange - Date range filter
 * @returns {Array} Filtered transactions
 */
export const filterTransactions = (
  transactions,
  searchTerm = "",
  typeFilter = "all",
  dateRange = "all"
) => {
  let filtered = [...transactions];

  // Apply search term filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (transaction) =>
        transaction.description?.toLowerCase().includes(term) ||
        transaction.userName?.toLowerCase().includes(term) ||
        transaction.amount?.toString().includes(term) ||
        transaction.type?.toLowerCase().includes(term)
    );
  }

  // Apply type filter
  if (typeFilter !== "all") {
    filtered = filtered.filter(
      (transaction) => transaction.type === typeFilter
    );
  }

  // Apply date range filter
  if (dateRange !== "all") {
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    filtered = filtered.filter((transaction) => {
      const transactionDate =
        transaction.date instanceof Date
          ? transaction.date
          : new Date(transaction.date);
      return transactionDate >= startDate;
    });
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB - dateA;
  });

  return filtered;
};
