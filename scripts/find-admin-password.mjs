#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Import Firebase services
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("🔍 Finding Correct Admin Password and Testing Permissions");

async function testAdminAccess() {
  // Common passwords to try
  const passwords = [
    "admin123",
    "password123",
    "seconds123",
    "123456",
    "password",
    "admin",
    "swift123",
    "swiftbank123",
    "seconds@swiftbank.com",
    "secondswave123",
  ];

  const email = "seconds@swiftbank.com";

  console.log(`🔐 Testing login for: ${email}`);

  for (const password of passwords) {
    try {
      console.log(`\nTrying password: ${password}`);

      // Sign out any previous user
      if (auth.currentUser) {
        await auth.signOut();
      }

      await signInWithEmailAndPassword(auth, email, password);

      console.log(`✅ SUCCESS! Correct password: ${password}`);
      console.log(`👤 User UID: ${auth.currentUser.uid}`);

      // Test permissions
      console.log(`\n🧪 Testing Firestore permissions...`);

      try {
        // Test adminAssignments collection
        console.log("📋 Testing adminAssignments...");
        const assignmentsRef = collection(db, "adminAssignments");
        const assignmentsSnapshot = await getDocs(assignmentsRef);
        console.log(
          `✅ adminAssignments: ${assignmentsSnapshot.size} documents`
        );

        // Test users collection
        console.log("👥 Testing users collection...");
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        console.log(`✅ users: ${usersSnapshot.size} documents`);

        console.log(`\n🎉 PERFECT! Admin can access all required collections.`);
        console.log(`\n📋 LOGIN CREDENTIALS:`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`🆔 UID: ${auth.currentUser.uid}`);

        return password;
      } catch (permError) {
        console.log(`❌ Permission error: ${permError.message}`);
      }
    } catch (authError) {
      console.log(`❌ Auth failed: ${authError.code}`);
    }
  }

  console.log(
    `\n❌ No working password found. The account may need to be reset.`
  );
  return null;
}

// Run the test
testAdminAccess();
