#!/usr/bin/env node

/**
 * Firebase Emulator Data Seeding Script
 * Seeds essential banking data using emulator
 */

import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  projectId: "swiftbank-2811b",
  // Only projectId is needed for emulator
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore emulator if not already connected
try {
  connectFirestoreEmulator(db, "localhost", 8080);
  console.log("🔧 Connected to Firestore emulator");
} catch (error) {
  console.log(
    "ℹ️  Using production Firestore (emulator already connected or not available)"
  );
}

console.log("🌱 Firebase Emulator Data Seeding");
console.log("=================================");

// Essential Banking Data
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
];

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
];

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
];

async function seedCollection(collectionName, data) {
  try {
    console.log(`🌱 Seeding ${collectionName}...`);

    const batch = writeBatch(db);
    let count = 0;

    for (const item of data) {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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
  console.log(`🗄️  Seeding project: swiftbank-2811b\n`);

  let totalSeeded = 0;

  // Check and seed banking services
  const servicesCount = await checkExistingData("bankingServices");
  if (servicesCount === 0) {
    totalSeeded += await seedCollection("bankingServices", bankingServices);
  } else {
    console.log(
      `⏭️  bankingServices: Skipping (already has ${servicesCount} documents)`
    );
  }

  // Check and seed banking products
  const productsCount = await checkExistingData("bankingProducts");
  if (productsCount === 0) {
    totalSeeded += await seedCollection("bankingProducts", bankingProducts);
  } else {
    console.log(
      `⏭️  bankingProducts: Skipping (already has ${productsCount} documents)`
    );
  }

  // Check and seed settings
  const settingsCount = await checkExistingData("settings");
  if (settingsCount === 0) {
    totalSeeded += await seedCollection("settings", settings);
  } else {
    console.log(
      `⏭️  settings: Skipping (already has ${settingsCount} documents)`
    );
  }

  console.log(`\n🎉 Seeding completed! Total new documents: ${totalSeeded}`);

  // Final check
  console.log("\n📊 Final data count:");
  console.log(
    `- bankingServices: ${await checkExistingData("bankingServices")}`
  );
  console.log(
    `- bankingProducts: ${await checkExistingData("bankingProducts")}`
  );
  console.log(`- settings: ${await checkExistingData("settings")}`);
  console.log(`- accountTypes: ${await checkExistingData("accountTypes")}`);
  console.log(`- announcements: ${await checkExistingData("announcements")}`);
  console.log(`- bankSettings: ${await checkExistingData("bankSettings")}`);
}

main().catch(console.error);
