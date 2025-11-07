#!/usr/bin/env node
/**
 * Comprehensive Database Validation Script
 * Validates database structure, data integrity, and handles fallbacks
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  enableNetwork,
} from "firebase/firestore";

// Firebase configuration for Node.js environment
const firebaseConfig = {
  apiKey: "AIzaSyBe1-_WMF0DxSp9xLxhb7DhQZ6j4UqPbYU",
  authDomain: "swiftbank-2811b.firebaseapp.com",
  projectId: "swiftbank-2811b",
  storageBucket: "swiftbank-2811b.firebasestorage.app",
  messagingSenderId: "577013507808",
  appId: "1:577013507808:web:d9e27e9a6c4c2b0f1234b9",
  measurementId: "G-XXXXXXXXXX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase initialized with project:", firebaseConfig.projectId);

// Default data structures for seeding
const essentialData = {
  bankingServices: [
    {
      id: "mobile-banking",
      name: "Mobile Banking",
      description:
        "Access your accounts anytime, anywhere with our secure mobile app",
      category: "digital",
      features: [
        "Account access",
        "Mobile deposits",
        "Bill pay",
        "Transfers",
        "ATM locator",
      ],
      isActive: true,
      icon: "mobile",
      priority: 1,
      fee: 0,
    },
    {
      id: "online-banking",
      name: "Online Banking",
      description:
        "Full-featured online banking platform with advanced features",
      category: "digital",
      features: [
        "24/7 access",
        "Bill pay",
        "eStatements",
        "Account management",
        "Investment tracking",
      ],
      isActive: true,
      icon: "computer",
      priority: 2,
      fee: 0,
    },
    {
      id: "wire-transfers",
      name: "Wire Transfers",
      description: "Fast and secure domestic and international wire transfers",
      category: "transfer",
      features: [
        "Same-day processing",
        "International transfers",
        "SWIFT network",
        "Tracking",
      ],
      isActive: true,
      icon: "transfer",
      priority: 3,
      fee: 25,
    },
    {
      id: "bill-pay",
      name: "Bill Pay Service",
      description: "Convenient bill payment service with scheduling options",
      category: "payment",
      features: [
        "Automatic payments",
        "Payment scheduling",
        "Payee management",
        "Payment history",
      ],
      isActive: true,
      icon: "bill",
      priority: 4,
      fee: 0,
    },
    {
      id: "card-services",
      name: "Card Services",
      description: "Comprehensive debit and credit card management",
      category: "cards",
      features: [
        "Card controls",
        "Replace cards",
        "PIN management",
        "Transaction alerts",
        "Fraud protection",
      ],
      isActive: true,
      icon: "card",
      priority: 5,
      fee: 0,
    },
  ],

  bankingProducts: [
    {
      id: "checking-premium",
      name: "Premium Checking Account",
      description: "Feature-rich checking account for everyday banking needs",
      category: "deposit",
      minimumBalance: 1000,
      monthlyFee: 0,
      interestRate: 0.05,
      features: [
        "No minimum balance fee",
        "Free online banking",
        "Mobile deposit",
        "Bill pay",
        "ATM fee refunds",
      ],
      benefits: [
        "FDIC insured up to $250,000",
        "Overdraft protection",
        "24/7 customer service",
        "Free checks",
      ],
      isActive: true,
      targetAudience: "general",
      accountType: "checking",
    },
    {
      id: "savings-high-yield",
      name: "High-Yield Savings Account",
      description: "Earn competitive interest on your savings with easy access",
      category: "deposit",
      minimumBalance: 500,
      monthlyFee: 0,
      interestRate: 2.5,
      features: [
        "High interest rate",
        "No monthly fees",
        "Online access",
        "Mobile banking",
      ],
      benefits: [
        "FDIC insured",
        "Compound interest",
        "Easy transfers",
        "No withdrawal limits",
      ],
      isActive: true,
      targetAudience: "savers",
      accountType: "savings",
    },
    {
      id: "business-checking",
      name: "Business Checking Account",
      description: "Professional banking solutions designed for businesses",
      category: "business",
      minimumBalance: 2500,
      monthlyFee: 15,
      interestRate: 0.1,
      features: [
        "Business banking tools",
        "Cash management",
        "ACH services",
        "Multiple users",
      ],
      benefits: [
        "Business support",
        "Merchant services",
        "Payroll services",
        "Business loans",
      ],
      isActive: true,
      targetAudience: "business",
      accountType: "checking",
    },
    {
      id: "cd-12month",
      name: "12-Month Certificate of Deposit",
      description: "Secure investment option with guaranteed returns",
      category: "investment",
      minimumBalance: 1000,
      monthlyFee: 0,
      interestRate: 3.25,
      features: [
        "Fixed interest rate",
        "FDIC insured",
        "Automatic renewal options",
      ],
      benefits: [
        "Guaranteed returns",
        "Various term lengths",
        "Penalty-free withdrawals after maturity",
      ],
      isActive: true,
      targetAudience: "investors",
      accountType: "cd",
    },
  ],

  accountTypes: [
    {
      id: "checking",
      name: "Checking Account",
      category: "deposit",
      description: "Primary transaction account for daily banking",
      features: ["Debit card", "Check writing", "Online banking", "Bill pay"],
      isActive: true,
    },
    {
      id: "savings",
      name: "Savings Account",
      category: "deposit",
      description: "Interest-bearing account for saving money",
      features: ["Interest earning", "Online access", "Automatic transfers"],
      isActive: true,
    },
    {
      id: "business",
      name: "Business Account",
      category: "business",
      description: "Accounts designed for business banking needs",
      features: ["Business tools", "Multiple users", "Cash management"],
      isActive: true,
    },
    {
      id: "cd",
      name: "Certificate of Deposit",
      category: "investment",
      description: "Fixed-term investment with guaranteed returns",
      features: ["Fixed rate", "Term options", "FDIC insured"],
      isActive: true,
    },
  ],

  bankSettings: {
    id: "main-settings",
    bankName: "CL Bank",
    bankCode: "CLBANK",
    routingNumber: "021000021",
    swiftCode: "CLBKUS33",
    currency: "USD",
    timezone: "America/New_York",
    businessHours: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed",
    },
    contactInfo: {
      phone: "1-800-CL-BANK",
      email: "support@clbank.com",
      website: "https://clbank.com",
    },
    features: {
      mobileApp: true,
      onlineBanking: true,
      billPay: true,
      mobileDeposit: true,
      cardManagement: true,
    },
    limits: {
      dailyTransferLimit: 10000,
      dailyWithdrawalLimit: 1000,
      monthlyTransferLimit: 50000,
    },
  },
};

async function validateCollection(collectionName, expectedData = null) {
  try {
    console.log(`\n📋 Validating collection: ${collectionName}`);

    const snapshot = await getDocs(collection(db, collectionName));
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(`  ✅ Found ${docs.length} documents`);

    if (docs.length === 0 && expectedData) {
      console.log(`  ⚠️  Collection is empty, seeding with default data...`);
      await seedCollection(collectionName, expectedData);
      return false;
    }

    if (docs.length > 0) {
      console.log(`  📄 Sample document structure:`, Object.keys(docs[0]));
    }

    return docs;
  } catch (error) {
    console.log(
      `  ❌ Error accessing ${collectionName}:`,
      error.code || error.message
    );

    if (error.code === "permission-denied") {
      console.log(
        `  🔒 Permission denied for ${collectionName}. This may be expected for protected collections.`
      );
    }

    return null;
  }
}

async function seedCollection(collectionName, data) {
  try {
    if (Array.isArray(data)) {
      console.log(
        `  🌱 Seeding ${data.length} documents to ${collectionName}...`
      );
      for (const item of data) {
        await setDoc(doc(db, collectionName, item.id), item);
        console.log(`    ✅ Added ${item.id || item.name}`);
      }
    } else {
      console.log(`  🌱 Seeding single document to ${collectionName}...`);
      await setDoc(doc(db, collectionName, data.id), data);
      console.log(`    ✅ Added ${data.id}`);
    }

    console.log(`  🎉 Successfully seeded ${collectionName}!`);
  } catch (error) {
    console.log(
      `  ❌ Failed to seed ${collectionName}:`,
      error.code || error.message
    );
  }
}

async function validateFirebaseConnection() {
  try {
    console.log("🔍 Testing Firebase connection...");

    // Try to read a simple collection
    const testRef = collection(db, "test");
    await getDocs(testRef);

    console.log("✅ Firebase connection successful!");
    return true;
  } catch (error) {
    console.log("❌ Firebase connection failed:", error.code || error.message);
    return false;
  }
}

async function checkDataIntegrity() {
  console.log("\n🔍 Checking data integrity and relationships...");

  try {
    // Check if bankingProducts reference valid accountTypes
    const products = await validateCollection("bankingProducts");
    const accountTypes = await validateCollection("accountTypes");

    if (
      products &&
      accountTypes &&
      Array.isArray(products) &&
      Array.isArray(accountTypes)
    ) {
      const accountTypeIds = accountTypes.map((type) => type.id);

      for (const product of products) {
        if (
          product.accountType &&
          !accountTypeIds.includes(product.accountType)
        ) {
          console.log(
            `  ⚠️  Product ${product.name} references non-existent account type: ${product.accountType}`
          );
        }
      }
    }

    console.log("✅ Data integrity check completed");
  } catch (error) {
    console.log("❌ Error during integrity check:", error.message);
  }
}

async function main() {
  console.log("🚀 Starting Comprehensive Database Validation");
  console.log("=".repeat(60));

  // Test Firebase connection
  const connectionOk = await validateFirebaseConnection();
  if (!connectionOk) {
    console.log("\n❌ Cannot proceed without Firebase connection");
    return;
  }

  // Validate essential collections
  console.log("\n📋 Validating Essential Collections");
  console.log("-".repeat(40));

  const results = {
    bankingServices: await validateCollection(
      "bankingServices",
      essentialData.bankingServices
    ),
    bankingProducts: await validateCollection(
      "bankingProducts",
      essentialData.bankingProducts
    ),
    accountTypes: await validateCollection(
      "accountTypes",
      essentialData.accountTypes
    ),
    bankSettings: await validateCollection(
      "bankSettings",
      essentialData.bankSettings
    ),
  };

  // Check protected collections (may have permission errors)
  console.log("\n🔒 Checking Protected Collections");
  console.log("-".repeat(40));

  await validateCollection("users");
  await validateCollection("accounts");
  await validateCollection("transactions");
  await validateCollection("adminData");
  await validateCollection("auditLogs");

  // Data integrity checks
  await checkDataIntegrity();

  // Summary
  console.log("\n📊 Validation Summary");
  console.log("=".repeat(60));

  const successfulCollections = Object.entries(results).filter(
    ([_, result]) => result !== null && result !== false
  );
  const failedCollections = Object.entries(results).filter(
    ([_, result]) => result === null || result === false
  );

  console.log(
    `✅ Successfully validated: ${successfulCollections.length} collections`
  );
  console.log(
    `❌ Failed/Empty collections: ${failedCollections.length} collections`
  );

  if (successfulCollections.length > 0) {
    console.log("\n🎉 Database is ready for use!");
    console.log(
      "📱 Frontend application should now display banking services and products."
    );
  } else {
    console.log("\n⚠️  Database may need additional setup or permissions.");
  }

  console.log("\n🔗 Next steps:");
  console.log("1. Start the frontend application: npm run dev");
  console.log("2. Check that banking services and products are displayed");
  console.log("3. Test user registration and account creation");
  console.log("4. Verify transaction functionality");
}

main().catch(console.error);
