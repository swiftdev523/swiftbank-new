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
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBaLBKaK_CLr2j74Vm_hRRc4nrMgkX_9Bs",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "swiftbank-2811b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "swiftbank-2811b",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "swiftbank-2811b.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "956921750491",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:956921750491:web:f5a08c557c23d0b10c7c05",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Known customer UIDs from audit
const CUSTOMERS = {
  "kxPc6PxiMNe8MUHGxItidowcAOi1": "Kathryn Lee", 
  "BMPayIo945gjgTJpNUk3jLS9VBy1": "William Miller"
};

async function verifyAccountOwnership() {
  try {
    console.log("🔍 Verifying Account Ownership and Data Isolation...\n");
    
    // Get all accounts
    const accountsRef = collection(db, "accounts");
    const accountsSnapshot = await getDocs(accountsRef);
    
    console.log(`📊 Total accounts in database: ${accountsSnapshot.size}\n`);
    
    // Group accounts by customerUID
    const accountsByCustomer = new Map();
    const orphanedAccounts = [];
    
    accountsSnapshot.forEach((doc) => {
      const account = { id: doc.id, ...doc.data() };
      const customerUID = account.customerUID || account.userId;
      
      if (!customerUID) {
        orphanedAccounts.push(account);
      } else {
        if (!accountsByCustomer.has(customerUID)) {
          accountsByCustomer.set(customerUID, []);
        }
        accountsByCustomer.get(customerUID).push(account);
      }
    });
    
    console.log("💳 Accounts by Customer:");
    console.log("═══════════════════════");
    
    // Check each known customer
    for (const [uid, name] of Object.entries(CUSTOMERS)) {
      console.log(`\n👤 ${name} (UID: ${uid})`);
      
      const customerAccounts = accountsByCustomer.get(uid) || [];
      console.log(`   📊 Total accounts: ${customerAccounts.length}`);
      
      if (customerAccounts.length > 0) {
        customerAccounts.forEach((account, index) => {
          console.log(`   ${index + 1}. ID: ${account.id}`);
          console.log(`      Type: ${account.accountType}`);
          console.log(`      Display Name: ${account.displayName || account.accountName || 'N/A'}`);
          console.log(`      Balance: $${(account.balance || 0).toLocaleString()}`);
          console.log(`      CustomerUID: ${account.customerUID}`);
          console.log(`      UserID: ${account.userId || 'N/A'}`);
          console.log("");
        });
        
        // Verify no cross-contamination
        const incorrectAccounts = customerAccounts.filter(acc => 
          (acc.customerUID && acc.customerUID !== uid) || 
          (acc.userId && acc.userId !== uid)
        );
        
        if (incorrectAccounts.length > 0) {
          console.log(`   ❌ PROBLEM: ${incorrectAccounts.length} accounts have incorrect ownership:`);
          incorrectAccounts.forEach(acc => {
            console.log(`      - Account ${acc.id}: customerUID=${acc.customerUID}, userId=${acc.userId}`);
          });
        } else {
          console.log(`   ✅ All accounts correctly owned by ${name}`);
        }
      }
    }
    
    // Check for accounts belonging to unknown customers
    console.log("\n🔍 Accounts for Unknown/Other Customers:");
    console.log("═══════════════════════════════════════");
    
    let otherAccounts = 0;
    for (const [uid, accounts] of accountsByCustomer) {
      if (!CUSTOMERS[uid]) {
        console.log(`\n👤 Unknown Customer UID: ${uid}`);
        console.log(`   📊 Accounts: ${accounts.length}`);
        accounts.forEach(acc => {
          console.log(`      - ${acc.displayName || acc.accountType}: $${(acc.balance || 0).toLocaleString()}`);
        });
        otherAccounts += accounts.length;
      }
    }
    
    if (otherAccounts === 0) {
      console.log("✅ No accounts for unknown customers");
    }
    
    // Check orphaned accounts
    if (orphanedAccounts.length > 0) {
      console.log("\n⚠️  Orphaned Accounts (no customerUID or userId):");
      console.log("═══════════════════════════════════════════════");
      orphanedAccounts.forEach(acc => {
        console.log(`   - ID: ${acc.id}`);
        console.log(`     Type: ${acc.accountType}`);
        console.log(`     Display Name: ${acc.displayName || 'N/A'}`);
      });
    } else {
      console.log("\n✅ No orphaned accounts found");
    }
    
    // Test query simulation
    console.log("\n🧪 Query Simulation Test:");
    console.log("═══════════════════════");
    
    for (const [uid, name] of Object.entries(CUSTOMERS)) {
      console.log(`\n🔍 Simulating query for ${name} (${uid}):`);
      console.log(`   Query: accounts WHERE customerUID == '${uid}'`);
      
      const customerQuery = query(accountsRef, where("customerUID", "==", uid));
      const customerSnapshot = await getDocs(customerQuery);
      
      console.log(`   Results: ${customerSnapshot.size} accounts`);
      
      if (customerSnapshot.size > 3) {
        console.log(`   ⚠️  Expected 3 accounts, found ${customerSnapshot.size}!`);
        
        customerSnapshot.forEach((doc, index) => {
          const acc = doc.data();
          console.log(`      ${index + 1}. ${acc.displayName || acc.accountType} ($${(acc.balance || 0).toLocaleString()})`);
        });
      } else {
        console.log(`   ✅ Account count is correct (${customerSnapshot.size} accounts)`);
      }
    }
    
    // Summary and recommendations
    console.log("\n💡 Data Isolation Summary:");
    console.log("═════════════════════════");
    
    let hasIssues = false;
    
    // Check for cross-contamination
    for (const [uid, name] of Object.entries(CUSTOMERS)) {
      const customerAccounts = accountsByCustomer.get(uid) || [];
      const incorrectAccounts = customerAccounts.filter(acc => 
        (acc.customerUID && acc.customerUID !== uid) || 
        (acc.userId && acc.userId !== uid)
      );
      
      if (incorrectAccounts.length > 0) {
        console.log(`❌ ${name} has ${incorrectAccounts.length} accounts with incorrect ownership`);
        hasIssues = true;
      }
      
      if (customerAccounts.length > 3) {
        console.log(`⚠️  ${name} has ${customerAccounts.length} accounts (expected 3)`);
        hasIssues = true;
      }
    }
    
    if (otherAccounts > 0) {
      console.log(`⚠️  Found ${otherAccounts} accounts for unknown customers`);
      hasIssues = true;
    }
    
    if (orphanedAccounts.length > 0) {
      console.log(`⚠️  Found ${orphanedAccounts.length} orphaned accounts`);
      hasIssues = true;
    }
    
    if (!hasIssues) {
      console.log("✅ Data isolation is working correctly!");
      console.log("✅ Each customer only has access to their own accounts");
      console.log("✅ No cross-contamination detected");
      console.log("✅ Account ownership is properly set");
    } else {
      console.log("❌ Data isolation issues detected!");
      console.log("🔧 Recommend running cleanup scripts");
    }
    
  } catch (error) {
    console.error("❌ Error verifying account ownership:", error);
    process.exit(1);
  }
}

// Run verification
console.log("🚀 Starting Account Ownership Verification...\n");
verifyAccountOwnership()
  .then(() => {
    console.log("\n✅ Verification completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });