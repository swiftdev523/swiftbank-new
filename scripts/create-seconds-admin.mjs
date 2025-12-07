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
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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

console.log("🔧 Creating Seconds Wave Admin Account");

async function createSecondsWaveAdmin() {
  try {
    // Get credentials from environment variables or command line
    const email = process.env.ADMIN_EMAIL || "admin@swiftbank.com";
    const password = process.env.ADMIN_PASSWORD || generateSecurePassword();

    console.log(`📧 Creating admin account: ${email}`);
    console.log(`🔑 Password will be generated securely`);

    // Helper function to generate secure password
    function generateSecurePassword() {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    }

    // First, check if user document already exists
    console.log("\n📋 Checking existing user document...");
    const userDoc = await getDoc(doc(db, "users", expectedUID));

    if (userDoc.exists()) {
      console.log("✅ User document already exists:", userDoc.data());
    } else {
      console.log("❌ User document doesn't exist. Will create it.");
    }

    // Create the authentication account
    console.log("\n🔐 Creating Firebase Authentication account...");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log(`✅ Authentication account created!`);
      console.log(`📋 New UID: ${user.uid}`);
      console.log(`📧 Email: ${user.email}`);

      // Check if the UID matches what we expect
      if (user.uid !== expectedUID) {
        console.log(
          `⚠️ WARNING: New UID (${user.uid}) doesn't match expected UID (${expectedUID})`
        );
        console.log(
          "This means we need to update the assignments to use the new UID."
        );
      }

      // Create/update the user document in Firestore
      console.log("\n📄 Creating/updating user document...");
      const userData = {
        id: user.uid,
        uid: user.uid,
        email: email,
        name: "Seconds Wave",
        role: "admin",
        isActive: true,
        isVerified: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedCustomer: "aeo1trVxV4adGf0N3hWHD8VNrHY2", // William Miller
        permissions: [
          "user_management",
          "account_management",
          "customer_support",
        ],
      };

      await setDoc(doc(db, "users", user.uid), userData);
      console.log("✅ User document created/updated");

      // Test login
      console.log("\n🧪 Testing login...");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login test successful!");

      console.log(
        `\n🎉 SUCCESS! Seconds Wave admin account created successfully.`
      );
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`🆔 UID: ${user.uid}`);

      if (user.uid !== expectedUID) {
        console.log(
          `\n⚠️ IMPORTANT: The new UID (${user.uid}) is different from the expected UID (${expectedUID}).`
        );
        console.log(
          "You'll need to update the admin assignments to use the new UID."
        );
      } else {
        console.log(
          "\n✅ UID matches expected value. Admin should be able to see William Miller customer."
        );
      }
    } catch (authError) {
      if (authError.code === "auth/email-already-in-use") {
        console.log("✅ Account already exists. Testing login...");
        try {
          await signInWithEmailAndPassword(auth, email, password);
          console.log(`✅ Login successful with password: ${password}`);
          console.log("🎉 Admin account is ready to use!");
        } catch (loginError) {
          console.log(`❌ Login failed: ${loginError.message}`);
          console.log(
            "💡 Try different passwords or use the admin-tools.html page to reset the password."
          );
        }
      } else {
        throw authError;
      }
    }
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
  }
}

// Run the creation process
createSecondsWaveAdmin();
