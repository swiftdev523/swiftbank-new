#!/usr/bin/env node
/**
 * Fix Database Issues Script
 * - Removes duplicate admin accounts (keeps newest)
 * - Creates missing admin-customer assignments
 * - Ensures proper data integrity
 */

import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
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
  console.log("🛠️  Fix Database Issues");

  // Sign in
  console.log("🔐 Signing in as developer:", DEV_EMAIL);
  const cred = await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  const actualUID = cred.user.uid;
  console.log("👤 Using developer UID:", actualUID);

  // Get all users and assignments
  const q = query(collection(db, "users"), where("createdBy", "==", actualUID));
  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const assignQuery = query(
    collection(db, "adminAssignments"),
    where("developerId", "==", actualUID)
  );
  const assignSnapshot = await getDocs(assignQuery);
  const assignments = assignSnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const admins = users.filter(
    (u) => u.role === "admin" && u.isActive !== false
  );
  const customers = users.filter(
    (u) => u.role === "customer" && u.isActive !== false
  );

  console.log(`\n🔧 FIXING ISSUES:`);
  console.log(`═══════════════════════════════════════`);

  // 1. Fix duplicate admins
  console.log(`\n1️⃣ Removing duplicate admins...`);
  const adminEmails = {};
  admins.forEach((admin) => {
    const email = admin.email?.toLowerCase();
    if (email) {
      if (!adminEmails[email]) {
        adminEmails[email] = [];
      }
      adminEmails[email].push(admin);
    }
  });

  let deletedCount = 0;
  for (const [email, adminList] of Object.entries(adminEmails)) {
    if (adminList.length > 1) {
      // Sort by creation date, keep newest
      adminList.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // newest first
      });

      console.log(`   📧 ${email}: Found ${adminList.length} duplicates`);

      // Keep the first (newest), delete the rest
      for (let i = 1; i < adminList.length; i++) {
        const adminToDelete = adminList[i];
        console.log(`   🗑️  Deleting older admin: ${adminToDelete.id}`);
        await deleteDoc(doc(db, "users", adminToDelete.id));
        deletedCount++;
      }
    }
  }

  console.log(`✅ Removed ${deletedCount} duplicate admin accounts`);

  // 2. Get updated admin list after deletion
  const updatedSnapshot = await getDocs(q);
  const updatedUsers = updatedSnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  const updatedAdmins = updatedUsers.filter(
    (u) => u.role === "admin" && u.isActive !== false
  );
  const updatedCustomers = updatedUsers.filter(
    (u) => u.role === "customer" && u.isActive !== false
  );

  console.log(`\n2️⃣ Creating missing assignments...`);
  console.log(`   📊 Active admins: ${updatedAdmins.length}`);
  console.log(`   📊 Active customers: ${updatedCustomers.length}`);

  // Strategy: Create 1:1 assignments between admins and customers
  let assignmentCount = 0;
  const maxAssignments = Math.min(
    updatedAdmins.length,
    updatedCustomers.length
  );

  for (let i = 0; i < maxAssignments; i++) {
    const admin = updatedAdmins[i];
    const customer = updatedCustomers[i];

    if (!admin || !customer) continue;

    const assignmentId = `${admin.id}_${customer.id}`;

    // Check if assignment already exists
    const existingAssignment = assignments.find(
      (a) =>
        (a.adminId === admin.id && a.customerId === customer.id) ||
        (a.adminId === admin.uid && a.customerId === customer.uid)
    );

    if (!existingAssignment) {
      console.log(
        `   🔗 Creating assignment: ${admin.email} → ${customer.email}`
      );

      await setDoc(doc(db, "adminAssignments", assignmentId), {
        developerId: actualUID,
        adminId: admin.id,
        customerId: customer.id,
        adminEmail: admin.email,
        customerEmail: customer.email,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      assignmentCount++;
    } else {
      console.log(
        `   ✅ Assignment already exists: ${admin.email} → ${customer.email}`
      );
    }
  }

  // Handle extra admins (if more admins than customers)
  if (updatedAdmins.length > updatedCustomers.length) {
    console.log(
      `   ⚠️  ${updatedAdmins.length - updatedCustomers.length} admins without customers (no assignment created)`
    );
  }

  console.log(`✅ Created ${assignmentCount} new assignments`);

  // 3. Summary
  console.log(`\n📊 FINAL STATUS:`);
  console.log(`═══════════════════════════════════════`);
  console.log(`👩‍💼 Active Admins: ${updatedAdmins.length}`);
  console.log(`👥 Active Customers: ${updatedCustomers.length}`);
  console.log(`🔗 Total Assignments: ${assignments.length + assignmentCount}`);

  console.log(`\n✅ Database fixes completed!`);
  console.log(`\n🔄 Run verification: node scripts/verify-developer-data.mjs`);
  console.log(`🔄 Refresh dashboard to see changes`);
}

run().catch((err) => {
  console.error("💥 Fix script failed:", err.message);
  process.exit(1);
});
