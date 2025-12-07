#!/usr/bin/env node

/**
 * Manual Developer Setup Script
 *
 * This script creates the necessary Firestore documents for the developer account
 * that was already created in Firebase Auth.
 *
 * Run this after creating the developer in Firebase Auth console.
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get current script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file if it exists
function loadEnvFile() {
  try {
    const envPath = join(__dirname, "..", ".env");
    const envFile = readFileSync(envPath, "utf8");
    const envVars = {};

    envFile.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
      }
    });

    return envVars;
  } catch (error) {
    console.log(
      "⚠️  No .env file found, using environment variables or defaults"
    );
    return {};
  }
}

const envVars = loadEnvFile();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || envVars.VITE_FIREBASE_API_KEY,
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.VITE_FIREBASE_PROJECT_ID || envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || envVars.VITE_FIREBASE_APP_ID,
};

// Validate configuration
if (!firebaseConfig.projectId) {
  console.error(
    "❌ Firebase configuration is missing. Please set up your environment variables."
  );
  console.error(
    "   Required: VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY, etc."
  );
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Developer details from environment variables (secure)
const DEVELOPER_EMAIL =
  process.env.DEVELOPER_EMAIL || "developer@swiftbank.com";
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD;

if (!DEVELOPER_PASSWORD) {
  console.error("❌ DEVELOPER_PASSWORD environment variable is required");
  console.log(
    '💡 Set it with: export DEVELOPER_PASSWORD="your-developer-password"'
  );
  process.exit(1);
}

// UID will be determined after authentication - no hardcoded UIDs

async function createDeveloperDocuments() {
  try {
    console.log("🚀 Setting up developer documents in Firestore...");

    // First, we need to sign in as the developer to ensure we have the right UID
    console.log(`📧 Signing in as ${DEVELOPER_EMAIL}...`);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        DEVELOPER_EMAIL,
        DEVELOPER_PASSWORD
      );
      console.log(`✅ Successfully signed in. UID: ${userCredential.user.uid}`);

      if (userCredential.user.uid !== DEVELOPER_UID) {
        console.log(
          `ℹ️  Note: Using actual UID ${userCredential.user.uid} instead of expected ${DEVELOPER_UID}`
        );
      }

      const actualUID = userCredential.user.uid;

      // Create developer document in 'developers' collection
      console.log("📝 Creating developer document...");
      const developerData = {
        uid: actualUID,
        email: DEVELOPER_EMAIL,
        firstName: "Lead",
        lastName: "Developer",
        role: "developer",
        permissions: ["*"], // Developer has all permissions
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        lastLogin: null,
      };

      await setDoc(doc(db, "developers", actualUID), developerData);
      console.log('✅ Developer document created in "developers" collection');

      // Create user document for role resolution
      console.log("👤 Creating user document for role resolution...");
      const userData = {
        uid: actualUID,
        email: DEVELOPER_EMAIL,
        firstName: "Lead",
        lastName: "Developer",
        role: "developer",
        permissions: ["*"],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      await setDoc(doc(db, "users", actualUID), userData);
      console.log("✅ User document created for role resolution");

      // Create initial developer session
      console.log("🔑 Creating developer session...");
      const sessionData = {
        developerId: actualUID,
        loginTime: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
      };

      await setDoc(doc(db, "developerSessions", actualUID), sessionData);
      console.log("✅ Developer session created");

      console.log("\\n🎉 Developer setup completed successfully!");
      console.log("📋 Developer Details:");
      console.log(`   Email: ${DEVELOPER_EMAIL}`);
      console.log(`   UID: ${actualUID}`);
      console.log(`   Role: Developer`);
      console.log("\\n🔗 You can now access:");
      console.log(`   Developer Login: http://localhost:5173/developer/login`);
      console.log(
        `   Developer Dashboard: http://localhost:5173/developer/dashboard`
      );
      console.log("\\n✨ Next steps:");
      console.log("   1. Login to the developer dashboard");
      console.log("   2. Create admin-customer pairs");
      console.log("   3. Test the complete hierarchy");
    } catch (authError) {
      if (
        authError.code === "auth/wrong-password" ||
        authError.code === "auth/user-not-found"
      ) {
        console.error(
          "❌ Authentication failed. Please check the developer email and password."
        );
        console.error(
          "   Make sure the developer account exists in Firebase Auth."
        );
        console.error(
          "   If the password is different, update it in this script."
        );
      } else {
        console.error("❌ Authentication error:", authError.message);
      }
      throw authError;
    }
  } catch (error) {
    console.error("💥 Error setting up developer:", error.message);
    console.error("\\nTroubleshooting:");
    console.error("1. Make sure Firebase Auth user exists");
    console.error("2. Check that the email and password are correct");
    console.error("3. Verify Firebase configuration");
    console.error("4. Ensure Firestore security rules allow writes");
    throw error;
  }
}

// Alternative method: Create documents with known UID (if auth fails)
async function createDeveloperDocumentsWithKnownUID() {
  try {
    console.log("🔄 Creating developer documents with known UID...");
    console.log(
      "⚠️  Note: This method doesn't verify the developer account exists"
    );

    const developerData = {
      uid: DEVELOPER_UID,
      email: DEVELOPER_EMAIL,
      firstName: "Lead",
      lastName: "Developer",
      role: "developer",
      permissions: ["*"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      lastLogin: null,
    };

    await setDoc(doc(db, "developers", DEVELOPER_UID), developerData);
    console.log("✅ Developer document created");

    const userData = {
      uid: DEVELOPER_UID,
      email: DEVELOPER_EMAIL,
      firstName: "Lead",
      lastName: "Developer",
      role: "developer",
      permissions: ["*"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    await setDoc(doc(db, "users", DEVELOPER_UID), userData);
    console.log("✅ User document created");

    const sessionData = {
      developerId: DEVELOPER_UID,
      loginTime: serverTimestamp(),
      lastActivity: serverTimestamp(),
      isActive: true,
    };

    await setDoc(doc(db, "developerSessions", DEVELOPER_UID), sessionData);
    console.log("✅ Developer session created");

    console.log("\\n🎉 Developer documents created successfully!");
    console.log(`   UID: ${DEVELOPER_UID}`);
    console.log(`   Email: ${DEVELOPER_EMAIL}`);
  } catch (error) {
    console.error("❌ Error creating documents:", error.message);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const useKnownUID = args.includes("--use-known-uid");

// Main execution
async function main() {
  try {
    if (useKnownUID) {
      await createDeveloperDocumentsWithKnownUID();
    } else {
      try {
        await createDeveloperDocuments();
      } catch (authError) {
        console.log(
          "\\n🔄 Authentication failed, trying with known UID method..."
        );
        await createDeveloperDocumentsWithKnownUID();
      }
    }
  } catch (error) {
    console.error("\\n💥 Setup failed:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
