#!/usr/bin/env node
/**
 * Fix Specific Users Script
 * - Target the exact admin and customer visible in Firebase console
 * - Promote profile.role to top-level role
 * - Add missing createdBy, isActive fields
 * - Create adminAssignments if needed
 */

import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
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

async function run() {
  console.log("🎯 Fixing specific users in Firebase console");

  // Sign in as developer
  console.log("🔐 Signing in as developer...");
  const cred = await signInWithEmailAndPassword(
    auth,
    process.env.DEV_EMAIL,
    process.env.DEV_PASSWORD
  );
  const DEV_UID = cred.user.uid;
  console.log("👤 Developer UID:", DEV_UID);

  // Get all users and find the specific ones
  const usersSnapshot = await getDocs(collection(db, "users"));
  const allUsers = usersSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log(`📊 Total users found: ${allUsers.length}`);

  // Find admin and customer by email
  const adminUser = allUsers.find((u) => u.email === "admin@swiftbank.com");
  const customerUser = allUsers.find(
    (u) => u.email === "customer@swiftbank.com"
  );

  if (!adminUser) {
    console.error("❌ Admin user not found with email: admin@swiftbank.com");
    return;
  }

  if (!customerUser) {
    console.error(
      "❌ Customer user not found with email: customer@swiftbank.com"
    );
    return;
  }

  console.log("✅ Found admin:", adminUser.email, "ID:", adminUser.id);
  console.log("✅ Found customer:", customerUser.email, "ID:", customerUser.id);

  // Update admin user
  const adminUpdates = {
    role: adminUser.profile?.role || "admin",
    createdBy: DEV_UID,
    isActive: true,
    assignedCustomer: customerUser.id,
    updatedAt: serverTimestamp(),
  };

  console.log("🛠️  Updating admin document with:", adminUpdates);
  await updateDoc(doc(db, "users", adminUser.id), adminUpdates);

  // Update customer user
  const customerUpdates = {
    role: customerUser.profile?.role || "customer",
    createdBy: DEV_UID,
    isActive: true,
    assignedAdmin: adminUser.id,
    updatedAt: serverTimestamp(),
  };

  console.log("🛠️  Updating customer document with:", customerUpdates);
  await updateDoc(doc(db, "users", customerUser.id), customerUpdates);

  // Create/update adminAssignment
  const assignmentId = `${adminUser.id}_${customerUser.id}`;
  const assignmentData = {
    developerId: DEV_UID,
    adminId: adminUser.id,
    customerId: customerUser.id,
    adminEmail: adminUser.email,
    customerEmail: customerUser.email,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  console.log("🔗 Creating/updating assignment:", assignmentId);
  await setDoc(doc(db, "adminAssignments", assignmentId), assignmentData);

  console.log("✅ All updates completed successfully!");
  console.log("🔄 Run verification script to confirm changes.");
}

run().catch((err) => {
  console.error("💥 Fix failed:", err.message);
  process.exit(1);
});
