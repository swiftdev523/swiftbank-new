#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Developer credentials from environment
const DEVELOPER_EMAIL =
  process.env.DEVELOPER_EMAIL || "developer@swiftbank.com";
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD;

if (!DEVELOPER_PASSWORD) {
  console.error("❌ DEVELOPER_PASSWORD environment variable is required");
  console.log(
    '💡 Set it with: export DEVELOPER_PASSWORD="your-secure-password"'
  );
  process.exit(1);
}

console.log("🔐 Authenticated Database Seeding");
console.log("=================================");

// Banking Services Data
const bankingServices = [
  {
    id: "mobile-banking",
    name: "Mobile Banking",
    description: "Access your accounts anytime, anywhere with our mobile app",
    category: "digital",
    features: ["Account access", "Mobile deposits", "Bill pay", "Transfers"],
    isActive: true,
    icon: "mobile",
    priority: 1,
  },
  {
    id: "online-banking",
    name: "Online Banking",
    description: "Full-featured online banking platform",
    category: "digital",
    features: ["24/7 access", "Bill pay", "eStatements", "Account management"],
    isActive: true,
    icon: "computer",
    priority: 2,
  },
  {
    id: "bill-pay",
    name: "Bill Pay Service",
    description: "Pay bills directly from your account",
    category: "payment",
    features: ["Automatic payments", "Payment scheduling", "Payee management"],
    isActive: true,
    icon: "bill",
    priority: 3,
  },
  {
    id: "wire-transfers",
    name: "Wire Transfers",
    description: "Domestic and international wire transfer services",
    category: "transfer",
    features: [
      "Same-day processing",
      "International transfers",
      "SWIFT network",
    ],
    isActive: true,
    icon: "transfer",
    priority: 4,
  },
  {
    id: "card-services",
    name: "Card Services",
    description: "Debit and credit card management",
    category: "cards",
    features: [
      "Card controls",
      "Replace cards",
      "PIN management",
      "Transaction alerts",
    ],
    isActive: true,
    icon: "card",
    priority: 5,
  },
  {
    id: "investment-services",
    name: "Investment Services",
    description: "Investment and wealth management solutions",
    category: "investment",
    features: [
      "Portfolio management",
      "Investment advice",
      "Retirement planning",
    ],
    isActive: true,
    icon: "chart",
    priority: 6,
  },
];

// Banking Products Data
const bankingProducts = [
  {
    id: "checking-account",
    name: "Premium Checking Account",
    description: "Feature-rich checking account for everyday banking",
    category: "deposit",
    minimumBalance: 1000,
    monthlyFee: 0,
    interestRate: 0.05,
    features: [
      "No minimum balance fee",
      "Free online banking",
      "Mobile deposit",
      "Bill pay",
    ],
    benefits: ["FDIC insured", "Overdraft protection", "24/7 customer service"],
    isActive: true,
    targetAudience: "general",
  },
  {
    id: "savings-account",
    name: "High-Yield Savings Account",
    description: "Earn competitive interest on your savings",
    category: "deposit",
    minimumBalance: 500,
    monthlyFee: 0,
    interestRate: 2.5,
    features: ["High interest rate", "No monthly fees", "Online access"],
    benefits: ["FDIC insured", "Compound interest", "Easy transfers"],
    isActive: true,
    targetAudience: "savers",
  },
  {
    id: "business-checking",
    name: "Business Checking Account",
    description: "Professional banking solutions for businesses",
    category: "business",
    minimumBalance: 2500,
    monthlyFee: 15,
    interestRate: 0.25,
    features: [
      "Business debit card",
      "Online banking",
      "ACH transfers",
      "Wire transfers",
    ],
    benefits: ["Business support", "Multiple users", "Transaction reporting"],
    isActive: true,
    targetAudience: "business",
  },
  {
    id: "investment-account",
    name: "Investment Account",
    description: "Grow your wealth with our investment options",
    category: "investment",
    minimumBalance: 10000,
    monthlyFee: 0,
    interestRate: 0,
    features: [
      "Portfolio management",
      "Investment advisory",
      "Market research",
    ],
    benefits: [
      "Professional management",
      "Diversified portfolios",
      "Performance tracking",
    ],
    isActive: true,
    targetAudience: "investors",
  },
  {
    id: "credit-card",
    name: "Swift Rewards Credit Card",
    description: "Earn rewards on every purchase",
    category: "credit",
    minimumBalance: 0,
    monthlyFee: 0,
    interestRate: 18.99,
    features: [
      "Rewards program",
      "No annual fee",
      "Fraud protection",
      "Mobile app",
    ],
    benefits: ["Cashback rewards", "Purchase protection", "Travel benefits"],
    isActive: true,
    targetAudience: "general",
  },
];

// Settings Data
const settings = [
  {
    id: "app-settings",
    name: "Application Settings",
    category: "app",
    settings: {
      appName: "Swift Bank",
      version: "1.0.0",
      maintenanceMode: false,
      supportEmail: "support@swiftbank.com",
      supportPhone: "+1-800-SWIFT-1",
      timezone: "America/New_York",
    },
    isActive: true,
  },
  {
    id: "security-settings",
    name: "Security Settings",
    category: "security",
    settings: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowedDomains: ["swiftbank.com"],
      encryptionLevel: "AES-256",
    },
    isActive: true,
  },
  {
    id: "transaction-settings",
    name: "Transaction Settings",
    category: "transactions",
    settings: {
      dailyTransferLimit: 50000,
      dailyWithdrawalLimit: 1000,
      internationalTransferFee: 25,
      domesticWireFee: 15,
      overdraftFee: 35,
      currencyCode: "USD",
    },
    isActive: true,
  },
  {
    id: "notification-settings",
    name: "Notification Settings",
    category: "notifications",
    settings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      transactionAlerts: true,
      securityAlerts: true,
      marketingEmails: false,
    },
    isActive: true,
  },
];

// Sample users (admin and customer)
const sampleUsers = [
  {
    id: "admin-sample-001",
    uid: "admin-sample-001",
    email: "admin@swiftbank.com",
    firstName: "John",
    lastName: "Administrator",
    role: "admin",
    isActive: true,
    createdBy: "XImTwn30xsfGBDXN9PxoMzr6p4y2",
    assignedCustomer: "customer-sample-001",
    permissions: ["admin_panel", "user_management", "transaction_management"],
    phone: "+1-555-0100",
  },
  {
    id: "customer-sample-001",
    uid: "customer-sample-001",
    email: "customer@swiftbank.com",
    firstName: "Johnson",
    lastName: "Boseman",
    role: "customer",
    isActive: true,
    createdBy: "XImTwn30xsfGBDXN9PxoMzr6p4y2",
    assignedAdmin: "admin-sample-001",
    permissions: ["account_view", "transaction_create", "profile_edit"],
    phone: "+1-555-0101",
    address: {
      street: "123 Banking Ave",
      city: "Financial District",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    accounts: [],
  },
];

// Sample accounts for the customer
const sampleAccounts = [
  {
    id: "account-primary-001",
    accountNumber: "1234567890",
    accountName: "Primary Checking",
    accountType: "checking",
    balance: 15750.5,
    currency: "USD",
    status: "active",
    userId: "customer-sample-001",
    customerUID: "customer-sample-001",
    customerEmail: "customer@swiftbank.com",
    accountHolder: "Johnson Boseman",
    routingNumber: "021000021",
    openedDate: new Date("2023-01-15").toISOString(),
    isActive: true,
    features: ["online_banking", "mobile_deposits", "bill_pay"],
    benefits: ["FDIC insured", "No monthly fees", "Free transfers"],
  },
  {
    id: "account-savings-001",
    accountNumber: "1234567891",
    accountName: "High-Yield Savings",
    accountType: "savings",
    balance: 45250.75,
    currency: "USD",
    status: "active",
    userId: "customer-sample-001",
    customerUID: "customer-sample-001",
    customerEmail: "customer@swiftbank.com",
    accountHolder: "Johnson Boseman",
    routingNumber: "021000021",
    openedDate: new Date("2023-01-15").toISOString(),
    interestRate: 2.5,
    isActive: true,
    features: ["high_interest", "online_access", "mobile_banking"],
    benefits: ["FDIC insured", "Competitive rates", "Easy access"],
  },
  {
    id: "account-investment-001",
    accountNumber: "1234567892",
    accountName: "Investment Portfolio",
    accountType: "investment",
    balance: 125000.0,
    currency: "USD",
    status: "active",
    userId: "customer-sample-001",
    customerUID: "customer-sample-001",
    customerEmail: "customer@swiftbank.com",
    accountHolder: "Johnson Boseman",
    routingNumber: "021000021",
    openedDate: new Date("2023-03-20").toISOString(),
    isActive: true,
    features: [
      "portfolio_management",
      "investment_advisory",
      "market_research",
    ],
    benefits: [
      "Professional management",
      "Diversified portfolio",
      "Growth potential",
    ],
  },
];

async function authenticateAsdeveloper() {
  try {
    console.log(`🔐 Signing in as developer: ${DEVELOPER_EMAIL}`);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      DEVELOPER_EMAIL,
      DEVELOPER_PASSWORD
    );
    console.log(
      `✅ Authenticated as: ${userCredential.user.email} (${userCredential.user.uid})`
    );
    return userCredential.user;
  } catch (error) {
    console.error(`❌ Authentication failed: ${error.message}`);
    throw error;
  }
}

async function seedCollection(collectionName, data, merge = false) {
  try {
    console.log(`🌱 Seeding ${collectionName}...`);

    const batch = writeBatch(db);
    let count = 0;

    for (const item of data) {
      const docRef = doc(db, collectionName, item.id);
      batch.set(
        docRef,
        {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge }
      );
      count++;
    }

    await batch.commit();
    console.log(`✅ ${collectionName}: Added ${count} documents`);
    return count;
  } catch (error) {
    console.log(`❌ ${collectionName}: Error - ${error.message}`);
    return 0;
  }
}

async function checkExistingData(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.size;
  } catch (error) {
    return 0;
  }
}

async function main() {
  try {
    // Authenticate first
    await authenticateAsdeveloper();

    console.log(
      `\n🗄️  Seeding project: ${process.env.VITE_FIREBASE_PROJECT_ID}`
    );

    // Check existing data
    console.log("\n📊 Checking existing data...");
    const bankingServicesCount = await checkExistingData("bankingServices");
    const bankingProductsCount = await checkExistingData("bankingProducts");
    const settingsCount = await checkExistingData("settings");
    const usersCount = await checkExistingData("users");
    const accountsCount = await checkExistingData("accounts");

    console.log(`Existing counts:`);
    console.log(`- bankingServices: ${bankingServicesCount}`);
    console.log(`- bankingProducts: ${bankingProductsCount}`);
    console.log(`- settings: ${settingsCount}`);
    console.log(`- users: ${usersCount}`);
    console.log(`- accounts: ${accountsCount}`);

    let totalSeeded = 0;

    // Seed Banking Services
    if (bankingServicesCount < bankingServices.length) {
      totalSeeded += await seedCollection("bankingServices", bankingServices);
    } else {
      console.log(
        `⏭️  bankingServices: Skipping (already has ${bankingServicesCount} documents)`
      );
    }

    // Seed Banking Products
    if (bankingProductsCount < bankingProducts.length) {
      totalSeeded += await seedCollection("bankingProducts", bankingProducts);
    } else {
      console.log(
        `⏭️  bankingProducts: Skipping (already has ${bankingProductsCount} documents)`
      );
    }

    // Seed Settings
    if (settingsCount < settings.length) {
      totalSeeded += await seedCollection("settings", settings);
    } else {
      console.log(
        `⏭️  settings: Skipping (already has ${settingsCount} documents)`
      );
    }

    // Seed Sample Users
    if (usersCount === 0) {
      totalSeeded += await seedCollection("users", sampleUsers);
    } else {
      console.log(`⏭️  users: Skipping (already has ${usersCount} documents)`);
    }

    // Seed Sample Accounts
    if (accountsCount === 0) {
      totalSeeded += await seedCollection("accounts", sampleAccounts);
    } else {
      console.log(
        `⏭️  accounts: Skipping (already has ${accountsCount} documents)`
      );
    }

    // Create admin assignment
    try {
      const assignmentDoc = {
        id: "admin-sample-001_customer-sample-001",
        developerId: "XImTwn30xsfGBDXN9PxoMzr6p4y2",
        adminId: "admin-sample-001",
        customerId: "customer-sample-001",
        adminEmail: "admin@swiftbank.com",
        customerEmail: "customer@swiftbank.com",
        isActive: true,
        createdAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, "adminAssignments", assignmentDoc.id),
        assignmentDoc
      );
      console.log(`✅ adminAssignments: Created assignment`);
      totalSeeded++;
    } catch (error) {
      console.log(`❌ adminAssignments: Error - ${error.message}`);
    }

    console.log(`\n🎉 Seeding completed! Total new documents: ${totalSeeded}`);

    // Run final check
    console.log("\n📊 Final data count:");
    console.log(
      `- bankingServices: ${await checkExistingData("bankingServices")}`
    );
    console.log(
      `- bankingProducts: ${await checkExistingData("bankingProducts")}`
    );
    console.log(`- settings: ${await checkExistingData("settings")}`);
    console.log(`- users: ${await checkExistingData("users")}`);
    console.log(`- accounts: ${await checkExistingData("accounts")}`);
    console.log(
      `- adminAssignments: ${await checkExistingData("adminAssignments")}`
    );
    console.log(`- accountTypes: ${await checkExistingData("accountTypes")}`);
    console.log(`- announcements: ${await checkExistingData("announcements")}`);
    console.log(`- bankSettings: ${await checkExistingData("bankSettings")}`);

    console.log("\n✅ Database seeding complete!");
  } catch (error) {
    console.error(`💥 Seeding failed: ${error.message}`);
    process.exit(1);
  }
}

main();
