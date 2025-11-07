#!/usr/bin/env node

/**
 * Audit all users in Firebase Authentication and Firestore
 * Check roles, permissions, and data consistency
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the exported auth users
const authUsersPath = join(__dirname, "..", "auth-users-export.json");
let authUsersData;
try {
  authUsersData = JSON.parse(readFileSync(authUsersPath, "utf8"));
  console.log("📁 Using exported auth users from auth-users-export.json\n");
} catch (error) {
  console.error("❌ Could not read auth-users-export.json");
  console.error(
    "   Run: firebase auth:export auth-users-export.json --format=json"
  );
  process.exit(1);
}

// For Firestore data, we'll use a workaround
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
let app, db;
try {
  app = admin.app();
  db = admin.firestore();
} catch (error) {
  console.log("⚠️  Firebase Admin SDK not authenticated");
  console.log("   We'll work with exported auth data only\n");
  db = null;
}

console.log("🔍 Starting User Audit for SwiftBank...\n");

async function auditUsers() {
  try {
    // 1. Show all Firebase Auth users from export
    console.log("📋 Firebase Authentication Users:");
    console.log("=".repeat(70));

    const authUsers = authUsersData.users || [];
    console.log(`Found ${authUsers.length} authentication user(s)\n`);

    const authUserMap = new Map();
    authUsers.forEach((user, index) => {
      authUserMap.set(user.localId, user);
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   UID: ${user.localId}`);
      console.log(`   Email Verified: ${user.emailVerified || false}`);
      console.log(`   Disabled: ${user.disabled || false}`);
      const createdDate = new Date(parseInt(user.createdAt));
      const lastSignInDate = new Date(parseInt(user.lastSignedInAt));
      console.log(`   Created: ${createdDate.toLocaleString()}`);
      console.log(`   Last Sign In: ${lastSignInDate.toLocaleString()}`);
      console.log(`   Custom Claims: None (use Firebase console to check)`);
      console.log("");
    });

    if (!db) {
      console.log("\n⚠️  Cannot access Firestore without authentication");
      console.log("   To complete the audit, you need to:");
      console.log("   1. Set up a service account key");
      console.log("   2. Or use: firebase firestore:export firestore-export");
      console.log("\n✅ Auth Users Audit Complete!\n");
      return;
    }

    // 2. Get all Firestore user documents
    console.log("\n📋 Firestore User Documents:");
    console.log("=".repeat(70));

    const usersSnapshot = await db.collection("users").get();
    console.log(`Found ${usersSnapshot.size} user document(s)\n`);

    const firestoreUserMap = new Map();
    usersSnapshot.forEach((doc, index) => {
      const userData = doc.data();
      firestoreUserMap.set(doc.id, userData);

      console.log(`${index + 1}. ${userData.email || "No email"}`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Username: ${userData.username || "N/A"}`);
      console.log(`   Role: ${userData.role || "NOT SET"}`);
      console.log(
        `   Permissions: ${userData.permissions ? userData.permissions.join(", ") : "None"}`
      );
      console.log(`   Active: ${userData.isActive !== false}`);

      if (userData.profile) {
        console.log(
          `   Name: ${userData.profile.firstName || ""} ${userData.profile.lastName || ""}`
        );
      }

      if (userData.accounts && userData.accounts.length > 0) {
        console.log(`   Embedded Accounts: ${userData.accounts.length}`);
      }

      console.log("");
    });

    // 3. Check for mismatches
    console.log("\n🔍 Audit Results:");
    console.log("=".repeat(70));

    // Check Auth users without Firestore docs
    const authWithoutFirestore = [];
    authUserMap.forEach((user, uid) => {
      if (!firestoreUserMap.has(uid)) {
        authWithoutFirestore.push(user);
      }
    });

    if (authWithoutFirestore.length > 0) {
      console.log(
        `\n⚠️  ${authWithoutFirestore.length} Firebase Auth user(s) without Firestore document:`
      );
      authWithoutFirestore.forEach((user) => {
        console.log(`   - ${user.email} (${user.uid})`);
      });
    } else {
      console.log(`\n✅ All Firebase Auth users have Firestore documents`);
    }

    // Check Firestore docs without Auth users
    const firestoreWithoutAuth = [];
    firestoreUserMap.forEach((userData, uid) => {
      if (!authUserMap.has(uid)) {
        firestoreWithoutAuth.push({ uid, email: userData.email });
      }
    });

    if (firestoreWithoutAuth.length > 0) {
      console.log(
        `\n⚠️  ${firestoreWithoutAuth.length} Firestore document(s) without Firebase Auth user:`
      );
      firestoreWithoutAuth.forEach((doc) => {
        console.log(`   - ${doc.email} (${doc.uid})`);
      });
    } else {
      console.log(`\n✅ All Firestore user documents have Firebase Auth users`);
    }

    // Check for users without roles
    const usersWithoutRoles = [];
    firestoreUserMap.forEach((userData, uid) => {
      if (!userData.role) {
        usersWithoutRoles.push({ uid, email: userData.email });
      }
    });

    if (usersWithoutRoles.length > 0) {
      console.log(
        `\n⚠️  ${usersWithoutRoles.length} user(s) without role assignment:`
      );
      usersWithoutRoles.forEach((user) => {
        console.log(`   - ${user.email} (${user.uid})`);
      });
    } else {
      console.log(`\n✅ All users have role assignments`);
    }

    // 4. Check accounts collection
    console.log("\n\n📋 Accounts Collection:");
    console.log("=".repeat(70));

    const accountsSnapshot = await db.collection("accounts").get();
    console.log(`Found ${accountsSnapshot.size} account(s)\n`);

    const accountsByUser = new Map();
    accountsSnapshot.forEach((doc) => {
      const account = doc.data();
      const userId = account.userId || account.customerUID;

      if (!accountsByUser.has(userId)) {
        accountsByUser.set(userId, []);
      }
      accountsByUser.get(userId).push({
        id: doc.id,
        type: account.accountType,
        balance: account.balance,
        status: account.status,
      });
    });

    accountsByUser.forEach((accounts, userId) => {
      const user = firestoreUserMap.get(userId);
      console.log(`User: ${user?.email || userId}`);
      console.log(`  Total Accounts: ${accounts.length}`);
      accounts.forEach((acc) => {
        console.log(
          `    - ${acc.type}: $${(acc.balance || 0).toLocaleString()} (${acc.status})`
        );
      });
      console.log("");
    });

    // 5. Check admin assignments
    console.log("\n📋 Admin Assignments:");
    console.log("=".repeat(70));

    const assignmentsSnapshot = await db.collection("adminAssignments").get();
    console.log(`Found ${assignmentsSnapshot.size} assignment(s)\n`);

    if (assignmentsSnapshot.size === 0) {
      console.log("⚠️  No admin assignments found!");
      console.log("   This means admins won't be able to see any customers.");
    } else {
      assignmentsSnapshot.forEach((doc, index) => {
        const assignment = doc.data();
        const admin = firestoreUserMap.get(assignment.adminId);
        const customer = firestoreUserMap.get(assignment.customerId);

        console.log(`${index + 1}. Assignment ${doc.id}`);
        console.log(`   Admin: ${admin?.email || assignment.adminId}`);
        console.log(`   Customer: ${customer?.email || assignment.customerId}`);
        console.log(`   Active: ${assignment.isActive !== false}`);
        console.log(
          `   Created: ${assignment.createdAt ? new Date(assignment.createdAt.toDate()).toLocaleString() : "N/A"}`
        );
        console.log("");
      });
    }

    // 6. Check developers collection
    console.log("\n📋 Developers Collection:");
    console.log("=".repeat(70));

    const developersSnapshot = await db.collection("developers").get();
    console.log(`Found ${developersSnapshot.size} developer(s)\n`);

    developersSnapshot.forEach((doc, index) => {
      const developer = doc.data();
      console.log(`${index + 1}. ${developer.email || "No email"}`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Role: ${developer.role}`);
      console.log(`   Active: ${developer.isActive !== false}`);
      console.log("");
    });

    console.log("\n✅ Audit Complete!\n");
  } catch (error) {
    console.error("❌ Error during audit:", error);
    process.exit(1);
  }
}

auditUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
