/**
 * Default Banking Data
 * Comprehensive fallback data for when Firebase collections are empty or inaccessible
 */

export const defaultBankData = {
  "bankingServices": [
    {
      "id": "mobile-banking",
      "name": "Mobile Banking",
      "description": "Access your accounts anytime, anywhere with our secure mobile app featuring biometric login and real-time notifications",
      "category": "digital",
      "features": [
        "Account access",
        "Mobile deposits",
        "Bill pay",
        "Transfers",
        "ATM locator",
        "Card controls",
        "Biometric login"
      ],
      "isActive": true,
      "icon": "mobile",
      "priority": 1,
      "fee": 0,
      "requirements": [
        "Compatible smartphone",
        "Account in good standing"
      ],
      "benefits": [
        "24/7 access",
        "Real-time alerts",
        "Secure transactions",
        "Offline account viewing"
      ]
    },
    {
      "id": "online-banking",
      "name": "Online Banking",
      "description": "Full-featured online banking platform with advanced portfolio management and comprehensive account tools",
      "category": "digital",
      "features": [
        "24/7 access",
        "Bill pay",
        "eStatements",
        "Account management",
        "Investment tracking",
        "Budget tools",
        "Alerts"
      ],
      "isActive": true,
      "icon": "computer",
      "priority": 2,
      "fee": 0,
      "requirements": [
        "Internet access",
        "Valid email address"
      ],
      "benefits": [
        "Paperless statements",
        "Transaction history",
        "Financial planning tools",
        "Multi-account view"
      ]
    },
    {
      "id": "wire-transfers",
      "name": "Wire Transfers",
      "description": "Fast and secure domestic and international wire transfers with same-day processing and tracking",
      "category": "transfer",
      "features": [
        "Same-day processing",
        "International transfers",
        "SWIFT network",
        "Transfer tracking",
        "Beneficiary management"
      ],
      "isActive": true,
      "icon": "transfer",
      "priority": 3,
      "fee": 25,
      "requirements": [
        "Valid recipient information",
        "Sufficient funds"
      ],
      "benefits": [
        "Secure transmission",
        "Global reach",
        "Fast processing",
        "Confirmation receipts"
      ]
    },
    {
      "id": "bill-pay",
      "name": "Bill Pay Service",
      "description": "Convenient automated bill payment service with scheduling, recurring payments, and payee management",
      "category": "payment",
      "features": [
        "Automatic payments",
        "Payment scheduling",
        "Payee management",
        "Payment history",
        "Due date reminders"
      ],
      "isActive": true,
      "icon": "bill",
      "priority": 4,
      "fee": 0,
      "requirements": [
        "Active checking account",
        "Valid payee information"
      ],
      "benefits": [
        "Never miss payments",
        "Save time",
        "Reduce late fees",
        "Eco-friendly"
      ]
    },
    {
      "id": "card-services",
      "name": "Card Services",
      "description": "Comprehensive debit and credit card management with fraud protection and instant controls",
      "category": "cards",
      "features": [
        "Card controls",
        "Replace cards",
        "PIN management",
        "Transaction alerts",
        "Fraud protection",
        "Spending limits"
      ],
      "isActive": true,
      "icon": "card",
      "priority": 5,
      "fee": 0,
      "requirements": [
        "Valid account",
        "Identity verification"
      ],
      "benefits": [
        "Enhanced security",
        "Instant notifications",
        "Emergency replacement",
        "Spending insights"
      ]
    },
    {
      "id": "customer-support",
      "name": "24/7 Customer Support",
      "description": "Round-the-clock customer service with multiple contact options and specialized support teams",
      "category": "support",
      "features": [
        "24/7 availability",
        "Multiple channels",
        "Specialized teams",
        "Live chat",
        "Phone support",
        "Email support"
      ],
      "isActive": true,
      "icon": "support",
      "priority": 6,
      "fee": 0,
      "requirements": [
        "Account verification"
      ],
      "benefits": [
        "Always available",
        "Expert assistance",
        "Multiple languages",
        "Quick resolution"
      ]
    }
  ],
  "bankingProducts": [
    {
      "id": "checking-premium",
      "name": "Premium Checking Account",
      "description": "Feature-rich checking account designed for everyday banking with premium benefits and no monthly fees",
      "category": "deposit",
      "minimumBalance": 1000,
      "monthlyFee": 0,
      "interestRate": 0.05,
      "features": [
        "No minimum balance fee",
        "Free online banking",
        "Mobile deposit",
        "Bill pay",
        "ATM fee refunds",
        "Overdraft protection"
      ],
      "benefits": [
        "FDIC insured up to $250,000",
        "24/7 customer service",
        "Free checks",
        "Worldwide ATM access"
      ],
      "isActive": true,
      "targetAudience": "general",
      "accountType": "checking",
      "promotionalRate": null,
      "requirements": [
        "$1,000 minimum opening deposit",
        "Valid identification"
      ]
    },
    {
      "id": "savings-high-yield",
      "name": "High-Yield Savings Account",
      "description": "Competitive interest rates to help your money grow faster with easy access and no monthly maintenance fees",
      "category": "deposit",
      "minimumBalance": 500,
      "monthlyFee": 0,
      "interestRate": 2.5,
      "features": [
        "High interest rate",
        "No monthly fees",
        "Online access",
        "Mobile banking",
        "Automatic transfers"
      ],
      "benefits": [
        "FDIC insured",
        "Compound interest",
        "Easy transfers",
        "No withdrawal limits",
        "Goal tracking"
      ],
      "isActive": true,
      "targetAudience": "savers",
      "accountType": "savings",
      "promotionalRate": 3,
      "requirements": [
        "$500 minimum opening deposit"
      ]
    },
    {
      "id": "business-checking",
      "name": "Business Checking Account",
      "description": "Professional banking solutions designed specifically for small to medium businesses with advanced cash management",
      "category": "business",
      "minimumBalance": 2500,
      "monthlyFee": 15,
      "interestRate": 0.1,
      "features": [
        "Business banking tools",
        "Cash management",
        "ACH services",
        "Multiple users",
        "Business debit cards"
      ],
      "benefits": [
        "Dedicated business support",
        "Merchant services",
        "Payroll services",
        "Business loan access",
        "Tax preparation"
      ],
      "isActive": true,
      "targetAudience": "business",
      "accountType": "checking",
      "promotionalRate": null,
      "requirements": [
        "Business license",
        "EIN number",
        "$2,500 minimum deposit"
      ]
    },
    {
      "id": "cd-12month",
      "name": "12-Month Certificate of Deposit",
      "description": "Secure investment option with guaranteed returns and flexible renewal options for conservative investors",
      "category": "investment",
      "minimumBalance": 1000,
      "monthlyFee": 0,
      "interestRate": 3.25,
      "features": [
        "Fixed interest rate",
        "FDIC insured",
        "Automatic renewal options",
        "Early withdrawal options"
      ],
      "benefits": [
        "Guaranteed returns",
        "Various term lengths",
        "Penalty-free withdrawals after maturity",
        "Interest compounding"
      ],
      "isActive": true,
      "targetAudience": "investors",
      "accountType": "cd",
      "promotionalRate": 3.5,
      "requirements": [
        "$1,000 minimum deposit",
        "12-month commitment"
      ]
    },
    {
      "id": "money-market",
      "name": "Money Market Account",
      "description": "High-yield account combining savings benefits with checking account accessibility and tiered interest rates",
      "category": "deposit",
      "minimumBalance": 2500,
      "monthlyFee": 0,
      "interestRate": 2.25,
      "features": [
        "Tiered interest rates",
        "Check writing",
        "Debit card access",
        "Limited transactions",
        "Online banking"
      ],
      "benefits": [
        "Higher interest than regular savings",
        "Check writing privileges",
        "Debit card access",
        "FDIC insured"
      ],
      "isActive": true,
      "targetAudience": "savers",
      "accountType": "money-market",
      "promotionalRate": 2.75,
      "requirements": [
        "$2,500 minimum balance",
        "Maximum 6 withdrawals per month"
      ]
    },
    {
      "id": "student-checking",
      "name": "Student Checking Account",
      "description": "Fee-free checking account designed for students with educational resources and financial literacy tools",
      "category": "student",
      "minimumBalance": 0,
      "monthlyFee": 0,
      "interestRate": 0.01,
      "features": [
        "No monthly fees",
        "No minimum balance",
        "Mobile banking",
        "Financial education",
        "Budgeting tools"
      ],
      "benefits": [
        "Free for students",
        "Financial literacy resources",
        "No overdraft fees",
        "Easy account management"
      ],
      "isActive": true,
      "targetAudience": "students",
      "accountType": "checking",
      "promotionalRate": null,
      "requirements": [
        "Valid student ID",
        "Age 16-25",
        "School enrollment verification"
      ]
    }
  ],
  "accountTypes": [
    {
      "id": "checking",
      "name": "Checking Account",
      "category": "deposit",
      "description": "Primary transaction account for daily banking needs with unlimited transactions",
      "features": [
        "Debit card",
        "Check writing",
        "Online banking",
        "Bill pay",
        "Direct deposit"
      ],
      "isActive": true,
      "minimumAge": 18,
      "documentation": [
        "Government ID",
        "Social Security number",
        "Proof of address"
      ]
    },
    {
      "id": "savings",
      "name": "Savings Account",
      "category": "deposit",
      "description": "Interest-bearing account designed for saving money with competitive rates",
      "features": [
        "Interest earning",
        "Online access",
        "Automatic transfers",
        "Goal tracking"
      ],
      "isActive": true,
      "minimumAge": 18,
      "documentation": [
        "Government ID",
        "Social Security number"
      ]
    },
    {
      "id": "business",
      "name": "Business Account",
      "category": "business",
      "description": "Professional accounts designed for business banking needs with commercial features",
      "features": [
        "Business tools",
        "Multiple users",
        "Cash management",
        "Merchant services"
      ],
      "isActive": true,
      "minimumAge": 18,
      "documentation": [
        "Business license",
        "EIN",
        "Articles of incorporation",
        "Government ID"
      ]
    },
    {
      "id": "cd",
      "name": "Certificate of Deposit",
      "category": "investment",
      "description": "Fixed-term investment with guaranteed returns and various maturity options",
      "features": [
        "Fixed rate",
        "Term options",
        "FDIC insured",
        "Automatic renewal"
      ],
      "isActive": true,
      "minimumAge": 18,
      "documentation": [
        "Government ID",
        "Social Security number",
        "Funding source"
      ]
    },
    {
      "id": "money-market",
      "name": "Money Market Account",
      "category": "deposit",
      "description": "High-yield account with limited transaction privileges and tiered interest rates",
      "features": [
        "Tiered rates",
        "Check writing",
        "Debit card",
        "Limited transactions"
      ],
      "isActive": true,
      "minimumAge": 18,
      "documentation": [
        "Government ID",
        "Social Security number",
        "Minimum deposit"
      ]
    },
    {
      "id": "student",
      "name": "Student Account",
      "category": "student",
      "description": "Special accounts for students with reduced fees and educational benefits",
      "features": [
        "No fees",
        "Educational resources",
        "Budgeting tools",
        "Mobile banking"
      ],
      "isActive": true,
      "minimumAge": 16,
      "documentation": [
        "Government ID",
        "Student ID",
        "School enrollment verification"
      ]
    }
  ],
  "bankSettings": {
    "id": "main-settings",
    "bankName": "CL Bank",
    "bankFullName": "CL Banking Corporation",
    "bankCode": "CLBANK",
    "routingNumber": "021000021",
    "swiftCode": "CLBKUS33",
    "currency": "USD",
    "timezone": "America/New_York",
    "businessHours": {
      "monday": "9:00 AM - 5:00 PM",
      "tuesday": "9:00 AM - 5:00 PM",
      "wednesday": "9:00 AM - 5:00 PM",
      "thursday": "9:00 AM - 5:00 PM",
      "friday": "9:00 AM - 6:00 PM",
      "saturday": "9:00 AM - 1:00 PM",
      "sunday": "Closed"
    },
    "contactInfo": {
      "phone": "1-800-CL-BANK",
      "email": "support@clbank.com",
      "website": "https://clbank.com",
      "address": "123 Banking Street, Financial District, NY 10001"
    },
    "features": {
      "mobileApp": true,
      "onlineBanking": true,
      "billPay": true,
      "mobileDeposit": true,
      "cardManagement": true,
      "wireTransfers": true,
      "investmentServices": true,
      "businessBanking": true
    },
    "limits": {
      "dailyTransferLimit": 10000,
      "dailyWithdrawalLimit": 1000,
      "monthlyTransferLimit": 50000,
      "mobileDepositLimit": 5000,
      "billPayLimit": 25000
    },
    "fees": {
      "overdraftFee": 35,
      "insufficientFundsFee": 35,
      "foreignTransactionFee": 3,
      "wireTransferDomestic": 25,
      "wireTransferInternational": 45,
      "cashierCheckFee": 10
    },
    "security": {
      "fdic_insured": true,
      "encryption": "AES-256",
      "two_factor_auth": true,
      "fraud_monitoring": true,
      "identity_protection": true
    }
  }
};

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
