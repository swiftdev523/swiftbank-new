#!/usr/bin/env node

/**
 * Comprehensive User Permissions Audit and Fix Script
 * This script will:
 * 1. Check all users and their roles
 * 2. Set custom claims
 * 3. Create/update Firestore documents
 * 4. Verify admin assignments
 * 5. Create missing collections/documents
 * 6. Fix any permission issues
 */

const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

// Initialize Firebase Admin
let app;
try {
  // Try to load service account key
  const serviceAccountPath = path.join(
    __dirname,
    "..",
    "service-account-key.json"
  );
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "swiftbank-2811b",
    });
    console.log("✅ Authenticated with service account key\n");
  } catch (error) {
    // Fallback to ADC
    app = admin.initializeApp({
      projectId: "swiftbank-2811b",
    });
    console.log("✅ Authenticated with Application Default Credentials\n");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
  console.log("\n⚠️  Please ensure you have either:");
  console.log("   1. service-account-key.json in project root, OR");
  console.log("   2. Run: gcloud auth application-default login");
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Expected configuration
const EXPECTED_ROLES = {
  "developer@swiftbank.com": "developer",
  "seconds@swiftbank.com": "admin",
  "kindestwavelover@gmail.com": "customer",
};

const ROLE_PERMISSIONS = {
  customer: [
    "account_view",
    "transaction_view",
    "transfer",
    "deposit",
    "withdraw",
    "profile_edit",
  ],
  admin: [
    "account_view",
    "account_edit",
    "transaction_view",
    "transaction_approve",
    "transaction_edit",
    "user_manage",
    "message_send",
    "message_view",
  ],
  developer: ["*"], // All permissions
};

async function comprehensiveAudit() {
  console.log("🔍 COMPREHENSIVE USER PERMISSIONS AUDIT");
  console.log("=".repeat(80));
  console.log("Project: swiftbank-2811b");
  console.log("Date:", new Date().toLocaleString());
  console.log("=".repeat(80));
  console.log("");

  const results = {
    authUsers: 0,
    firestoreUsers: 0,
    claimsUpdated: 0,
    documentsCreated: 0,
    documentsUpdated: 0,
    adminAssignments: 0,
    developerDocs: 0,
    issues: [],
    fixed: [],
  };

  try {
    // ========================================================================
    // PHASE 1: AUDIT FIREBASE AUTHENTICATION USERS
    // ========================================================================
    console.log("\n📋 PHASE 1: Firebase Authentication Audit");
    console.log("-".repeat(80));

    const listUsersResult = await auth.listUsers();
    results.authUsers = listUsersResult.users.length;
    console.log(`Found ${results.authUsers} authentication user(s)\n`);

    const userMap = new Map();

    for (const user of listUsersResult.users) {
      userMap.set(user.uid, user);
      console.log(`\n👤 ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email Verified: ${user.emailVerified ? "✅" : "❌"}`);
      console.log(`   Disabled: ${user.disabled ? "❌ YES" : "✅ No"}`);
      console.log(
        `   Created: ${new Date(user.metadata.creationTime).toLocaleString()}`
      );
      console.log(
        `   Last Sign In: ${new Date(user.metadata.lastSignInTime).toLocaleString()}`
      );

      const expectedRole = EXPECTED_ROLES[user.email];
      const currentClaims = user.customClaims || {};

      console.log(`   Expected Role: ${expectedRole || "⚠️  UNKNOWN"}`);
      console.log(
        `   Current Claims:`,
        Object.keys(currentClaims).length > 0
          ? JSON.stringify(currentClaims)
          : "❌ None"
      );

      if (!expectedRole) {
        results.issues.push(`Unknown user: ${user.email} - no role defined`);
        console.log(`   ⚠️  WARNING: No role defined for this user`);
        continue;
      }

      // Check if claims need updating
      const needsUpdate =
        currentClaims[expectedRole] !== true ||
        currentClaims.role !== expectedRole;

      if (needsUpdate) {
        console.log(`   🔧 Updating custom claims...`);
        const newClaims = {
          [expectedRole]: true,
          role: expectedRole,
        };

        await auth.setCustomUserClaims(user.uid, newClaims);
        results.claimsUpdated++;
        results.fixed.push(`Set custom claims for ${user.email}`);
        console.log(
          `   ✅ Custom claims updated: ${JSON.stringify(newClaims)}`
        );
      } else {
        console.log(`   ✅ Custom claims are correct`);
      }
    }

    // ========================================================================
    // PHASE 2: AUDIT FIRESTORE USER DOCUMENTS
    // ========================================================================
    console.log("\n\n📋 PHASE 2: Firestore Users Collection Audit");
    console.log("-".repeat(80));

    const usersSnapshot = await db.collection("users").get();
    results.firestoreUsers = usersSnapshot.size;
    console.log(
      `Found ${results.firestoreUsers} user document(s) in Firestore\n`
    );

    const firestoreUserMap = new Map();
    usersSnapshot.forEach((doc) => {
      firestoreUserMap.set(doc.id, doc.data());
    });

    // Check for auth users without Firestore docs
    for (const [uid, user] of userMap.entries()) {
      const expectedRole = EXPECTED_ROLES[user.email];
      if (!expectedRole) continue;

      if (!firestoreUserMap.has(uid)) {
        console.log(
          `\n⚠️  Creating missing Firestore document for ${user.email}`
        );

        const userData = {
          email: user.email,
          username: user.email.split("@")[0],
          role: expectedRole,
          permissions: ROLE_PERMISSIONS[expectedRole],
          isActive: true,
          emailVerified: user.emailVerified,
          profile: {
            firstName:
              expectedRole === "developer"
                ? "Developer"
                : expectedRole === "admin"
                  ? "Admin"
                  : "William",
            lastName:
              expectedRole === "developer"
                ? "User"
                : expectedRole === "admin"
                  ? "User"
                  : "Miller",
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(uid).set(userData);
        results.documentsCreated++;
        results.fixed.push(`Created Firestore document for ${user.email}`);
        console.log(`   ✅ Document created with role: ${expectedRole}`);
      } else {
        const userData = firestoreUserMap.get(uid);
        console.log(`\n✅ ${user.email} - Firestore document exists`);
        console.log(`   Role: ${userData.role}`);
        console.log(
          `   Permissions: ${userData.permissions ? userData.permissions.join(", ") : "None"}`
        );

        // Check if role matches
        if (userData.role !== expectedRole) {
          console.log(
            `   🔧 Updating role from '${userData.role}' to '${expectedRole}'`
          );
          await db.collection("users").doc(uid).update({
            role: expectedRole,
            permissions: ROLE_PERMISSIONS[expectedRole],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          results.documentsUpdated++;
          results.fixed.push(`Updated role for ${user.email}`);
          console.log(`   ✅ Role updated`);
        }
      }
    }

    // ========================================================================
    // PHASE 3: AUDIT DEVELOPERS COLLECTION
    // ========================================================================
    console.log("\n\n📋 PHASE 3: Developers Collection Audit");
    console.log("-".repeat(80));

    const developersSnapshot = await db.collection("developers").get();
    console.log(`Found ${developersSnapshot.size} developer document(s)\n`);

    const developerEmails = Object.entries(EXPECTED_ROLES)
      .filter(([email, role]) => role === "developer")
      .map(([email]) => email);

    for (const email of developerEmails) {
      const user = Array.from(userMap.values()).find((u) => u.email === email);
      if (!user) continue;

      const devDoc = await db.collection("developers").doc(user.uid).get();

      if (!devDoc.exists) {
        console.log(`⚠️  Creating developer document for ${email}`);

        const developerData = {
          email: email,
          role: "developer",
          isActive: true,
          permissions: ["*"],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("developers").doc(user.uid).set(developerData);
        results.developerDocs++;
        results.fixed.push(`Created developer document for ${email}`);
        console.log(`✅ Developer document created`);
      } else {
        console.log(`✅ Developer document exists for ${email}`);
      }
    }

    // ========================================================================
    // PHASE 4: AUDIT ADMIN ASSIGNMENTS
    // ========================================================================
    console.log("\n\n📋 PHASE 4: Admin Assignments Audit");
    console.log("-".repeat(80));

    const assignmentsSnapshot = await db.collection("adminAssignments").get();
    console.log(`Found ${assignmentsSnapshot.size} admin assignment(s)\n`);

    // Expected: seconds@swiftbank.com -> kindestwavelover@gmail.com
    const adminEmail = "seconds@swiftbank.com";
    const customerEmail = "kindestwavelover@gmail.com";
    const developerEmail = "developer@swiftbank.com";

    const adminUser = Array.from(userMap.values()).find(
      (u) => u.email === adminEmail
    );
    const customerUser = Array.from(userMap.values()).find(
      (u) => u.email === customerEmail
    );
    const developerUser = Array.from(userMap.values()).find(
      (u) => u.email === developerEmail
    );

    if (adminUser && customerUser && developerUser) {
      // Check if assignment exists
      const assignmentQuery = await db
        .collection("adminAssignments")
        .where("adminId", "==", adminUser.uid)
        .where("customerId", "==", customerUser.uid)
        .get();

      if (assignmentQuery.empty) {
        console.log(
          `⚠️  Creating admin assignment: ${adminEmail} -> ${customerEmail}`
        );

        const assignmentData = {
          adminId: adminUser.uid,
          adminEmail: adminEmail,
          customerId: customerUser.uid,
          customerEmail: customerEmail,
          developerId: developerUser.uid,
          assignedBy: developerUser.uid,
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("adminAssignments").add(assignmentData);
        results.adminAssignments++;
        results.fixed.push(
          `Created admin assignment: ${adminEmail} -> ${customerEmail}`
        );
        console.log(`✅ Admin assignment created`);
      } else {
        console.log(
          `✅ Admin assignment exists: ${adminEmail} -> ${customerEmail}`
        );
        const assignment = assignmentQuery.docs[0].data();
        console.log(
          `   Active: ${assignment.isActive !== false ? "✅ Yes" : "❌ No"}`
        );
        console.log(
          `   Created: ${assignment.createdAt ? new Date(assignment.createdAt.toDate()).toLocaleString() : "N/A"}`
        );
      }
    }

    // ========================================================================
    // PHASE 5: CHECK ACCOUNTS & TRANSACTIONS
    // ========================================================================
    console.log("\n\n📋 PHASE 5: Accounts & Transactions Overview");
    console.log("-".repeat(80));

    const accountsSnapshot = await db.collection("accounts").get();
    console.log(`Found ${accountsSnapshot.size} account(s)`);

    const accountsByUser = new Map();
    accountsSnapshot.forEach((doc) => {
      const account = doc.data();
      const userId = account.userId || account.customerUID;
      if (!accountsByUser.has(userId)) {
        accountsByUser.set(userId, []);
      }
      accountsByUser.get(userId).push({
        type: account.accountType,
        balance: account.balance,
        status: account.status,
      });
    });

    for (const [userId, accounts] of accountsByUser.entries()) {
      const user = userMap.get(userId);
      console.log(`\n👤 ${user?.email || userId}`);
      console.log(`   Accounts: ${accounts.length}`);
      accounts.forEach((acc) => {
        console.log(
          `     - ${acc.type}: $${(acc.balance || 0).toLocaleString()} (${acc.status})`
        );
      });
    }

    const transactionsSnapshot = await db.collection("transactions").get();
    console.log(`\n💸 Total Transactions: ${transactionsSnapshot.size}`);

    // ========================================================================
    // FINAL REPORT
    // ========================================================================
    console.log("\n\n📊 AUDIT SUMMARY");
    console.log("=".repeat(80));
    console.log(`\n✅ Firebase Auth Users: ${results.authUsers}`);
    console.log(`✅ Firestore User Documents: ${results.firestoreUsers}`);
    console.log(`✅ Custom Claims Updated: ${results.claimsUpdated}`);
    console.log(`✅ Documents Created: ${results.documentsCreated}`);
    console.log(`✅ Documents Updated: ${results.documentsUpdated}`);
    console.log(`✅ Admin Assignments: ${results.adminAssignments}`);
    console.log(`✅ Developer Documents: ${results.developerDocs}`);

    if (results.fixed.length > 0) {
      console.log(`\n🔧 FIXES APPLIED (${results.fixed.length}):`);
      results.fixed.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix}`);
      });
    }

    if (results.issues.length > 0) {
      console.log(`\n⚠️  ISSUES FOUND (${results.issues.length}):`);
      results.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ AUDIT COMPLETE!");
    console.log("=".repeat(80));
    console.log("");

    return results;
  } catch (error) {
    console.error("\n❌ AUDIT FAILED:", error);
    throw error;
  }
}

// Run the audit
comprehensiveAudit()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
