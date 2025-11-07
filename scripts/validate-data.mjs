#!/usr/bin/env node
/**
 * Data Validation and Maintenance Script
 * - Regular data integrity checks
 * - Automated cleanup and validation
 * - Prevention of future issues
 */

import dotenv from "dotenv";
import minimist from "minimist";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

try {
  dotenv.config();
} catch {}

const argv = minimist(process.argv.slice(2));

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const DEV_EMAIL = process.env.DEV_EMAIL;
const DEV_PASSWORD = process.env.DEV_PASSWORD;

async function validateDataIntegrity(actualUID) {
  console.log("🔍 Starting data integrity validation...");

  // Get all data
  const q = query(collection(db, "users"), where("createdBy", "==", actualUID));
  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const assignQuery = query(
    collection(db, "adminAssignments"),
    where("developerId", "==", actualUID)
  );
  const assignSnapshot = await getDocs(assignQuery);
  const assignments = assignSnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const admins = users.filter(
    (u) => u.role === "admin" && u.isActive !== false
  );
  const customers = users.filter(
    (u) => u.role === "customer" && u.isActive !== false
  );
  const activeAssignments = assignments.filter((a) => a.isActive !== false);

  let issues = [];
  let fixes = 0;

  // 1. Check for duplicate emails
  const emailCounts = {};
  users.forEach((user) => {
    if (user.email) {
      const email = user.email.toLowerCase();
      emailCounts[email] = (emailCounts[email] || 0) + 1;
    }
  });

  const duplicateEmails = Object.entries(emailCounts).filter(
    ([email, count]) => count > 1
  );
  if (duplicateEmails.length > 0) {
    issues.push(
      `❌ Duplicate emails: ${duplicateEmails.map(([email]) => email).join(", ")}`
    );
  }

  // 2. Check for missing assignments
  const unassignedAdmins = admins.filter(
    (admin) =>
      !activeAssignments.find(
        (a) => a.adminId === admin.id || a.adminId === admin.uid
      )
  );
  const unassignedCustomers = customers.filter(
    (customer) =>
      !activeAssignments.find(
        (a) => a.customerId === customer.id || a.customerId === customer.uid
      )
  );

  if (unassignedAdmins.length > 0) {
    issues.push(`❌ Unassigned admins: ${unassignedAdmins.length}`);
  }
  if (unassignedCustomers.length > 0) {
    issues.push(`❌ Unassigned customers: ${unassignedCustomers.length}`);
  }

  // 3. Check for orphaned assignments
  const orphanedAssignments = activeAssignments.filter((assignment) => {
    const adminExists = admins.find(
      (a) => a.id === assignment.adminId || a.uid === assignment.adminId
    );
    const customerExists = customers.find(
      (c) => c.id === assignment.customerId || c.uid === assignment.customerId
    );
    return !adminExists || !customerExists;
  });

  if (orphanedAssignments.length > 0) {
    issues.push(`❌ Orphaned assignments: ${orphanedAssignments.length}`);
  }

  // 4. Check data consistency
  const inconsistentUsers = users.filter((user) => {
    return (
      !user.role ||
      !user.createdBy ||
      user.isActive === undefined ||
      !user.email
    );
  });

  if (inconsistentUsers.length > 0) {
    issues.push(`❌ Users with missing fields: ${inconsistentUsers.length}`);
  }

  return {
    summary: {
      admins: admins.length,
      customers: customers.length,
      assignments: activeAssignments.length,
    },
    issues,
    details: {
      duplicateEmails,
      unassignedAdmins,
      unassignedCustomers,
      orphanedAssignments,
      inconsistentUsers,
    },
  };
}

async function autoFix(actualUID, validationResult) {
  if (!argv.fix && !argv.autofix) {
    console.log("ℹ️  Add --fix flag to automatically resolve issues");
    return 0;
  }

  console.log("\n🛠️  Auto-fixing issues...");
  let fixCount = 0;

  const { details } = validationResult;

  // Fix duplicate emails (remove older ones)
  if (details.duplicateEmails.length > 0) {
    console.log("🔧 Fixing duplicate emails...");

    for (const [email] of details.duplicateEmails) {
      const duplicates = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", email),
          where("createdBy", "==", actualUID)
        )
      );

      const users = duplicates.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (users.length > 1) {
        // Sort by creation date, keep newest
        users.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        // Delete older duplicates
        for (let i = 1; i < users.length; i++) {
          await deleteDoc(doc(db, "users", users[i].id));
          console.log(`   🗑️  Removed duplicate: ${email} (${users[i].id})`);
          fixCount++;
        }
      }
    }
  }

  // Create missing assignments
  if (
    details.unassignedAdmins.length > 0 &&
    details.unassignedCustomers.length > 0
  ) {
    console.log("🔧 Creating missing assignments...");

    const maxPairs = Math.min(
      details.unassignedAdmins.length,
      details.unassignedCustomers.length
    );

    for (let i = 0; i < maxPairs; i++) {
      const admin = details.unassignedAdmins[i];
      const customer = details.unassignedCustomers[i];

      const assignmentId = `${admin.id}_${customer.id}`;

      await setDoc(doc(db, "adminAssignments", assignmentId), {
        developerId: actualUID,
        adminId: admin.id,
        customerId: customer.id,
        adminEmail: admin.email,
        customerEmail: customer.email,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      console.log(
        `   🔗 Created assignment: ${admin.email} → ${customer.email}`
      );
      fixCount++;
    }
  }

  // Remove orphaned assignments
  if (details.orphanedAssignments.length > 0) {
    console.log("🔧 Removing orphaned assignments...");

    for (const assignment of details.orphanedAssignments) {
      await deleteDoc(doc(db, "adminAssignments", assignment.id));
      console.log(`   🗑️  Removed orphaned assignment: ${assignment.id}`);
      fixCount++;
    }
  }

  return fixCount;
}

async function run() {
  const mode = argv._[0] || "check";

  console.log(`🔧 Data Validation Tool - Mode: ${mode}`);
  console.log("═".repeat(50));

  // Sign in
  console.log("🔐 Signing in as developer:", DEV_EMAIL);
  const cred = await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  const actualUID = cred.user.uid;

  // Run validation
  const validation = await validateDataIntegrity(actualUID);

  // Display results
  console.log("\n📊 VALIDATION RESULTS:");
  console.log("═".repeat(50));
  console.log(`👩‍💼 Admins: ${validation.summary.admins}`);
  console.log(`👥 Customers: ${validation.summary.customers}`);
  console.log(`🔗 Assignments: ${validation.summary.assignments}`);

  if (validation.issues.length === 0) {
    console.log("\n✅ No data integrity issues found!");
    console.log("🎯 Database is clean and well-organized");
  } else {
    console.log("\n⚠️  Issues found:");
    validation.issues.forEach((issue) => console.log(`   ${issue}`));

    // Auto-fix if requested
    const fixCount = await autoFix(actualUID, validation);

    if (fixCount > 0) {
      console.log(`\n✅ Fixed ${fixCount} issues`);
      console.log("🔄 Re-run validation to confirm fixes");
    }
  }

  // Usage examples
  if (mode === "check" && validation.issues.length > 0) {
    console.log("\n💡 USAGE:");
    console.log(
      "   node scripts/validate-data.mjs --fix     # Auto-fix issues"
    );
    console.log(
      "   node scripts/validate-data.mjs check     # Check only (default)"
    );
  }
}

run().catch((err) => {
  console.error("💥 Validation failed:", err.message);
  process.exit(1);
});
