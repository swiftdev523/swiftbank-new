// Simple validation utilities for banking application
export const ValidationUtils = {
  // Email validation
  validateEmail: (email) => {
    if (!email) return { isValid: false, message: "Email is required" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    return { isValid: true, message: "" };
  },

  // Password validation
  validatePassword: (password) => {
    if (!password) return { isValid: false, message: "Password is required" };

    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      return {
        isValid: false,
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      };
    }

    return { isValid: true, message: "" };
  },

  // Amount validation
  validateAmount: (amount, min = 0.01, max = 1000000) => {
    if (!amount && amount !== 0) {
      return { isValid: false, message: "Amount is required" };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { isValid: false, message: "Please enter a valid amount" };
    }

    if (numAmount < min) {
      return { isValid: false, message: `Amount must be at least $${min}` };
    }

    if (numAmount > max) {
      return {
        isValid: false,
        message: `Amount cannot exceed $${max.toLocaleString()}`,
      };
    }

    return { isValid: true, message: "" };
  },

  // Required field validation
  validateRequired: (value, fieldName) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    return { isValid: true, message: "" };
  },

  // Input sanitization
  sanitizeInput: (input) => {
    if (typeof input !== "string") return input;

    return input.replace(/[<>]/g, "").trim().substring(0, 1000);
  },

  // Phone number validation
  validatePhone: (phone) => {
    if (!phone) return { isValid: false, message: "Phone number is required" };

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: "Please enter a valid phone number" };
    }

    return { isValid: true, message: "" };
  },

  // Account validation
  validateAccount: (accountData) => {
    const errors = [];

    if (!accountData.accountType) {
      errors.push("Account type is required");
    }

    if (!accountData.holderName || accountData.holderName.trim().length < 2) {
      errors.push("Account holder name must be at least 2 characters");
    }

    if (
      accountData.initialBalance &&
      isNaN(parseFloat(accountData.initialBalance))
    ) {
      errors.push("Initial balance must be a valid number");
    }

    return {
      isValid: errors.length === 0,
      data: accountData,
      errors: errors.map((error) => ({ field: "general", message: error })),
    };
  },

  // Transaction validation
  validateTransaction: (transactionData) => {
    const errors = [];

    if (!transactionData.type) {
      errors.push("Transaction type is required");
    }

    if (!transactionData.amount || isNaN(parseFloat(transactionData.amount))) {
      errors.push("Amount is required and must be a valid number");
    } else if (parseFloat(transactionData.amount) <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (
      !transactionData.description ||
      transactionData.description.trim().length < 3
    ) {
      errors.push("Description must be at least 3 characters");
    }

    return {
      isValid: errors.length === 0,
      data: transactionData,
      errors: errors.map((error) => ({ field: "general", message: error })),
    };
  },
};

export default ValidationUtils;
