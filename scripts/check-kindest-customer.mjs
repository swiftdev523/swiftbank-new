#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDQyIykkMu8xAFgWAG7c71T2TeCBP7GnZw",
  authDomain: "cl-bank-2b5c7.firebaseapp.com",
  projectId: "cl-bank-2b5c7",
  storageBucket: "cl-bank-2b5c7.firebasestorage.app",
  messagingSenderId: "1062047493720",
  appId: "1:1062047493720:web:54a8ad4a306a7b0db9ad87",
  measurementId: "G-2Y6PTLDGLJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkKindestCustomer() {
  console.log("🔍 Checking kindestwavelover@gmail.com customer setup...\n");

  const email = "kindestwavelover@gmail.com";

  try {
    // 1. Check for user document by email
    console.log("1️⃣ Looking for user document by email...");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      console.log("❌ No user document found with email:", email);
    } else {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      console.log("✅ User document found:");
      console.log("   ID:", userDoc.id);
      console.log("   Role:", userData.role);
      console.log("   Name:", userData.firstName, userData.lastName);
      console.log("   Active:", userData.isActive);
      console.log("   Accounts:", userData.accounts?.length || 0);

      if (userData.accounts && userData.accounts.length > 0) {
        console.log("\n💰 Account details:");
        userData.accounts.forEach((account, index) => {
          console.log(`   Account ${index + 1}:`);
          console.log(`     Type: ${account.accountType}`);
          console.log(`     Number: ${account.accountNumber}`);
          console.log(
            `     Balance: $${account.balance?.toLocaleString() || "0"}`
          );
          console.log(`     Active: ${account.isActive !== false}`);
        });
      }
    }

    // 2. Check accounts collection for separate account docs
    console.log("\n2️⃣ Checking accounts collection...");
    const accountsRef = collection(db, "accounts");
    const accountQuery = query(accountsRef, where("userEmail", "==", email));
    const accountSnapshot = await getDocs(accountQuery);

    if (accountSnapshot.empty) {
      console.log("❌ No separate account documents found");
    } else {
      console.log(`✅ Found ${accountSnapshot.size} account document(s):`);
      accountSnapshot.forEach((accountDoc, index) => {
        const accountData = accountDoc.data();
        console.log(`   Account ${index + 1} (${accountDoc.id}):`);
        console.log(`     Type: ${accountData.accountType}`);
        console.log(`     Number: ${accountData.accountNumber}`);
        console.log(
          `     Balance: $${accountData.balance?.toLocaleString() || "0"}`
        );
        console.log(
          `     User: ${accountData.userId || accountData.userEmail}`
        );
      });
    }

    // 3. Check for any legacy customer docs with similar pattern
    console.log("\n3️⃣ Checking for legacy customer documents...");
    const custQuery = query(
      collection(db, "users"),
      where("role", "==", "customer")
    );
    const custSnapshot = await getDocs(custQuery);

    console.log(`Found ${custSnapshot.size} customer documents total:`);
    custSnapshot.forEach((custDoc) => {
      const custData = custDoc.data();
      console.log(
        `   ${custDoc.id}: ${custData.email} (${custData.firstName} ${custData.lastName})`
      );
      if (custData.email === email) {
        console.log("     ⭐ This is our target customer!");
      }
    });
  } catch (error) {
    console.error("❌ Error checking customer setup:", error);
  }
}

checkKindestCustomer();
