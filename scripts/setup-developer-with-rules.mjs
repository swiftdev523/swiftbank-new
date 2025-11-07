#!/usr/bin/env node

/**
 * Developer Setup with Temporary Rules
 *
 * This script:
 * 1. Temporarily deploys permissive Firestore rules
 * 2. Creates developer documents
 * 3. Restores original security rules
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { execSync } from "child_process";
import { copyFileSync } from "fs";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaLBKaK_CLr2j74Vm_hRRc4nrMgkX_9Bs",
  authDomain: "swiftbank-2811b.firebaseapp.com",
  projectId: "swiftbank-2811b",
  storageBucket: "swiftbank-2811b.firebasestorage.app",
  messagingSenderId: "787764194169",
  appId: "1:787764194169:web:19ccc445fb743f71ea5da8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Developer details from Firebase Auth
const DEVELOPER_UID = "XImTwn30xsfGBDXN9PxoMzr6p4y2";
const DEVELOPER_EMAIL = "developer@swiftbank.com";

async function setupDeveloperWithTemporaryRules() {
  try {
    console.log("🚀 Setting up developer with temporary rules...");
    console.log("");

    // Step 1: Backup current rules
    console.log("📋 Backing up current Firestore rules...");
    copyFileSync("firestore.rules", "firestore.rules.backup");
    console.log("✅ Rules backed up to firestore.rules.backup");

    // Step 2: Deploy temporary permissive rules
    console.log("🔧 Deploying temporary setup rules...");
    copyFileSync("firestore.rules.setup", "firestore.rules");

    try {
      execSync("firebase deploy --only firestore:rules", { stdio: "inherit" });
      console.log("✅ Temporary rules deployed");
    } catch (error) {
      console.log(
        "⚠️  Firebase CLI not available, trying direct document creation..."
      );
    }

    // Wait a moment for rules to propagate
    console.log("⏳ Waiting for rules to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 3: Create developer documents
    console.log("📝 Creating developer documents...");

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

    // Step 4: Restore original rules
    console.log("🔒 Restoring original Firestore rules...");
    copyFileSync("firestore.rules.backup", "firestore.rules");

    try {
      execSync("firebase deploy --only firestore:rules", { stdio: "inherit" });
      console.log("✅ Original rules restored");
    } catch (error) {
      console.log("⚠️  Could not auto-restore rules via Firebase CLI");
      console.log("   Please manually deploy the original rules");
    }

    console.log("");
    console.log("🎉 Developer setup completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`   Email: ${DEVELOPER_EMAIL}`);
    console.log(`   UID: ${DEVELOPER_UID}`);
    console.log(`   Role: developer`);
    console.log("");
    console.log("🔗 Next steps:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Navigate to: http://localhost:5173/developer/login");
    console.log("   3. Login with your developer credentials");
    console.log("   4. Create admin-customer pairs from the dashboard");
  } catch (error) {
    console.error("💥 Error during setup:", error.message);

    // Try to restore rules on error
    try {
      console.log("🔄 Attempting to restore original rules...");
      copyFileSync("firestore.rules.backup", "firestore.rules");
      execSync("firebase deploy --only firestore:rules", { stdio: "inherit" });
      console.log("✅ Original rules restored after error");
    } catch (restoreError) {
      console.error("⚠️  Could not restore rules automatically");
      console.error(
        "   Please manually restore firestore.rules from firestore.rules.backup"
      );
    }

    throw error;
  }
}

// Run the setup
setupDeveloperWithTemporaryRules()
  .then(() => {
    console.log("🏁 Setup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  });
