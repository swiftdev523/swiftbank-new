#!/usr/bin/env node

/**
 * Developer Management Script
 *
 * This script helps manage the developer hierarchy: Developer -> Admin -> Customer
 *
 * Usage:
 *   node scripts/manage-developer-system.js --list-all
 *   node scripts/manage-developer-system.js --developer-stats=dev@company.com
 *   node scripts/manage-developer-system.js --cleanup-inactive
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
    } else if (arg.startsWith("--")) {
      args[arg.replace("--", "")] = true;
    }
  });
  return args;
}

// Get developer statistics
async function getDeveloperStats(developerEmail) {
  try {
    console.log(`📊 Getting statistics for developer: ${developerEmail}`);

    // Find developer by email
    const developersSnapshot = await firestore
      .collection("developers")
      .where("email", "==", developerEmail)
      .limit(1)
      .get();

    if (developersSnapshot.empty) {
      throw new Error(`Developer with email ${developerEmail} not found`);
    }

    const developerDoc = developersSnapshot.docs[0];
    const developerData = developerDoc.data();
    const developerId = developerDoc.id;

    console.log(
      `\\n👨‍💻 Developer: ${developerData.firstName} ${developerData.lastName}`
    );
    console.log(`   Email: ${developerData.email}`);
    console.log(`   UID: ${developerId}`);
    console.log(`   Status: ${developerData.isActive ? "Active" : "Inactive"}`);

    // Get admins created by this developer
    const adminsSnapshot = await firestore
      .collection("users")
      .where("createdBy", "==", developerId)
      .where("role", "==", "admin")
      .get();

    // Get customers created by this developer
    const customersSnapshot = await firestore
      .collection("users")
      .where("createdBy", "==", developerId)
      .where("role", "==", "customer")
      .get();

    // Get assignments
    const assignmentsSnapshot = await firestore
      .collection("adminAssignments")
      .where("developerId", "==", developerId)
      .get();

    console.log(`\\n📈 Statistics:`);
    console.log(`   Total Admins Created: ${adminsSnapshot.size}`);
    console.log(`   Total Customers Created: ${customersSnapshot.size}`);
    console.log(`   Total Assignments: ${assignmentsSnapshot.size}`);

    // Active counts
    let activeAdmins = 0;
    let activeCustomers = 0;
    let activeAssignments = 0;

    adminsSnapshot.forEach((doc) => {
      if (doc.data().isActive) activeAdmins++;
    });

    customersSnapshot.forEach((doc) => {
      if (doc.data().isActive) activeCustomers++;
    });

    assignmentsSnapshot.forEach((doc) => {
      if (doc.data().isActive) activeAssignments++;
    });

    console.log(`   Active Admins: ${activeAdmins}`);
    console.log(`   Active Customers: ${activeCustomers}`);
    console.log(`   Active Assignments: ${activeAssignments}`);

    // List recent assignments
    console.log(`\\n📋 Recent Admin-Customer Assignments:`);
    if (assignmentsSnapshot.empty) {
      console.log("   No assignments found");
    } else {
      assignmentsSnapshot.docs.slice(0, 5).forEach((doc) => {
        const assignment = doc.data();
        const createdAt =
          assignment.createdAt?.toDate?.()?.toLocaleString() || "Unknown";
        console.log(
          `   ${assignment.adminEmail} -> ${assignment.customerEmail} (${createdAt})`
        );
      });
    }

    return {
      developer: developerData,
      totalAdmins: adminsSnapshot.size,
      totalCustomers: customersSnapshot.size,
      totalAssignments: assignmentsSnapshot.size,
      activeAdmins,
      activeCustomers,
      activeAssignments,
    };
  } catch (error) {
    console.error("❌ Error getting developer stats:", error.message);
    throw error;
  }
}

// List all entities in the system
async function listAllEntities() {
  try {
    console.log("📋 Listing all entities in the developer hierarchy...");

    // Get all developers
    const developersSnapshot = await firestore.collection("developers").get();
    console.log(`\\n👨‍💻 Developers (${developersSnapshot.size}):`);

    if (developersSnapshot.empty) {
      console.log("   No developers found");
    } else {
      developersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(
          `   📧 ${data.email} - ${data.firstName} ${data.lastName || ""} (${data.isActive ? "Active" : "Inactive"})`
        );
      });
    }

    // Get all admins
    const adminsSnapshot = await firestore
      .collection("users")
      .where("role", "==", "admin")
      .get();

    console.log(`\\n👨‍💼 Admins (${adminsSnapshot.size}):`);
    if (adminsSnapshot.empty) {
      console.log("   No admins found");
    } else {
      adminsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(
          `   📧 ${data.email} - ${data.firstName} ${data.lastName || ""} (${data.isActive ? "Active" : "Inactive"})`
        );
        if (data.assignedCustomer) {
          console.log(`      🔗 Assigned Customer: ${data.assignedCustomer}`);
        }
      });
    }

    // Get all customers
    const customersSnapshot = await firestore
      .collection("users")
      .where("role", "==", "customer")
      .get();

    console.log(`\\n👤 Customers (${customersSnapshot.size}):`);
    if (customersSnapshot.empty) {
      console.log("   No customers found");
    } else {
      customersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(
          `   📧 ${data.email} - ${data.firstName} ${data.lastName || ""} (${data.isActive ? "Active" : "Inactive"})`
        );
        if (data.assignedAdmin) {
          console.log(`      🔗 Assigned Admin: ${data.assignedAdmin}`);
        }
      });
    }

    // Get all assignments
    const assignmentsSnapshot = await firestore
      .collection("adminAssignments")
      .get();
    console.log(
      `\\n🔗 Admin-Customer Assignments (${assignmentsSnapshot.size}):`
    );
    if (assignmentsSnapshot.empty) {
      console.log("   No assignments found");
    } else {
      assignmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.isActive ? "Active" : "Inactive";
        const createdAt =
          data.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown";
        console.log(
          `   ${data.adminEmail} -> ${data.customerEmail} (${status}, Created: ${createdAt})`
        );
      });
    }

    return {
      developers: developersSnapshot.size,
      admins: adminsSnapshot.size,
      customers: customersSnapshot.size,
      assignments: assignmentsSnapshot.size,
    };
  } catch (error) {
    console.error("❌ Error listing entities:", error.message);
    throw error;
  }
}

// Cleanup inactive entities
async function cleanupInactive(dryRun = true) {
  try {
    const mode = dryRun ? "DRY RUN" : "EXECUTION";
    console.log(`🧹 Cleanup inactive entities (${mode})...`);

    if (dryRun) {
      console.log("ℹ️  This is a dry run. No changes will be made.");
      console.log("   Run with --execute to actually perform cleanup.");
    }

    let cleaned = 0;

    // Find inactive assignments
    const inactiveAssignments = await firestore
      .collection("adminAssignments")
      .where("isActive", "==", false)
      .get();

    console.log(`\\n🔍 Found ${inactiveAssignments.size} inactive assignments`);

    if (!inactiveAssignments.empty && !dryRun) {
      console.log("🗑️  Deleting inactive assignments...");
      const batch = firestore.batch();
      inactiveAssignments.forEach((doc) => {
        batch.delete(doc.ref);
        cleaned++;
      });
      await batch.commit();
      console.log(`✅ Deleted ${cleaned} inactive assignments`);
    }

    // Find users with no recent activity (optional - be careful with this)
    const oldThreshold = new Date();
    oldThreshold.setMonth(oldThreshold.getMonth() - 6); // 6 months ago

    const staleUsers = await firestore
      .collection("users")
      .where("isActive", "==", false)
      .where("updatedAt", "<", admin.firestore.Timestamp.fromDate(oldThreshold))
      .get();

    console.log(
      `\\n🔍 Found ${staleUsers.size} stale inactive users (6+ months)`
    );

    if (!staleUsers.empty) {
      console.log(
        "⚠️  WARNING: User cleanup is disabled by default for safety"
      );
      console.log("   Manually review these users before deletion:");
      staleUsers.forEach((doc) => {
        const data = doc.data();
        console.log(
          `   📧 ${data.email} - Last updated: ${data.updatedAt?.toDate?.()?.toLocaleDateString() || "Unknown"}`
        );
      });
    }

    return {
      cleanedAssignments: dryRun ? 0 : cleaned,
      staleUsers: staleUsers.size,
    };
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    throw error;
  }
}

// Verify system integrity
async function verifySystemIntegrity() {
  try {
    console.log("🔍 Verifying developer system integrity...");

    const issues = [];

    // Check for orphaned assignments
    const assignmentsSnapshot = await firestore
      .collection("adminAssignments")
      .get();

    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignment = assignmentDoc.data();

      // Check if admin exists
      const adminDoc = await firestore
        .collection("users")
        .doc(assignment.adminId)
        .get();
      if (!adminDoc.exists()) {
        issues.push(
          `Orphaned assignment: Admin ${assignment.adminId} not found for assignment ${assignmentDoc.id}`
        );
      }

      // Check if customer exists
      const customerDoc = await firestore
        .collection("users")
        .doc(assignment.customerId)
        .get();
      if (!customerDoc.exists()) {
        issues.push(
          `Orphaned assignment: Customer ${assignment.customerId} not found for assignment ${assignmentDoc.id}`
        );
      }
    }

    // Check for admins without assignments
    const adminsSnapshot = await firestore
      .collection("users")
      .where("role", "==", "admin")
      .where("isActive", "==", true)
      .get();

    for (const adminDoc of adminsSnapshot.docs) {
      const admin = adminDoc.data();
      const assignmentExists = await firestore
        .collection("adminAssignments")
        .where("adminId", "==", adminDoc.id)
        .where("isActive", "==", true)
        .get();

      if (assignmentExists.empty) {
        issues.push(
          `Admin without assignment: ${admin.email} (${adminDoc.id})`
        );
      }
    }

    // Check for customers without assignments
    const customersSnapshot = await firestore
      .collection("users")
      .where("role", "==", "customer")
      .where("isActive", "==", true)
      .get();

    for (const customerDoc of customersSnapshot.docs) {
      const customer = customerDoc.data();
      const assignmentExists = await firestore
        .collection("adminAssignments")
        .where("customerId", "==", customerDoc.id)
        .where("isActive", "==", true)
        .get();

      if (assignmentExists.empty) {
        issues.push(
          `Customer without assignment: ${customer.email} (${customerDoc.id})`
        );
      }
    }

    console.log(`\\n📊 Integrity Check Results:`);
    if (issues.length === 0) {
      console.log("✅ No integrity issues found!");
    } else {
      console.log(`❌ Found ${issues.length} integrity issue(s):`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    return issues;
  } catch (error) {
    console.error("❌ Error verifying system integrity:", error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    const args = parseArgs();

    // Show help
    if (args.help || args.h) {
      console.log("\\n🏦 Developer System Management Script");
      console.log("\\nUsage:");
      console.log("  node scripts/manage-developer-system.js [options]");
      console.log("\\nOptions:");
      console.log(
        "  --list-all                    List all entities in the system"
      );
      console.log(
        "  --developer-stats=EMAIL       Get statistics for a specific developer"
      );
      console.log(
        "  --cleanup-inactive            Clean up inactive entities (dry run)"
      );
      console.log("  --cleanup-inactive --execute  Actually perform cleanup");
      console.log("  --verify-integrity            Check system integrity");
      console.log("  --help, -h                    Show this help message");
      console.log("\\nExamples:");
      console.log("  node scripts/manage-developer-system.js --list-all");
      console.log(
        "  node scripts/manage-developer-system.js --developer-stats=dev@swiftbank.com"
      );
      console.log(
        "  node scripts/manage-developer-system.js --cleanup-inactive"
      );
      console.log(
        "  node scripts/manage-developer-system.js --verify-integrity"
      );
      return;
    }

    if (args["list-all"]) {
      await listAllEntities();
    } else if (args["developer-stats"]) {
      await getDeveloperStats(args["developer-stats"]);
    } else if (args["cleanup-inactive"]) {
      await cleanupInactive(!args.execute);
    } else if (args["verify-integrity"]) {
      await verifySystemIntegrity();
    } else {
      console.log(
        "❌ No action specified. Run with --help for usage information."
      );
      process.exit(1);
    }
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
  getDeveloperStats,
  listAllEntities,
  cleanupInactive,
  verifySystemIntegrity,
};
