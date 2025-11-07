#!/usr/bin/env node
/**
 * Cleanup script: keep only the single customer (Johnson Boseman) and admin; delete everything else.
 *
 * Usage (PowerShell):
 *   node scripts/cleanup-single-user.cjs --customerEmail customer@swiftbank.com --adminEmail admin@swiftbank.com --dry
 *   node scripts/cleanup-single-user.cjs --customerUid <UID> --force
 *
 * Requirements:
 *   - Create a Firebase service account JSON and set env var GOOGLE_APPLICATION_CREDENTIALS to its path
 */

const admin = require("firebase-admin");

// Initialize Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (e) {
    console.error(
      "Failed to initialize Firebase Admin SDK. Set GOOGLE_APPLICATION_CREDENTIALS env var."
    );
    process.exit(1);
  }
}

const db = admin.firestore();

function arg(flag, def = undefined) {
  const idx = process.argv.findIndex(
    (a) => a === flag || a.startsWith(flag + "=")
  );
  if (idx === -1) return def;
  const val = process.argv[idx].split("=")[1];
  if (val === undefined) return process.argv[idx + 1];
  return val;
}

async function main() {
  const dryRun = process.argv.includes("--dry");
  const force = process.argv.includes("--force");
  const customerEmail = arg("--customerEmail");
  const adminEmail = arg("--adminEmail");
  const customerUid = arg("--customerUid");
  const adminUid = arg("--adminUid");

  if (!customerEmail && !customerUid) {
    console.log("Provide --customerEmail or --customerUid");
    process.exit(2);
  }

  // Resolve target UIDs via email if needed
  async function uidForEmail(email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      return user.uid;
    } catch (e) {
      console.warn("Could not find user by email:", email, e.message);
      return null;
    }
  }

  const targetCustomerUid =
    customerUid || (customerEmail ? await uidForEmail(customerEmail) : null);
  const targetAdminUid =
    adminUid || (adminEmail ? await uidForEmail(adminEmail) : null);

  if (!targetCustomerUid) {
    console.error("Could not resolve customer UID.");
    process.exit(3);
  }

  console.log("Target customer UID:", targetCustomerUid);
  console.log("Target admin UID    :", targetAdminUid || "(none provided)");
  console.log(dryRun ? "Running in DRY RUN mode" : "Live mode");

  // 1) Delete extra auth users
  const list = await admin.auth().listUsers(1000);
  const toDeleteAuth = list.users.filter(
    (u) =>
      u.uid !== targetCustomerUid &&
      (targetAdminUid ? u.uid !== targetAdminUid : true)
  );

  console.log(`Auth users to delete: ${toDeleteAuth.length}`);
  if (!dryRun && toDeleteAuth.length) {
    if (!force) {
      console.error("Refusing to delete without --force");
      process.exit(4);
    }
    await admin.auth().deleteUsers(toDeleteAuth.map((u) => u.uid));
    console.log("Deleted auth users");
  }

  // 2) Delete Firestore users docs except target ones
  const usersSnap = await db.collection("users").get();
  const batch = db.batch();
  let count = 0;
  usersSnap.forEach((doc) => {
    if (
      doc.id !== targetCustomerUid &&
      (targetAdminUid ? doc.id !== targetAdminUid : true)
    ) {
      batch.delete(doc.ref);
      count++;
    }
  });
  console.log(`Firestore users to delete: ${count}`);
  if (!dryRun && count) {
    if (!force) {
      console.error("Refusing to delete Firestore users without --force");
      process.exit(5);
    }
    await batch.commit();
    console.log("Deleted Firestore user docs");
  }

  // 3) Keep only accounts with customerUID == targetCustomerUid
  const accSnap = await db.collection("accounts").get();
  const accBatch = db.batch();
  let accDel = 0;
  accSnap.forEach((doc) => {
    const d = doc.data();
    if (d.customerUID !== targetCustomerUid && d.userId !== targetCustomerUid) {
      accBatch.delete(doc.ref);
      accDel++;
    }
  });
  console.log(`Accounts to delete: ${accDel}`);
  if (!dryRun && accDel) {
    if (!force) {
      console.error("Refusing to delete accounts without --force");
      process.exit(6);
    }
    await accBatch.commit();
    console.log("Deleted non-customer accounts");
  }

  console.log("Cleanup complete");
}

main().catch((e) => {
  console.error("Cleanup error:", e);
  process.exit(1);
});
