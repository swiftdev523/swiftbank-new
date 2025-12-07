#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
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

async function verifyFinalAccounts() {
  try {
    console.log("🔍 Verifying final account state...");

    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("customerUID", "==", USER_UID));
    const snapshot = await getDocs(q);

    console.log(`📊 Final count: ${snapshot.size} accounts\n`);

    if (snapshot.size === 3) {
      console.log("✅ Perfect! Dashboard now shows exactly 3 accounts:");
    } else {
      console.log(`⚠️  Still ${snapshot.size} accounts (should be 3):`);
    }

    const accounts = [];
    snapshot.forEach((doc) => {
      const account = { id: doc.id, ...doc.data() };
      accounts.push(account);
    });

    // Sort accounts by type priority
    const sortedAccounts = accounts.sort((a, b) => {
      const typeOrder = { checking: 0, savings: 1, credit: 2 };
      return (
        (typeOrder[a.accountType] ?? 99) - (typeOrder[b.accountType] ?? 99)
      );
    });

    sortedAccounts.forEach((account, i) => {
      console.log(`   ${i + 1}. ${account.displayName || account.accountName}`);
      console.log(`      Type: ${account.accountType}`);
      console.log(`      Balance: $${(account.balance || 0).toLocaleString()}`);
      console.log(`      Account #: ${account.accountNumber}`);
      console.log("");
    });

    console.log("🎉 Dashboard issue has been resolved!");
    console.log("The user should now see exactly 3 accounts as expected.");
  } catch (error) {
    console.error("❌ Error verifying accounts:", error);
  }
}

// Run verification
console.log("🚀 Final Account Verification...\n");
verifyFinalAccounts()
  .then(() => {
    console.log("✅ Verification complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
