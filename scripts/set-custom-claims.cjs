#!/usr/bin/env node

/**
 * Check and Set Custom Claims for Users
 * This script requires Firebase Admin SDK with proper credentials
 */

const admin = require("firebase-admin");
const readline = require("readline");

// Initialize Firebase Admin
let app;
try {
  app = admin.app();
} catch (error) {
  app = admin.initializeApp({
    projectId: "swiftbank-2811b",
  });
}

const auth = admin.auth();
const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Expected role assignments based on email
const EXPECTED_ROLES = {
  "developer@swiftbank.com": "developer",
  "seconds@swiftbank.com": "admin",
  "kindestwavelover@gmail.com": "customer",
};

async function checkAndSetCustomClaims() {
  try {
    console.log("🔐 Checking Custom Claims for SwiftBank Users...\n");
    console.log("=".repeat(70));

    // Get all users from auth
    const listUsersResult = await auth.listUsers();
    console.log(
      `\nFound ${listUsersResult.users.length} authentication user(s)\n`
    );

    for (const user of listUsersResult.users) {
      console.log(`\n📧 ${user.email}`);
      console.log(`   UID: ${user.uid}`);

      // Check current custom claims
      const currentClaims = user.customClaims || {};
      console.log(
        `   Current Claims:`,
        Object.keys(currentClaims).length > 0 ? currentClaims : "None"
      );

      // Check expected role
      const expectedRole = EXPECTED_ROLES[user.email];
      if (!expectedRole) {
        console.log(`   ⚠️  No expected role defined for this user`);
        continue;
      }

      console.log(`   Expected Role: ${expectedRole}`);

      // Check if role matches
      const currentRole = currentClaims[expectedRole];
      const roleField = currentClaims.role;

      if (currentRole === true && roleField === expectedRole) {
        console.log(`   ✅ Custom claims are correct`);
      } else {
        console.log(`   ❌ Custom claims need to be updated`);
        console.log(
          `      Need to set: { ${expectedRole}: true, role: '${expectedRole}' }`
        );

        const answer = await question(
          `   Set custom claims for ${user.email}? (y/n): `
        );
        if (answer.toLowerCase() === "y") {
          const claims = {
            [expectedRole]: true,
            role: expectedRole,
          };

          await auth.setCustomUserClaims(user.uid, claims);
          console.log(`   ✅ Custom claims set successfully`);

          // Also update Firestore document
          try {
            const userDocRef = db.collection("users").doc(user.uid);
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {
              await userDocRef.update({
                role: expectedRole,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              console.log(`   ✅ Firestore document updated`);
            } else {
              console.log(`   ⚠️  No Firestore document found - creating one`);
              await userDocRef.set({
                email: user.email,
                role: expectedRole,
                permissions: getPermissionsForRole(expectedRole),
                isActive: true,
                emailVerified: user.emailVerified,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              console.log(`   ✅ Firestore document created`);
            }
          } catch (firestoreError) {
            console.log(
              `   ⚠️  Could not update Firestore:`,
              firestoreError.message
            );
          }
        }
      }

      // Verify Firestore document
      try {
        const userDocRef = db.collection("users").doc(user.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log(`   Firestore Role: ${userData.role || "NOT SET"}`);
          console.log(`   Firestore Active: ${userData.isActive !== false}`);

          if (userData.role !== expectedRole) {
            console.log(`   ⚠️  Firestore role mismatch!`);
          }
        } else {
          console.log(`   ❌ No Firestore document found!`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not check Firestore:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ Custom claims check complete!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.code === "app/invalid-credential") {
      console.log("\n⚠️  Authentication Error!");
      console.log("   You need to set up authentication first:");
      console.log("   1. Download service account key from Firebase Console");
      console.log("   2. Set environment variable:");
      console.log(
        '      $env:GOOGLE_APPLICATION_CREDENTIALS = "path/to/service-account-key.json"'
      );
      console.log("   3. Or run: gcloud auth application-default login");
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

function getPermissionsForRole(role) {
  const permissions = {
    customer: [
      "account_view",
      "transaction_view",
      "transfer",
      "deposit",
      "withdraw",
    ],
    admin: [
      "account_view",
      "account_edit",
      "transaction_view",
      "transaction_approve",
      "user_manage",
      "message_send",
    ],
    developer: ["*"], // All permissions
  };

  return permissions[role] || [];
}

checkAndSetCustomClaims();
