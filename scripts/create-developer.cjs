#!/usr/bin/env node

/**
 * Developer Account Creation Script
 *
 * This script creates a developer account in the banking platform.
 * Only run this script if you need to create a new developer account.
 *
 * Usage: node scripts/create-developer.js --email=dev@company.com --password=secure123 --name="John Developer"
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, "../firebase-admin-key.json");

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization failed:");
    console.error(
      "   Make sure firebase-admin-key.json exists in the project root"
    );
    console.error(
      "   Download it from Firebase Console > Project Settings > Service Accounts"
    );
    process.exit(1);
  }
}

const auth = admin.auth();
const firestore = admin.firestore();

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      args[key.replace("--", "")] = value;
    }
  });
  return args;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Create developer account
async function createDeveloper(email, password, firstName, lastName) {
  try {
    console.log("🚀 Creating developer account...");

    // Validate inputs
    if (!email || !password || !firstName) {
      throw new Error("Email, password, and first name are required");
    }

    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Create Firebase Auth user
    console.log(`📧 Creating Firebase Auth user for ${email}...`);
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName || ""}`.trim(),
    });

    console.log(`✅ Firebase Auth user created with UID: ${userRecord.uid}`);

    // Create developer document in Firestore
    console.log("📝 Creating developer document in Firestore...");
    const developerData = {
      uid: userRecord.uid,
      email: email,
      firstName: firstName,
      lastName: lastName || "",
      role: "developer",
      permissions: ["*"], // Developer has all permissions
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      lastLogin: null,
    };

    await firestore
      .collection("developers")
      .doc(userRecord.uid)
      .set(developerData);
    console.log("✅ Developer document created in Firestore");

    // Also create a user document for role resolution
    console.log("👤 Creating user document for role resolution...");
    const userData = {
      uid: userRecord.uid,
      email: email,
      firstName: firstName,
      lastName: lastName || "",
      role: "developer",
      permissions: ["*"],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    };

    await firestore.collection("users").doc(userRecord.uid).set(userData);
    console.log("✅ User document created for role resolution");

    // Set custom claims for the user
    console.log("🔑 Setting custom claims...");
    await auth.setCustomUserClaims(userRecord.uid, {
      developer: true,
      role: "developer",
    });
    console.log("✅ Custom claims set");

    console.log("\\n🎉 Developer account created successfully!");
    console.log("📋 Account Details:");
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${firstName} ${lastName || ""}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Role: Developer`);
    console.log("\\n🔗 Access URLs:");
    console.log(
      `   Developer Login: ${process.env.VITE_APP_URL || "http://localhost:5173"}/developer/login`
    );
    console.log(
      `   Developer Dashboard: ${process.env.VITE_APP_URL || "http://localhost:5173"}/developer/dashboard`
    );

    return {
      uid: userRecord.uid,
      email: email,
      name: `${firstName} ${lastName || ""}`.trim(),
    };
  } catch (error) {
    console.error("❌ Error creating developer account:");
    console.error(`   ${error.message}`);

    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }

    throw error;
  }
}

// List existing developers
async function listDevelopers() {
  try {
    console.log("📋 Listing existing developers...");

    const developersSnapshot = await firestore.collection("developers").get();

    if (developersSnapshot.empty) {
      console.log("ℹ️  No developers found in the system");
      return [];
    }

    console.log(`\\n👥 Found ${developersSnapshot.size} developer(s):`);
    const developers = [];

    developersSnapshot.forEach((doc) => {
      const data = doc.data();
      developers.push(data);

      console.log(`\\n📧 ${data.email}`);
      console.log(`   Name: ${data.firstName} ${data.lastName || ""}`);
      console.log(`   UID: ${data.uid}`);
      console.log(`   Status: ${data.isActive ? "Active" : "Inactive"}`);
      console.log(
        `   Created: ${data.createdAt?.toDate?.()?.toLocaleString() || "Unknown"}`
      );
    });

    return developers;
  } catch (error) {
    console.error("❌ Error listing developers:", error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    const args = parseArgs();

    // Show help
    if (args.help || args.h) {
      console.log("\\n🏦 Developer Account Creation Script");
      console.log("\\nUsage:");
      console.log(
        '  node scripts/create-developer.js --email=dev@company.com --password=secure123 --firstName="John" --lastName="Developer"'
      );
      console.log("\\nOptions:");
      console.log("  --email        Developer email address (required)");
      console.log(
        "  --password     Developer password (required, min 6 chars)"
      );
      console.log("  --firstName    Developer first name (required)");
      console.log("  --lastName     Developer last name (optional)");
      console.log("  --list         List existing developers");
      console.log("  --help, -h     Show this help message");
      console.log("\\nExamples:");
      console.log(
        '  node scripts/create-developer.js --email=dev@swiftbank.com --password=developer123 --firstName="Lead" --lastName="Developer"'
      );
      console.log("  node scripts/create-developer.js --list");
      return;
    }

    // List developers
    if (args.list) {
      await listDevelopers();
      return;
    }

    // Create developer
    if (!args.email || !args.password || !args.firstName) {
      console.error("❌ Missing required arguments");
      console.error("   Run with --help for usage information");
      process.exit(1);
    }

    await createDeveloper(
      args.email,
      args.password,
      args.firstName,
      args.lastName
    );
  } catch (error) {
    console.error("\\n💥 Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createDeveloper,
  listDevelopers,
};
