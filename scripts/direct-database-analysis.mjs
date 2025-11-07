#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import dotenv from "dotenv";

// Load environment variables
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

console.log("🔍 Direct Database Analysis");
console.log("===========================");

// Expected collections for a banking system
const expectedCollections = [
  "users",
  "accounts",
  "transactions",
  "accountTypes",
  "bankingServices",
  "bankingProducts",
  "settings",
  "announcements",
  "developers",
  "adminAssignments",
  "messages",
  "notifications",
  "auditLogs",
  "bankSettings",
];

async function analyzeCollection(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    console.log(`📁 ${collectionName}: ${snapshot.size} documents`);

    if (snapshot.size > 0) {
      // Show first document structure
      const firstDoc = snapshot.docs[0];
      const data = firstDoc.data();
      console.log(`   Sample fields: ${Object.keys(data).join(", ")}`);

      // Show some sample data for important collections
      if (
        ["users", "accounts", "transactions"].includes(collectionName) &&
        snapshot.size <= 5
      ) {
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(
            `   Doc ${index + 1}: ${JSON.stringify(data, null, 2).substring(0, 200)}...`
          );
        });
      }
    }
    return snapshot.size;
  } catch (error) {
    console.log(`❌ ${collectionName}: Error - ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log(
    `🗄️  Analyzing project: ${process.env.VITE_FIREBASE_PROJECT_ID}\n`
  );

  let totalDocs = 0;
  const existingCollections = [];
  const missingCollections = [];

  for (const collectionName of expectedCollections) {
    const count = await analyzeCollection(collectionName);
    totalDocs += count;

    if (count > 0) {
      existingCollections.push(collectionName);
    } else {
      missingCollections.push(collectionName);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`Total documents: ${totalDocs}`);
  console.log(
    `Existing collections (${existingCollections.length}): ${existingCollections.join(", ")}`
  );
  console.log(
    `Missing collections (${missingCollections.length}): ${missingCollections.join(", ")}`
  );

  // Check critical data
  console.log("\n🔍 Critical Data Check:");

  if (existingCollections.includes("users")) {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const admins = users.filter((u) => u.role === "admin");
    const customers = users.filter((u) => u.role === "customer");
    const developers = users.filter((u) => u.role === "developer");

    console.log(
      `👥 Users: ${users.length} total (${admins.length} admins, ${customers.length} customers, ${developers.length} developers)`
    );
  }

  if (existingCollections.includes("accounts")) {
    const accountsSnapshot = await getDocs(collection(db, "accounts"));
    console.log(`🏦 Accounts: ${accountsSnapshot.size} total`);
  }

  if (existingCollections.includes("transactions")) {
    const transactionsSnapshot = await getDocs(collection(db, "transactions"));
    console.log(`💳 Transactions: ${transactionsSnapshot.size} total`);
  }
}

main().catch(console.error);
