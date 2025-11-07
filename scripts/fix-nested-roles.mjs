#!/usr/bin/env node
/**
 * Fix users with nested profile.role instead of top-level role
 */

import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
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
const DEV_UID = process.env.DEV_UID;

async function run() {
  console.log("🛠️  Fix Nested Role Fields");

  // Sign in
  console.log("🔐 Signing in as developer:", DEV_EMAIL);
  const cred = await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  const actualUID = cred.user.uid;
  console.log("👤 Using developer UID:", actualUID);

  // Get all users
  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log(`📋 Found ${users.length} total users`);

  let fixedCount = 0;

  for (const user of users) {
    const needsUpdate = {};

    // Check if role is nested in profile but missing at top level
    if (!user.role && user.profile?.role) {
      needsUpdate.role = user.profile.role;
      console.log(
        `📝 Adding top-level role for ${user.email || user.id}: ${user.profile.role}`
      );
    }

    // Ensure createdBy field exists for admin/customer roles
    if (
      (user.role === "admin" ||
        user.role === "customer" ||
        user.profile?.role === "admin" ||
        user.profile?.role === "customer") &&
      !user.createdBy
    ) {
      needsUpdate.createdBy = actualUID;
      console.log(`📝 Adding createdBy for ${user.email || user.id}`);
    }

    // Ensure isActive field exists
    if (user.isActive === undefined) {
      needsUpdate.isActive = true;
      console.log(`📝 Adding isActive for ${user.email || user.id}`);
    }

    // Apply updates if needed
    if (Object.keys(needsUpdate).length > 0) {
      await updateDoc(doc(db, "users", user.id), {
        ...needsUpdate,
        updatedAt: serverTimestamp(),
      });
      fixedCount++;
      console.log(`✅ Updated user: ${user.email || user.id}`);
    }
  }

  console.log(`🎯 Fixed ${fixedCount} user documents`);
  console.log(
    "✅ Run verification to check results: node scripts/verify-developer-data.mjs"
  );
}

run().catch((err) => {
  console.error("💥 Fix script failed:", err.message);
  process.exit(1);
});
