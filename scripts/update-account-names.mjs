#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
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

async function updateAccountDisplayNames() {
  try {
    console.log("🔍 Updating display names for remaining accounts...");

    // Find accounts for the user
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("customerUID", "==", USER_UID));
    const snapshot = await getDocs(q);

    console.log(`📊 Found ${snapshot.size} accounts to update`);

    const updates = [];
    snapshot.forEach((doc) => {
      const account = doc.data();
      let displayName;

      // Determine proper display name based on account type
      switch (account.accountType) {
        case "checking":
          displayName = "Checking Account";
          break;
        case "savings":
          displayName = "Savings Account";
          break;
        case "credit":
          displayName = "Credit Account";
          break;
        case "primary":
          displayName = "Primary Account";
          break;
        default:
          displayName = `${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account`;
      }

      updates.push({
        id: doc.id,
        accountType: account.accountType,
        currentDisplayName: account.displayName,
        newDisplayName: displayName,
        balance: account.balance || 0,
      });
    });

    console.log("\n📝 Planned updates:");
    updates.forEach((update, i) => {
      console.log(
        `   ${i + 1}. ${update.accountType}: "${update.currentDisplayName}" → "${update.newDisplayName}" ($${update.balance.toLocaleString()})`
      );
    });

    // Apply updates
    for (const update of updates) {
      console.log(`\n💾 Updating ${update.accountType} account...`);
      const accountRef = doc(db, "accounts", update.id);
      await updateDoc(accountRef, {
        displayName: update.newDisplayName,
        accountName: update.newDisplayName,
        updatedAt: new Date(),
      });
      console.log(`   ✅ Updated "${update.newDisplayName}"`);
    }

    console.log("\n🎉 All account display names updated successfully!");
    console.log("The dashboard should now show 3 accounts with proper names:");
    console.log("   • Checking Account");
    console.log("   • Savings Account");
    console.log("   • Credit Account");
  } catch (error) {
    console.error("❌ Error updating display names:", error);
    process.exit(1);
  }
}

// Run the script
console.log("🚀 Updating Account Display Names...\n");
updateAccountDisplayNames()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
