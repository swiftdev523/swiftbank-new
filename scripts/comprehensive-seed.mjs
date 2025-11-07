#!/usr/bin/env node

import { initializeApp } from "firebase/app";
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
const db = getFirestore(app);

console.log("🌱 Comprehensive Database Seeding");
console.log("==================================");

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
    updatedAt: serverTimestamp(),
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
    updatedAt: serverTimestamp(),
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
    updatedAt: serverTimestamp(),
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
    updatedAt: serverTimestamp(),
    isActive: true,
  },
];

// Message Templates
const messageTemplates = [
  {
    id: "welcome-customer",
    title: "Welcome to Swift Bank",
    message:
      "Welcome to Swift Bank! Your account has been successfully created. Start exploring our banking features.",
    category: "onboarding",
    type: "success",
    isActive: true,
    audience: "customer",
    priority: "high",
  },
  {
    id: "transaction-success",
    title: "Transaction Completed",
    message:
      "Your transaction has been processed successfully. Thank you for using Swift Bank.",
    category: "transaction",
    type: "success",
    isActive: true,
    audience: "customer",
    priority: "medium",
  },
  {
    id: "low-balance-alert",
    title: "Low Balance Alert",
    message:
      "Your account balance is running low. Consider making a deposit to avoid overdraft fees.",
    category: "alert",
    type: "warning",
    isActive: true,
    audience: "customer",
    priority: "high",
  },
  {
    id: "security-notice",
    title: "Security Notice",
    message:
      "We detected a login from a new device. If this was not you, please contact us immediately.",
    category: "security",
    type: "warning",
    isActive: true,
    audience: "customer",
    priority: "high",
  },
  {
    id: "maintenance-notice",
    title: "Scheduled Maintenance",
    message:
      "Our online banking will be unavailable from 2:00 AM to 4:00 AM EST for scheduled maintenance.",
    category: "system",
    type: "info",
    isActive: true,
    audience: "all",
    priority: "medium",
  },
];

async function seedCollection(collectionName, data, useAddDoc = false) {
  try {
    console.log(`🌱 Seeding ${collectionName}...`);

    const collectionRef = collection(db, collectionName);
    const batch = writeBatch(db);
    let count = 0;

    for (const item of data) {
      if (useAddDoc) {
        await addDoc(collectionRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const docRef = doc(collectionRef, item.id);
        batch.set(docRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      count++;
    }

    if (!useAddDoc) {
      await batch.commit();
    }

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
  console.log(`🗄️  Seeding project: ${process.env.VITE_FIREBASE_PROJECT_ID}\n`);

  // Check existing data
  console.log("📊 Checking existing data...");
  const bankingServicesCount = await checkExistingData("bankingServices");
  const bankingProductsCount = await checkExistingData("bankingProducts");
  const settingsCount = await checkExistingData("settings");
  const messagesCount = await checkExistingData("messages");

  console.log(
    `Existing: bankingServices(${bankingServicesCount}), bankingProducts(${bankingProductsCount}), settings(${settingsCount}), messages(${messagesCount})\n`
  );

  let totalSeeded = 0;

  // Seed Banking Services (if empty or less than expected)
  if (bankingServicesCount < bankingServices.length) {
    totalSeeded += await seedCollection("bankingServices", bankingServices);
  } else {
    console.log(
      `⏭️  bankingServices: Skipping (already has ${bankingServicesCount} documents)`
    );
  }

  // Seed Banking Products (if empty or less than expected)
  if (bankingProductsCount < bankingProducts.length) {
    totalSeeded += await seedCollection("bankingProducts", bankingProducts);
  } else {
    console.log(
      `⏭️  bankingProducts: Skipping (already has ${bankingProductsCount} documents)`
    );
  }

  // Seed Settings (if empty or less than expected)
  if (settingsCount < settings.length) {
    totalSeeded += await seedCollection("settings", settings);
  } else {
    console.log(
      `⏭️  settings: Skipping (already has ${settingsCount} documents)`
    );
  }

  // Seed Message Templates (if empty or less than expected)
  if (messagesCount < messageTemplates.length) {
    totalSeeded += await seedCollection("messages", messageTemplates);
  } else {
    console.log(
      `⏭️  messages: Skipping (already has ${messagesCount} documents)`
    );
  }

  console.log(`\n🎉 Seeding completed! Total new documents: ${totalSeeded}`);

  // Run final check
  console.log("\n📊 Final data count:");
  console.log(`bankingServices: ${await checkExistingData("bankingServices")}`);
  console.log(`bankingProducts: ${await checkExistingData("bankingProducts")}`);
  console.log(`settings: ${await checkExistingData("settings")}`);
  console.log(`messages: ${await checkExistingData("messages")}`);
  console.log(`accountTypes: ${await checkExistingData("accountTypes")}`);
  console.log(`announcements: ${await checkExistingData("announcements")}`);
  console.log(`bankSettings: ${await checkExistingData("bankSettings")}`);
}

main().catch(console.error);
