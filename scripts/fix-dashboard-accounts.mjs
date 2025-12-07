#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBaLBKaK_CLr2j74Vm_hRRc4nrMgkX_9Bs",
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || "swiftbank-2811b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "swiftbank-2811b",
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET || "swiftbank-2811b.appspot.com",
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "956921750491",
  appId:
    process.env.VITE_FIREBASE_APP_ID ||
    "1:956921750491:web:f5a08c557c23d0b10c7c05",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Johnson Boseman's UID from the screenshots
const JOHNSON_UID = "mYFGjRgsARS0AheCdYUkzhMRLkk2";

async function analyzeAndFixAccounts() {
  try {
    console.log("🔍 Analyzing accounts for Johnson Boseman...");
    console.log("UID:", JOHNSON_UID);

    // Query accounts for Johnson Boseman
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("customerUID", "==", JOHNSON_UID));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("❌ No accounts found for Johnson Boseman");
      return;
    }

    console.log(`📊 Found ${snapshot.size} accounts for Johnson Boseman:`);

    const accounts = [];
    snapshot.forEach((doc) => {
      const account = { id: doc.id, ...doc.data() };
      accounts.push(account);
      console.log(`\n💳 Account ${accounts.length}:`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Type: ${account.accountType}`);
      console.log(
        `   Display Name: ${account.displayName || account.accountName}`
      );
      console.log(`   Balance: $${(account.balance || 0).toLocaleString()}`);
      console.log(
        `   Account Number: ${account.accountNumber || account.accountNumberPrefix + account.accountNumberSuffix}`
      );
      console.log(`   Status: ${account.status || "active"}`);
    });

    console.log(
      `\n⚠️  Dashboard is showing ${snapshot.size} accounts, but should only show 3`
    );

    if (snapshot.size > 3) {
      console.log("\n🔧 FIXING: Keeping only the 3 intended accounts...");

      // Sort accounts to identify which ones to keep
      const sortedAccounts = accounts.sort((a, b) => {
        // Prioritize by account type order: primary, checking, savings
        const typeOrder = { primary: 0, checking: 1, savings: 2 };
        const aOrder = typeOrder[a.accountType] ?? 999;
        const bOrder = typeOrder[b.accountType] ?? 999;

        if (aOrder !== bOrder) return aOrder - bOrder;

        // If same type, prioritize by balance (higher first)
        return (b.balance || 0) - (a.balance || 0);
      });

      // Keep only first 3 accounts (primary, checking, savings)
      const accountsToKeep = sortedAccounts.slice(0, 3);
      const accountsToDelete = sortedAccounts.slice(3);

      console.log("\n✅ Accounts to KEEP:");
      accountsToKeep.forEach((acc, i) => {
        console.log(
          `   ${i + 1}. ${acc.displayName} (${acc.accountType}) - $${(acc.balance || 0).toLocaleString()}`
        );
      });

      console.log("\n❌ Accounts to DELETE:");
      accountsToDelete.forEach((acc, i) => {
        console.log(
          `   ${i + 1}. ${acc.displayName} (${acc.accountType}) - $${(acc.balance || 0).toLocaleString()}`
        );
      });

      // Delete extra accounts
      const batch = writeBatch(db);
      for (const account of accountsToDelete) {
        console.log(`🗑️  Deleting ${account.displayName}...`);
        const accountRef = doc(db, "accounts", account.id);
        batch.delete(accountRef);
      }

      await batch.commit();
      console.log(
        `✅ Successfully deleted ${accountsToDelete.length} extra accounts`
      );
      console.log("🎉 Dashboard should now show exactly 3 accounts!");
    } else if (snapshot.size === 3) {
      console.log("✅ Account count is correct (3 accounts)");
    } else {
      console.log(
        "⚠️  Less than 3 accounts found - this might need manual review"
      );
    }
  } catch (error) {
    console.error("❌ Error analyzing accounts:", error);
    process.exit(1);
  }
}

// Run the script
console.log("🚀 Starting Dashboard Accounts Fix...\n");
analyzeAndFixAccounts()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
