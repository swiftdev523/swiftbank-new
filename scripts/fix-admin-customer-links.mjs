#!/usr/bin/env node
/**
 * Fix Admin-Customer Links
 * Updates user documents to have the correct assignedCustomer/assignedAdmin fields
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
  console.log("🔧 Fix Admin-Customer Links");

  // Sign in
  console.log("🔐 Signing in as developer:", DEV_EMAIL);
  const cred = await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  const actualUID = cred.user.uid;

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

  console.log(`\n🔗 Processing ${assignments.length} assignments...`);

  let updatedAdmins = 0;
  let updatedCustomers = 0;

  for (const assignment of assignments) {
    if (!assignment.isActive) continue;

    const { adminId, customerId, adminEmail, customerEmail } = assignment;

    // Update admin document
    try {
      await updateDoc(doc(db, "users", adminId), {
        assignedCustomer: customerId,
        updatedAt: serverTimestamp(),
      });
      console.log(
        `✅ Updated admin ${adminEmail} -> assignedCustomer: ${customerId}`
      );
      updatedAdmins++;
    } catch (err) {
      console.error(`❌ Failed to update admin ${adminEmail}:`, err.message);
    }

    // Update customer document
    try {
      await updateDoc(doc(db, "users", customerId), {
        assignedAdmin: adminId,
        updatedAt: serverTimestamp(),
      });
      console.log(
        `✅ Updated customer ${customerEmail} -> assignedAdmin: ${adminId}`
      );
      updatedCustomers++;
    } catch (err) {
      console.error(
        `❌ Failed to update customer ${customerEmail}:`,
        err.message
      );
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated ${updatedAdmins} admin documents`);
  console.log(`   Updated ${updatedCustomers} customer documents`);
  console.log(`\n✅ Assignment links fixed!`);
}

run().catch((err) => {
  console.error("💥 Fix failed:", err.message);
  process.exit(1);
});
