#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
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

async function auditAndFixCustomerAdminAssignments() {
  try {
    console.log("🔍 Auditing Customer-Admin Data Isolation...\n");
    
    // 1. Get all users
    console.log("👥 Loading all users...");
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    const users = [];
    const admins = [];
    const customers = [];
    
    usersSnapshot.forEach((doc) => {
      const user = { id: doc.id, uid: doc.id, ...doc.data() };
      users.push(user);
      
      if (user.role === "admin") {
        admins.push(user);
      } else if (user.role === "customer") {
        customers.push(user);
      }
    });
    
    console.log(`📊 Total users: ${users.length}`);
    console.log(`👩‍💼 Admins: ${admins.length}`);
    console.log(`👥 Customers: ${customers.length}\n`);
    
    // 2. Get all admin assignments
    console.log("🔗 Loading admin assignments...");
    const assignmentsRef = collection(db, "adminAssignments");
    const assignmentsSnapshot = await getDocs(assignmentsRef);
    
    const assignments = [];
    assignmentsSnapshot.forEach((doc) => {
      assignments.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📋 Total assignments: ${assignments.length}\n`);
    
    // 3. Show current assignments
    if (assignments.length > 0) {
      console.log("📋 Current Admin-Customer Assignments:");
      console.log("═══════════════════════════════════════");
      
      assignments.forEach((assignment, index) => {
        const admin = admins.find(a => a.id === assignment.adminId || a.uid === assignment.adminId);
        const customer = customers.find(c => c.id === assignment.customerId || c.uid === assignment.customerId);
        
        console.log(`${index + 1}. Assignment ID: ${assignment.id}`);
        console.log(`   Admin: ${admin ? `${admin.firstName} ${admin.lastName} (${admin.email})` : assignment.adminId}`);
        console.log(`   Customer: ${customer ? `${customer.firstName} ${customer.lastName} (${customer.email})` : assignment.customerId}`);
        console.log(`   Active: ${assignment.isActive !== false}`);
        console.log(`   Created: ${assignment.createdAt ? new Date(assignment.createdAt.seconds * 1000).toISOString() : 'Unknown'}`);
        console.log("");
      });
    } else {
      console.log("⚠️  No admin assignments found!");
    }
    
    // 4. Check for unassigned customers
    const assignedCustomerIds = assignments.map(a => a.customerId);
    const unassignedCustomers = customers.filter(c => !assignedCustomerIds.includes(c.id) && !assignedCustomerIds.includes(c.uid));
    
    console.log("👥 Unassigned Customers:");
    console.log("═══════════════════════");
    if (unassignedCustomers.length > 0) {
      unassignedCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.firstName} ${customer.lastName} (${customer.email})`);
        console.log(`   UID: ${customer.id}`);
      });
    } else {
      console.log("✅ All customers are assigned to admins");
    }
    console.log("");
    
    // 5. Check for unassigned admins
    const assignedAdminIds = assignments.map(a => a.adminId);
    const unassignedAdmins = admins.filter(a => !assignedAdminIds.includes(a.id) && !assignedAdminIds.includes(a.uid));
    
    console.log("👩‍💼 Unassigned Admins:");
    console.log("═══════════════════════");
    if (unassignedAdmins.length > 0) {
      unassignedAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
        console.log(`   UID: ${admin.id}`);
      });
    } else {
      console.log("✅ All admins are assigned to customers");
    }
    console.log("");
    
    // 6. Check accounts per customer
    console.log("💳 Customer Account Analysis:");
    console.log("════════════════════════════");
    
    const accountsRef = collection(db, "accounts");
    const accountsSnapshot = await getDocs(accountsRef);
    
    const accountsByCustomer = new Map();
    accountsSnapshot.forEach((doc) => {
      const account = doc.data();
      const customerId = account.customerUID || account.userId;
      
      if (!accountsByCustomer.has(customerId)) {
        accountsByCustomer.set(customerId, []);
      }
      accountsByCustomer.get(customerId).push({
        id: doc.id,
        type: account.accountType,
        balance: account.balance || 0,
        displayName: account.displayName || account.accountName
      });
    });
    
    for (const customer of customers) {
      const customerAccounts = accountsByCustomer.get(customer.id) || [];
      console.log(`👤 ${customer.firstName} ${customer.lastName} (${customer.email})`);
      console.log(`   UID: ${customer.id}`);
      console.log(`   Accounts: ${customerAccounts.length}`);
      
      if (customerAccounts.length > 0) {
        customerAccounts.forEach(acc => {
          console.log(`      - ${acc.displayName || acc.type}: $${acc.balance.toLocaleString()}`);
        });
      } else {
        console.log(`      ⚠️  No accounts found!`);
      }
      
      // Check if customer has an admin assignment
      const hasAssignment = assignments.find(a => a.customerId === customer.id || a.customerId === customer.uid);
      if (hasAssignment) {
        const admin = admins.find(a => a.id === hasAssignment.adminId || a.uid === hasAssignment.adminId);
        console.log(`   👩‍💼 Admin: ${admin ? `${admin.firstName} ${admin.lastName}` : hasAssignment.adminId}`);
      } else {
        console.log(`   ❌ No admin assigned!`);
      }
      console.log("");
    }
    
    // 7. Recommendations
    console.log("💡 Recommendations:");
    console.log("═══════════════════");
    
    if (unassignedCustomers.length > 0) {
      console.log(`⚠️  ${unassignedCustomers.length} customers need admin assignment`);
    }
    
    if (unassignedAdmins.length > 0) {
      console.log(`⚠️  ${unassignedAdmins.length} admins need customer assignment`);
    }
    
    const customersWithoutAccounts = customers.filter(c => {
      const customerAccounts = accountsByCustomer.get(c.id) || [];
      return customerAccounts.length === 0;
    });
    
    if (customersWithoutAccounts.length > 0) {
      console.log(`⚠️  ${customersWithoutAccounts.length} customers have no accounts`);
    }
    
    if (unassignedCustomers.length === 0 && unassignedAdmins.length === 0 && customersWithoutAccounts.length === 0) {
      console.log("✅ Data isolation is properly configured!");
      console.log("✅ All customers have admin assignments");
      console.log("✅ All customers have accounts");
      console.log("✅ Dashboard data isolation should work correctly");
    }
    
  } catch (error) {
    console.error("❌ Error auditing customer-admin assignments:", error);
    process.exit(1);
  }
}

// Run the audit
console.log("🚀 Starting Customer-Admin Data Isolation Audit...\n");
auditAndFixCustomerAdminAssignments()
  .then(() => {
    console.log("\n✅ Audit completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Audit failed:", error);
    process.exit(1);
  });