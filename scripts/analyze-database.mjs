#!/usr/bin/env node
/**
 * Comprehensive Database Analysis Script
 * - Analyzes all users created by developer
 * - Identifies duplicates, assignment issues, and data inconsistencies
 * - Provides detailed report for fixing
 */

import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

try {
  dotenv.config();
} catch {}

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const DEV_EMAIL = process.env.DEV_EMAIL;
const DEV_PASSWORD = process.env.DEV_PASSWORD;

async function run() {
  console.log("🔍 Comprehensive Database Analysis");

  // Sign in
  console.log("🔐 Signing in as developer:", DEV_EMAIL);
  const cred = await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  const actualUID = cred.user.uid;
  console.log("👤 Using developer UID:", actualUID);

  // Get all users created by developer
  const q = query(collection(db, "users"), where("createdBy", "==", actualUID));
  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Get all assignments
  const assignQuery = query(
    collection(db, "adminAssignments"),
    where("developerId", "==", actualUID)
  );
  const assignSnapshot = await getDocs(assignQuery);
  const assignments = assignSnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  console.log(`\n📊 ANALYSIS RESULTS:`);
  console.log(`═══════════════════════════════════════`);

  // Separate by role
  const admins = users.filter(
    (u) => u.role === "admin" && u.isActive !== false
  );
  const customers = users.filter(
    (u) => u.role === "customer" && u.isActive !== false
  );
  const activeAssignments = assignments.filter((a) => a.isActive !== false);

  console.log(`📈 Summary:`);
  console.log(`   Admins: ${admins.length}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Assignments: ${activeAssignments.length}`);

  // Check for duplicate emails
  console.log(`\n🔍 DUPLICATE ANALYSIS:`);
  console.log(`═══════════════════════════════════════`);

  const adminEmails = {};
  const customerEmails = {};
  let duplicateAdmins = [];
  let duplicateCustomers = [];

  admins.forEach((admin) => {
    const email = admin.email?.toLowerCase();
    if (email) {
      if (adminEmails[email]) {
        adminEmails[email].push(admin);
        if (!duplicateAdmins.find((d) => d.email === email)) {
          duplicateAdmins.push({ email, users: adminEmails[email] });
        }
      } else {
        adminEmails[email] = [admin];
      }
    }
  });

  customers.forEach((customer) => {
    const email = customer.email?.toLowerCase();
    if (email) {
      if (customerEmails[email]) {
        customerEmails[email].push(customer);
        if (!duplicateCustomers.find((d) => d.email === email)) {
          duplicateCustomers.push({ email, users: customerEmails[email] });
        }
      } else {
        customerEmails[email] = [customer];
      }
    }
  });

  if (duplicateAdmins.length > 0) {
    console.log(`❌ Found ${duplicateAdmins.length} duplicate admin emails:`);
    duplicateAdmins.forEach((dup) => {
      console.log(`   📧 ${dup.email}:`);
      dup.users.forEach((user, idx) => {
        console.log(
          `      ${idx + 1}. ID: ${user.id} | Created: ${user.createdAt?.toDate?.()?.toISOString() || "N/A"}`
        );
      });
    });
  } else {
    console.log(`✅ No duplicate admin emails found`);
  }

  if (duplicateCustomers.length > 0) {
    console.log(
      `❌ Found ${duplicateCustomers.length} duplicate customer emails:`
    );
    duplicateCustomers.forEach((dup) => {
      console.log(`   📧 ${dup.email}:`);
      dup.users.forEach((user, idx) => {
        console.log(
          `      ${idx + 1}. ID: ${user.id} | Created: ${user.createdAt?.toDate?.()?.toISOString() || "N/A"}`
        );
      });
    });
  } else {
    console.log(`✅ No duplicate customer emails found`);
  }

  // Assignment analysis
  console.log(`\n🔗 ASSIGNMENT ANALYSIS:`);
  console.log(`═══════════════════════════════════════`);

  let unassignedAdmins = [];
  let unassignedCustomers = [];
  let orphanedAssignments = [];

  admins.forEach((admin) => {
    const hasAssignment = activeAssignments.find(
      (a) => a.adminId === admin.id || a.adminId === admin.uid
    );
    if (!hasAssignment) {
      unassignedAdmins.push(admin);
    }
  });

  customers.forEach((customer) => {
    const hasAssignment = activeAssignments.find(
      (a) => a.customerId === customer.id || a.customerId === customer.uid
    );
    if (!hasAssignment) {
      unassignedCustomers.push(customer);
    }
  });

  activeAssignments.forEach((assignment) => {
    const adminExists = admins.find(
      (a) => a.id === assignment.adminId || a.uid === assignment.adminId
    );
    const customerExists = customers.find(
      (c) => c.id === assignment.customerId || c.uid === assignment.customerId
    );
    if (!adminExists || !customerExists) {
      orphanedAssignments.push(assignment);
    }
  });

  console.log(`👩‍💼 Unassigned Admins: ${unassignedAdmins.length}`);
  unassignedAdmins.forEach((admin) => {
    console.log(`   - ${admin.email || admin.id} (ID: ${admin.id})`);
  });

  console.log(`👥 Unassigned Customers: ${unassignedCustomers.length}`);
  unassignedCustomers.forEach((customer) => {
    console.log(`   - ${customer.email || customer.id} (ID: ${customer.id})`);
  });

  console.log(`🔗 Orphaned Assignments: ${orphanedAssignments.length}`);
  orphanedAssignments.forEach((assignment) => {
    console.log(
      `   - Admin ID: ${assignment.adminId} | Customer ID: ${assignment.customerId}`
    );
  });

  // Data consistency check
  console.log(`\n🔧 DATA CONSISTENCY:`);
  console.log(`═══════════════════════════════════════`);

  let inconsistentUsers = [];
  [...admins, ...customers].forEach((user) => {
    const issues = [];
    if (!user.role) issues.push("missing role");
    if (!user.createdBy) issues.push("missing createdBy");
    if (user.isActive === undefined) issues.push("missing isActive");
    if (!user.email) issues.push("missing email");

    if (issues.length > 0) {
      inconsistentUsers.push({ user, issues });
    }
  });

  if (inconsistentUsers.length > 0) {
    console.log(`❌ Found ${inconsistentUsers.length} users with data issues:`);
    inconsistentUsers.forEach((item) => {
      console.log(
        `   📧 ${item.user.email || item.user.id}: ${item.issues.join(", ")}`
      );
    });
  } else {
    console.log(`✅ All users have consistent data structure`);
  }

  console.log(`\n📋 RECOMMENDED ACTIONS:`);
  console.log(`═══════════════════════════════════════`);

  if (duplicateAdmins.length > 0) {
    console.log(`🎯 1. Remove duplicate admin accounts (keep newest)`);
  }
  if (duplicateCustomers.length > 0) {
    console.log(`🎯 2. Remove duplicate customer accounts (keep newest)`);
  }
  if (unassignedAdmins.length > 0 || unassignedCustomers.length > 0) {
    console.log(`🎯 3. Create missing admin-customer assignments`);
  }
  if (orphanedAssignments.length > 0) {
    console.log(`🎯 4. Clean up orphaned assignments`);
  }
  if (inconsistentUsers.length > 0) {
    console.log(`🎯 5. Fix data consistency issues`);
  }

  console.log(
    `\n✅ Analysis complete. Run 'node scripts/fix-database-issues.mjs' to apply fixes.`
  );
}

run().catch((err) => {
  console.error("💥 Analysis failed:", err.message);
  process.exit(1);
});
