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

// Email from the screenshot
const USER_EMAIL = "lee.kathryn@yahoo.com";

async function findUserAndFixAccounts() {
  try {
    console.log("🔍 Looking for user with email:", USER_EMAIL);

    // Find user by email
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", USER_EMAIL));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log("❌ No user found with email:", USER_EMAIL);
      console.log("\n🔍 Let's check all users in the database...");

      const allUsersSnapshot = await getDocs(usersRef);
      if (allUsersSnapshot.empty) {
        console.log("❌ No users found in database at all");
        return;
      }

      console.log(`📊 Found ${allUsersSnapshot.size} users:`);
      allUsersSnapshot.forEach((doc) => {
        const user = doc.data();
        console.log(
          `   - ${user.email} (${user.firstName} ${user.lastName}) - UID: ${doc.id}`
        );
      });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userUID = userDoc.id;

    console.log("✅ User found:");
    console.log(`   UID: ${userUID}`);
    console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);

    // Now find accounts for this user
    console.log(`\n🔍 Looking for accounts for UID: ${userUID}`);

    const accountsRef = collection(db, "accounts");
    const accountsQuery = query(
      accountsRef,
      where("customerUID", "==", userUID)
    );
    const accountsSnapshot = await getDocs(accountsQuery);

    if (accountsSnapshot.empty) {
      console.log("❌ No accounts found for this user");

      // Check if using userId field instead
      const userIdQuery = query(accountsRef, where("userId", "==", userUID));
      const userIdSnapshot = await getDocs(userIdQuery);

      if (userIdSnapshot.empty) {
        console.log("❌ No accounts found with userId field either");

        // Check all accounts to see what UIDs they have
        console.log("\n🔍 Checking all accounts in database...");
        const allAccountsSnapshot = await getDocs(accountsRef);
        console.log(`📊 Found ${allAccountsSnapshot.size} total accounts:`);

        const accountsByUser = new Map();
        allAccountsSnapshot.forEach((doc) => {
          const account = doc.data();
          const uid = account.customerUID || account.userId || "unknown";
          if (!accountsByUser.has(uid)) {
            accountsByUser.set(uid, []);
          }
          accountsByUser.get(uid).push({
            id: doc.id,
            type: account.accountType,
            displayName: account.displayName || account.accountName,
            balance: account.balance || 0,
          });
        });

        for (const [uid, accounts] of accountsByUser) {
          console.log(`\n👤 UID: ${uid}`);
          console.log(`   📊 ${accounts.length} accounts:`);
          accounts.forEach((acc) => {
            console.log(
              `      - ${acc.displayName} (${acc.type}): $${acc.balance.toLocaleString()}`
            );
          });
        }

        return;
      } else {
        console.log(
          `✅ Found ${userIdSnapshot.size} accounts using userId field`
        );
        // Process accounts found with userId
        processAccounts(userIdSnapshot, userUID);
      }
    } else {
      console.log(
        `✅ Found ${accountsSnapshot.size} accounts using customerUID field`
      );
      // Process accounts found with customerUID
      processAccounts(accountsSnapshot, userUID);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

function processAccounts(snapshot, userUID) {
  console.log(`\n📊 Found ${snapshot.size} accounts for user:`);

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
  });

  if (snapshot.size > 3) {
    console.log(`\n⚠️  Found ${snapshot.size} accounts, but should only be 3!`);
    console.log("🔧 Need to delete extra accounts to fix dashboard display");

    // Sort and keep only 3 best accounts
    const sortedAccounts = accounts.sort((a, b) => {
      // Priority order: primary, checking, savings, then by balance
      const typeOrder = { primary: 0, checking: 1, savings: 2 };
      const aOrder = typeOrder[a.accountType] ?? 999;
      const bOrder = typeOrder[b.accountType] ?? 999;

      if (aOrder !== bOrder) return aOrder - bOrder;
      return (b.balance || 0) - (a.balance || 0);
    });

    const toKeep = sortedAccounts.slice(0, 3);
    const toDelete = sortedAccounts.slice(3);

    console.log("\n✅ Will keep these 3 accounts:");
    toKeep.forEach((acc, i) => {
      console.log(
        `   ${i + 1}. ${acc.displayName} (${acc.accountType}) - $${(acc.balance || 0).toLocaleString()}`
      );
    });

    console.log("\n❌ Will delete these accounts:");
    toDelete.forEach((acc, i) => {
      console.log(
        `   ${i + 1}. ${acc.displayName} (${acc.accountType}) - $${(acc.balance || 0).toLocaleString()}`
      );
    });

    return deleteExtraAccounts(toDelete);
  } else {
    console.log("✅ Account count is correct!");
  }
}

async function deleteExtraAccounts(accountsToDelete) {
  if (accountsToDelete.length === 0) return;

  console.log(`\n🗑️  Deleting ${accountsToDelete.length} extra accounts...`);

  const batch = writeBatch(db);
  for (const account of accountsToDelete) {
    console.log(`   Deleting ${account.displayName}...`);
    const accountRef = doc(db, "accounts", account.id);
    batch.delete(accountRef);
  }

  await batch.commit();
  console.log("✅ Successfully deleted extra accounts!");
  console.log("🎉 Dashboard should now show exactly 3 accounts!");
}

// Run the script
console.log("🚀 Finding User and Fixing Dashboard Accounts...\n");
findUserAndFixAccounts()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
