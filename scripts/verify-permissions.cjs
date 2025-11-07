#!/usr/bin/env node

/**
 * Verify all permissions are correctly configured
 * This script checks Firestore data to ensure everything is set up properly
 */

const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

// Initialize Firebase Admin
const serviceAccountPath = path.join(
  __dirname,
  "..",
  "service-account-key.json"
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "swiftbank-2811b",
});

const auth = admin.auth();
const db = admin.firestore();

async function verifyPermissions() {
  console.log("\n🔐 PERMISSIONS VERIFICATION REPORT");
  console.log("=".repeat(80));
  console.log(`Generated: ${new Date().toLocaleString()}`);
  console.log("=".repeat(80));

  const checks = {
    passed: [],
    failed: [],
    warnings: [],
  };

  try {
    // Check 1: Custom Claims
    console.log("\n✓ Checking Custom Claims...");
    const users = await auth.listUsers();

    const expectedRoles = {
      "kindestwavelover@gmail.com": "customer",
      "seconds@swiftbank.com": "admin",
      "developer@swiftbank.com": "developer",
    };

    for (const user of users.users) {
      const expectedRole = expectedRoles[user.email];
      if (expectedRole) {
        const claims = user.customClaims || {};
        if (claims.role === expectedRole && claims[expectedRole] === true) {
          checks.passed.push(`✅ ${user.email} has correct custom claims`);
        } else {
          checks.failed.push(
            `❌ ${user.email} has incorrect custom claims: ${JSON.stringify(claims)}`
          );
        }
      }
    }

    // Check 2: Firestore User Documents
    console.log("✓ Checking Firestore User Documents...");
    const usersSnapshot = await db.collection("users").get();

    for (const [email, role] of Object.entries(expectedRoles)) {
      const user = users.users.find((u) => u.email === email);
      if (user) {
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.role === role) {
            checks.passed.push(
              `✅ ${email} Firestore document has correct role`
            );
          } else {
            checks.failed.push(
              `❌ ${email} Firestore role is ${userData.role}, expected ${role}`
            );
          }
        } else {
          checks.failed.push(`❌ ${email} has no Firestore document`);
        }
      }
    }

    // Check 3: Developer Document
    console.log("✓ Checking Developer Collection...");
    const devUser = users.users.find(
      (u) => u.email === "developer@swiftbank.com"
    );
    if (devUser) {
      const devDoc = await db.collection("developers").doc(devUser.uid).get();
      if (devDoc.exists) {
        checks.passed.push(`✅ Developer document exists`);
      } else {
        checks.failed.push(`❌ Developer document missing`);
      }
    }

    // Check 4: Admin Assignments
    console.log("✓ Checking Admin Assignments...");
    const adminUser = users.users.find(
      (u) => u.email === "seconds@swiftbank.com"
    );
    const customerUser = users.users.find(
      (u) => u.email === "kindestwavelover@gmail.com"
    );

    if (adminUser && customerUser) {
      const assignmentQuery = await db
        .collection("adminAssignments")
        .where("adminId", "==", adminUser.uid)
        .where("customerId", "==", customerUser.uid)
        .get();

      if (!assignmentQuery.empty) {
        const assignment = assignmentQuery.docs[0].data();
        if (assignment.isActive !== false) {
          checks.passed.push(`✅ Admin assignment exists and is active`);
        } else {
          checks.warnings.push(`⚠️  Admin assignment exists but is inactive`);
        }
      } else {
        checks.failed.push(`❌ Admin assignment missing`);
      }
    }

    // Check 5: Customer Accounts
    console.log("✓ Checking Customer Accounts...");
    const customerAccounts = await db
      .collection("accounts")
      .where("customerUID", "==", customerUser.uid)
      .get();

    if (customerAccounts.size >= 3) {
      checks.passed.push(`✅ Customer has ${customerAccounts.size} account(s)`);

      const totalBalance = customerAccounts.docs.reduce((sum, doc) => {
        return sum + (doc.data().balance || 0);
      }, 0);
      checks.passed.push(
        `✅ Total customer balance: $${totalBalance.toLocaleString()}`
      );
    } else {
      checks.warnings.push(
        `⚠️  Customer only has ${customerAccounts.size} account(s)`
      );
    }

    // Check 6: Account Types
    console.log("✓ Checking Account Types Collection...");
    const accountTypes = await db.collection("accountTypes").get();
    if (accountTypes.size >= 3) {
      checks.passed.push(
        `✅ Account types collection exists with ${accountTypes.size} type(s)`
      );
    } else {
      checks.warnings.push(
        `⚠️  Account types collection has only ${accountTypes.size} type(s)`
      );
    }

    // Generate Report
    console.log("\n" + "=".repeat(80));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(80));

    console.log(`\n✅ PASSED (${checks.passed.length}):`);
    checks.passed.forEach((check) => console.log(`   ${check}`));

    if (checks.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${checks.warnings.length}):`);
      checks.warnings.forEach((check) => console.log(`   ${check}`));
    }

    if (checks.failed.length > 0) {
      console.log(`\n❌ FAILED (${checks.failed.length}):`);
      checks.failed.forEach((check) => console.log(`   ${check}`));
    }

    console.log("\n" + "=".repeat(80));

    if (checks.failed.length === 0) {
      console.log("✅ ALL CHECKS PASSED! System is ready for testing.");
      console.log("\n📋 Next Steps:");
      console.log("   1. Open http://localhost:5173 in your browser");
      console.log("   2. Follow the MANUAL_TESTING_GUIDE.md");
      console.log("   3. Test each user role systematically");
    } else {
      console.log("❌ SOME CHECKS FAILED! Please review and fix issues above.");
      return process.exit(1);
    }

    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  }
}

verifyPermissions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
