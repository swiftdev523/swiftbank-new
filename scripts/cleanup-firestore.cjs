#!/usr/bin/env node
/**
 * Direct Firebase cleanup script using Firebase Admin SDK
 * Cleans up Firestore collections to keep only valid users
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin with project credentials
admin.initializeApp({
  projectId: "swiftbank-2811b",
});

const db = admin.firestore();

async function cleanupFirestoreUsers() {
  console.log("🔍 Starting Firestore cleanup...");

  // These are the only valid UIDs from Firebase Auth
  const validUIDs = new Set([
    "mYFGjRgsARS0AheCdYUkzhMRLkk2", // customer@swiftbank.com (Johnson Boseman)
    "rYlBpXZy0vX4hY1A3HCS8BYvvtg1", // admin@swiftbank.com
  ]);

  try {
    // 1. Clean up users collection
    console.log("📋 Checking users collection...");
    const usersSnapshot = await db.collection("users").get();
    const usersToDelete = [];

    usersSnapshot.forEach((doc) => {
      if (!validUIDs.has(doc.id)) {
        usersToDelete.push(doc.id);
        console.log(
          `  ❌ Will delete user: ${doc.id} - ${doc.data().email || "no email"}`
        );
      } else {
        console.log(
          `  ✅ Keeping user: ${doc.id} - ${doc.data().email || "no email"}`
        );
      }
    });

    // 2. Clean up accounts collection
    console.log("🏦 Checking accounts collection...");
    const accountsSnapshot = await db.collection("accounts").get();
    const accountsToDelete = [];

    accountsSnapshot.forEach((doc) => {
      const data = doc.data();
      const accountUID = data.customerUID || data.userId;

      if (!validUIDs.has(accountUID)) {
        accountsToDelete.push(doc.id);
        console.log(
          `  ❌ Will delete account: ${doc.id} - ${data.accountHolder || data.accountType || "unknown"}`
        );
      } else {
        console.log(
          `  ✅ Keeping account: ${doc.id} - ${data.accountHolder || data.accountType || "unknown"}`
        );
      }
    });

    // Ask for confirmation
    if (usersToDelete.length === 0 && accountsToDelete.length === 0) {
      console.log("🎉 No cleanup needed! Database is already clean.");
      return;
    }

    console.log("\n📊 Summary:");
    console.log(`  Users to delete: ${usersToDelete.length}`);
    console.log(`  Accounts to delete: ${accountsToDelete.length}`);
    console.log(`  Valid users to keep: ${validUIDs.size}`);

    const isDryRun = process.argv.includes("--dry-run");

    if (isDryRun) {
      console.log("\n🔍 DRY RUN - No actual deletions performed");
      return;
    }

    const forceDelete = process.argv.includes("--force");

    if (!forceDelete) {
      console.log("\n⚠️  Use --force flag to actually perform the deletions");
      console.log("   Or use --dry-run to just see what would be deleted");
      return;
    }

    // Delete invalid users
    console.log("\n🗑️  Deleting invalid users...");
    const userBatch = db.batch();
    usersToDelete.forEach((uid) => {
      userBatch.delete(db.collection("users").doc(uid));
    });

    if (usersToDelete.length > 0) {
      await userBatch.commit();
      console.log(`  ✅ Deleted ${usersToDelete.length} users from Firestore`);
    }

    // Delete invalid accounts
    console.log("\n🗑️  Deleting invalid accounts...");
    const accountBatch = db.batch();
    accountsToDelete.forEach((accountId) => {
      accountBatch.delete(db.collection("accounts").doc(accountId));
    });

    if (accountsToDelete.length > 0) {
      await accountBatch.commit();
      console.log(
        `  ✅ Deleted ${accountsToDelete.length} accounts from Firestore`
      );
    }

    console.log("\n🎉 Cleanup completed successfully!");
    console.log("   Only Johnson Boseman and Admin remain in the system.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupFirestoreUsers()
  .then(() => {
    console.log("\n✨ Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
