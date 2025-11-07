#!/usr/bin/env node
import dotenv from "dotenv";
import minimist from "minimist";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
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

const argv = minimist(process.argv.slice(2));

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const DEV_UID =
  argv._[0] || process.env.DEV_UID || "XImTwn30XsfgBDXNP9XoMzYbXZ53";
const DEV_EMAIL = argv.email || process.env.DEV_EMAIL;
const DEV_PASSWORD = argv.password || process.env.DEV_PASSWORD;

async function run() {
  console.log("🔎 Verifying developer data for UID:", DEV_UID);

  let actualDevUID = DEV_UID;

  // Optional sign-in to satisfy Firestore security rules
  if (DEV_EMAIL && DEV_PASSWORD) {
    try {
      console.log("🔐 Signing in as developer:", DEV_EMAIL);
      const cred = await signInWithEmailAndPassword(
        auth,
        DEV_EMAIL,
        DEV_PASSWORD
      );
      if (cred?.user?.uid && cred.user.uid !== DEV_UID) {
        console.warn(
          "⚠️ Signed-in UID differs from provided DEV_UID. Using:",
          cred.user.uid
        );
        actualDevUID = cred.user.uid;
      }
    } catch (e) {
      console.error("❌ Developer sign-in failed:", e.message);
    }
  } else {
    console.warn(
      "ℹ️ No DEV_EMAIL/DEV_PASSWORD provided. If rules require auth, queries may fail."
    );
  }

  console.log("👤 Using UID for queries:", actualDevUID);

  // Admins
  try {
    const q1 = query(
      collection(db, "users"),
      where("createdBy", "==", actualDevUID)
    );
    const s1 = await getDocs(q1);
    const admins = s1.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.role === "admin" && d.isActive !== false);
    console.log(`👩‍💼 Admins found: ${admins.length}`);
  } catch (e) {
    console.error("Admins query failed:", e.message);
  }

  // Customers
  try {
    const q2 = query(
      collection(db, "users"),
      where("createdBy", "==", actualDevUID)
    );
    const s2 = await getDocs(q2);
    const customers = s2.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.role === "customer" && d.isActive !== false);
    console.log(`👥 Customers found: ${customers.length}`);
  } catch (e) {
    console.error("Customers query failed:", e.message);
  }

  // Assignments
  try {
    const q3 = query(
      collection(db, "adminAssignments"),
      where("developerId", "==", actualDevUID)
    );
    const s3 = await getDocs(q3);
    const assignments = s3.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => a.isActive !== false);
    console.log(`🔗 Assignments found: ${assignments.length}`);
  } catch (e) {
    console.error("Assignments query failed:", e.message);
  }
}

run().catch((err) => {
  console.error("💥 Verification failed:", err.message);
  process.exit(1);
});
