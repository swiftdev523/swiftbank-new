#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
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

const USER_UID = "kxPc6PxiMNe8MUHGxItidowcAOi1";

// IDs of the 3 main accounts we want to keep (from the verification above)
const ACCOUNTS_TO_KEEP = [
  "T6wK21DaLxar7DkzAkWL", // Checking Account
  "cBcC9W67r06xGkGcTlPX", // Savings Account
  "957CQXCCj5XuMCHEUmfm", // Credit Account
];

async function forceDeleteExtraAccounts() {
  try {
    console.log("🔍 Finding all accounts for user...");

    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("customerUID", "==", USER_UID));
    const snapshot = await getDocs(q);

    console.log(`📊 Found ${snapshot.size} accounts total\n`);

    const accountsToDelete = [];
    const accountsToKeep = [];

    snapshot.forEach((doc) => {
      const account = { id: doc.id, ...doc.data() };

      if (ACCOUNTS_TO_KEEP.includes(doc.id)) {
        accountsToKeep.push(account);
        console.log(
          `✅ KEEPING: ${account.displayName || account.accountName} (${account.accountType}) - $${(account.balance || 0).toLocaleString()}`
        );
      } else {
        accountsToDelete.push(account);
        console.log(
          `❌ DELETING: ${account.displayName || account.accountName} (${account.accountType}) - $${(account.balance || 0).toLocaleString()}`
        );
      }
    });

    console.log(
      `\n🎯 Will keep ${accountsToKeep.length} accounts and delete ${accountsToDelete.length} accounts`
    );

    if (accountsToDelete.length === 0) {
      console.log("✅ No accounts to delete - already at correct count!");
      return;
    }

    console.log("\n🗑️  Deleting extra accounts one by one...");

    for (const account of accountsToDelete) {
      try {
        console.log(
          `   Deleting ${account.displayName || account.accountName} (${account.id})...`
        );
        const accountRef = doc(db, "accounts", account.id);
        await deleteDoc(accountRef);
        console.log(`   ✅ Successfully deleted ${account.id}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete ${account.id}:`, error.message);
      }
    }

    console.log("\n🎉 Deletion process complete!");
    console.log("Dashboard should now show exactly 3 accounts:");
    accountsToKeep.forEach((acc, i) => {
      console.log(
        `   ${i + 1}. ${acc.displayName || acc.accountName} (${acc.accountType})`
      );
    });
  } catch (error) {
    console.error("❌ Error in deletion process:", error);
    process.exit(1);
  }
}

// Run the script
console.log("🚀 Force Deleting Extra Accounts...\n");
forceDeleteExtraAccounts()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
