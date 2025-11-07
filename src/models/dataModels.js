/**
 * Enhanced Data Models for CL Bank Firebase Integration
 * Provides standardized schemas for all collections
 */

// ============================================================================
// USER MODELS
// ============================================================================

export const UserRoles = {
  ADMIN: "admin",
  MANAGER: "manager",
  SUPPORT: "support",
  CUSTOMER: "customer",
};

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

export const UserPermissions = {
  FULL_ACCESS: "full_access",
  USER_MANAGEMENT: "user_management",
  ACCOUNT_VIEW: "account_view",
  ACCOUNT_EDIT: "account_edit",
  ACCOUNT_CREATE: "account_create",
  ACCOUNT_DELETE: "account_delete",
  TRANSACTION_VIEW: "transaction_view",
  TRANSACTION_EDIT: "transaction_edit",
  TRANSACTION_CREATE: "transaction_create",
  TRANSACTION_DELETE: "transaction_delete",
  MESSAGE_MANAGE: "message_manage",
  SETTINGS_MANAGE: "settings_manage",
  AUDIT_VIEW: "audit_view",
};

export const createUserSchema = (userData) => ({
  uid: userData.uid,
  username: userData.username || "",
  name: userData.name || "",
  email: userData.email || "",
  phone: userData.phone || "",
  address: {
    street: userData.address?.street || "",
    city: userData.address?.city || "",
    state: userData.address?.state || "",
    zipCode: userData.address?.zipCode || "",
    country: userData.address?.country || "USA",
  },
  dateOfBirth: userData.dateOfBirth || "",
  role: userData.role || UserRoles.CUSTOMER,
  permissions: userData.permissions || [UserPermissions.ACCOUNT_VIEW],
  status: userData.status || UserStatus.ACTIVE,

  // Security & Activity
  lastLogin: userData.lastLogin || null,
  loginAttempts: userData.loginAttempts || 0,
  accountLocked: userData.accountLocked || false,
  lockoutUntil: userData.lockoutUntil || null,
  passwordLastChanged: userData.passwordLastChanged || null,

  // Profile
  profileImage: userData.profileImage || "",
  preferences: {
    theme: userData.preferences?.theme || "light",
    language: userData.preferences?.language || "en",
    notifications: {
      email: userData.preferences?.notifications?.email ?? true,
      sms: userData.preferences?.notifications?.sms ?? false,
      push: userData.preferences?.notifications?.push ?? true,
    },
    currency: userData.preferences?.currency || "USD",
    timezone: userData.preferences?.timezone || "America/New_York",
  },

  // Metadata
  createdAt: userData.createdAt || new Date(),
  updatedAt: userData.updatedAt || new Date(),
  createdBy: userData.createdBy || "system",

  // Compliance
  kycStatus: userData.kycStatus || "pending",
  kycDocuments: userData.kycDocuments || [],
  riskLevel: userData.riskLevel || "low",
  complianceNotes: userData.complianceNotes || "",
});

// ============================================================================
// ACCOUNT MODELS
// ============================================================================

export const AccountTypes = {
  CHECKING: "checking",
  SAVINGS: "savings",
  CREDIT: "credit",
  INVESTMENT: "investment",
  BUSINESS: "business",
  STUDENT: "student",
};

export const AccountStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  FROZEN: "frozen",
  CLOSED: "closed",
  PENDING: "pending",
};

export const createAccountSchema = (accountData) => ({
  accountNumber: accountData.accountNumber || "",
  accountType: accountData.accountType || AccountTypes.CHECKING,
  accountName: accountData.accountName || "",

  // Ownership
  userId: accountData.userId || "", // Primary account holder
  jointHolders: accountData.jointHolders || [], // Additional account holders
  beneficiaries: accountData.beneficiaries || [],

  // Financial
  balance: accountData.balance || 0,
  availableBalance: accountData.availableBalance || 0,
  currency: accountData.currency || "USD",
  creditLimit: accountData.creditLimit || 0,
  interestRate: accountData.interestRate || 0,
  minimumBalance: accountData.minimumBalance || 0,

  // Status & Settings
  status: accountData.status || AccountStatus.ACTIVE,
  isActive: accountData.isActive ?? true,
  isPrimary: accountData.isPrimary || false,

  // Features
  features: {
    overdraftProtection: accountData.features?.overdraftProtection ?? false,
    directDeposit: accountData.features?.directDeposit ?? true,
    onlineBanking: accountData.features?.onlineBanking ?? true,
    mobileApp: accountData.features?.mobileApp ?? true,
    atmAccess: accountData.features?.atmAccess ?? true,
    checksEnabled: accountData.features?.checksEnabled ?? true,
    debitCard: accountData.features?.debitCard ?? true,
    internationalTransfers:
      accountData.features?.internationalTransfers ?? false,
    investmentAccess: accountData.features?.investmentAccess ?? false,
  },

  // Limits & Restrictions
  dailyLimits: {
    withdrawal: accountData.dailyLimits?.withdrawal || 1000,
    transfer: accountData.dailyLimits?.transfer || 5000,
    purchase: accountData.dailyLimits?.purchase || 2500,
  },

  monthlyLimits: {
    withdrawals: accountData.monthlyLimits?.withdrawals || 6, // Savings account limit
    transfers: accountData.monthlyLimits?.transfers || 100,
  },

  // Metadata
  createdAt: accountData.createdAt || new Date(),
  updatedAt: accountData.updatedAt || new Date(),
  lastActivity: accountData.lastActivity || new Date(),
  openingDeposit: accountData.openingDeposit || 0,

  // Routing & Banking Details
  routingNumber: accountData.routingNumber || "021000021",
  branchCode: accountData.branchCode || "001",

  // Statements & Reporting
  statementFrequency: accountData.statementFrequency || "monthly",
  lastStatementDate: accountData.lastStatementDate || null,
  paperlessStatements: accountData.paperlessStatements ?? true,

  // Risk & Compliance
  riskScore: accountData.riskScore || "low",
  complianceFlags: accountData.complianceFlags || [],
  auditTrail: accountData.auditTrail || [],
});

// ============================================================================
// TRANSACTION MODELS
// ============================================================================

export const TransactionTypes = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  TRANSFER: "transfer",
  PAYMENT: "payment",
  FEE: "fee",
  INTEREST: "interest",
  REFUND: "refund",
  REVERSAL: "reversal",
  ADJUSTMENT: "adjustment",
};

export const TransactionStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REVERSED: "reversed",
};

export const TransactionCategories = {
  FOOD: "food_dining",
  TRANSPORTATION: "transportation",
  SHOPPING: "shopping",
  ENTERTAINMENT: "entertainment",
  UTILITIES: "utilities",
  HEALTHCARE: "healthcare",
  EDUCATION: "education",
  BUSINESS: "business",
  INVESTMENT: "investment",
  SAVINGS: "savings",
  OTHER: "other",
};

export const createTransactionSchema = (transactionData) => ({
  transactionId: transactionData.transactionId || "",
  type: transactionData.type || TransactionTypes.DEPOSIT,

  // Accounts & Amounts
  fromAccount: transactionData.fromAccount || "",
  toAccount: transactionData.toAccount || "",
  amount: transactionData.amount || 0,
  currency: transactionData.currency || "USD",

  // User & Authorization
  userId: transactionData.userId || "",
  initiatedBy: transactionData.initiatedBy || "",
  authorizedBy: transactionData.authorizedBy || "",

  // Details
  description: transactionData.description || "",
  reference: transactionData.reference || "",
  category: transactionData.category || TransactionCategories.OTHER,

  // Status & Processing
  status: transactionData.status || TransactionStatus.PENDING,
  processingCode: transactionData.processingCode || "",
  errorCode: transactionData.errorCode || "",
  errorMessage: transactionData.errorMessage || "",

  // Timestamps
  timestamp: transactionData.timestamp || new Date(),
  initiatedAt: transactionData.initiatedAt || new Date(),
  processedAt: transactionData.processedAt || null,
  completedAt: transactionData.completedAt || null,

  // Fees & Charges
  fees: {
    processingFee: transactionData.fees?.processingFee || 0,
    serviceFee: transactionData.fees?.serviceFee || 0,
    internationalFee: transactionData.fees?.internationalFee || 0,
    overdraftFee: transactionData.fees?.overdraftFee || 0,
  },

  // Location & Device Info
  location: {
    ip: transactionData.location?.ip || "",
    country: transactionData.location?.country || "",
    city: transactionData.location?.city || "",
    coordinates: transactionData.location?.coordinates || null,
  },

  device: {
    userAgent: transactionData.device?.userAgent || "",
    platform: transactionData.device?.platform || "",
    browser: transactionData.device?.browser || "",
  },

  // External References
  externalId: transactionData.externalId || "",
  merchantInfo: {
    name: transactionData.merchantInfo?.name || "",
    category: transactionData.merchantInfo?.category || "",
    id: transactionData.merchantInfo?.id || "",
  },

  // Balances (for audit trail)
  balanceBefore: transactionData.balanceBefore || 0,
  balanceAfter: transactionData.balanceAfter || 0,

  // Risk & Fraud
  riskScore: transactionData.riskScore || "low",
  fraudFlags: transactionData.fraudFlags || [],
  reviewRequired: transactionData.reviewRequired || false,

  // Metadata
  tags: transactionData.tags || [],
  notes: transactionData.notes || "",
  attachments: transactionData.attachments || [],
});

// ============================================================================
// NOTIFICATION MODELS
// ============================================================================

export const NotificationTypes = {
  TRANSACTION: "transaction",
  SECURITY: "security",
  ACCOUNT: "account",
  SYSTEM: "system",
  MARKETING: "marketing",
};

export const NotificationPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const createNotificationSchema = (notificationData) => ({
  title: notificationData.title || "",
  message: notificationData.message || "",
  type: notificationData.type || NotificationTypes.SYSTEM,
  priority: notificationData.priority || NotificationPriority.MEDIUM,

  // Recipients
  userId: notificationData.userId || "",
  audience: notificationData.audience || "individual", // individual, role, all
  targetRole: notificationData.targetRole || "",

  // Content
  actionRequired: notificationData.actionRequired || false,
  actionUrl: notificationData.actionUrl || "",
  actionText: notificationData.actionText || "",

  // Delivery
  channels: notificationData.channels || ["in-app"], // in-app, email, sms, push
  sent: notificationData.sent || false,
  read: notificationData.read || false,

  // Metadata
  createdAt: notificationData.createdAt || new Date(),
  expiresAt: notificationData.expiresAt || null,
  createdBy: notificationData.createdBy || "system",

  // Related Data
  relatedEntity: notificationData.relatedEntity || "", // account, transaction, user
  relatedId: notificationData.relatedId || "",
});

// ============================================================================
// AUDIT LOG MODELS
// ============================================================================

export const AuditActions = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  TRANSFER: "transfer",
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
};

export const createAuditLogSchema = (auditData) => ({
  action: auditData.action || "",
  entity: auditData.entity || "", // users, accounts, transactions
  entityId: auditData.entityId || "",

  // User & Session
  userId: auditData.userId || "",
  userRole: auditData.userRole || "",
  sessionId: auditData.sessionId || "",

  // Change Details
  oldValues: auditData.oldValues || {},
  newValues: auditData.newValues || {},
  changes: auditData.changes || [],

  // Context
  ip: auditData.ip || "",
  userAgent: auditData.userAgent || "",
  location: auditData.location || "",

  // Metadata
  timestamp: auditData.timestamp || new Date(),
  success: auditData.success ?? true,
  errorMessage: auditData.errorMessage || "",

  // Risk Assessment
  riskLevel: auditData.riskLevel || "low",
  anomalyFlags: auditData.anomalyFlags || [],
});

// ============================================================================
// SETTINGS MODELS
// ============================================================================

export const createSettingsSchema = (settingsData) => ({
  category: settingsData.category || "general",
  key: settingsData.key || "",
  value: settingsData.value || "",
  displayName: settingsData.displayName || "",
  description: settingsData.description || "",

  // Access Control
  public: settingsData.public || false,
  roleAccess: settingsData.roleAccess || [UserRoles.ADMIN],

  // Validation
  dataType: settingsData.dataType || "string", // string, number, boolean, object
  validation: settingsData.validation || {},

  // Metadata
  createdAt: settingsData.createdAt || new Date(),
  updatedAt: settingsData.updatedAt || new Date(),
  updatedBy: settingsData.updatedBy || "",
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const generateAccountNumber = (type = "checking") => {
  const prefix = {
    checking: "4",
    savings: "5",
    credit: "6",
    investment: "7",
    business: "8",
    student: "9",
  };

  const typePrefix = prefix[type] || "4";
  const randomPart = Math.floor(Math.random() * 1000000000000000)
    .toString()
    .padStart(15, "0");
  return typePrefix + randomPart;
};

export const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TXN${timestamp}${random}`;
};

export const validateSchema = (data, schema) => {
  const errors = [];

  // Basic validation - can be expanded with more sophisticated validation
  Object.keys(schema).forEach((key) => {
    if (schema[key].required && (!data[key] || data[key] === "")) {
      errors.push(`${key} is required`);
    }

    if (schema[key].type && data[key] !== undefined) {
      const expectedType = schema[key].type;
      const actualType = typeof data[key];

      if (expectedType !== actualType) {
        errors.push(`${key} should be ${expectedType}, got ${actualType}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  UserRoles,
  UserStatus,
  UserPermissions,
  AccountTypes,
  AccountStatus,
  TransactionTypes,
  TransactionStatus,
  TransactionCategories,
  NotificationTypes,
  NotificationPriority,
  AuditActions,
  createUserSchema,
  createAccountSchema,
  createTransactionSchema,
  createNotificationSchema,
  createAuditLogSchema,
  createSettingsSchema,
  generateAccountNumber,
  generateTransactionId,
  validateSchema,
};
