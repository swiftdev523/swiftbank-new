#!/usr/bin/env node
/**
 * Fix Developer Data Script
 * - Authenticates as the developer (email/password via env/flags)
 * - Ensures users created by that developer have correct top-level fields:
 *   role, createdBy, isActive, assignedCustomer/assignedAdmin
 * - Ensures adminAssignments collection has matching docs
 *
 * Usage examples:
 *   node scripts/fix-developer-data.mjs --email=developer@swiftbank.com --password=yourpass
 *   DEV_EMAIL=developer@swiftbank.com DEV_PASSWORD=yourpass node scripts/fix-developer-data.mjs
 *   DEV_UID=abc123 node scripts/fix-developer-data.mjs  # if already signed-in elsewhere and only want UID-based fix
 */

import dotenv from "dotenv";
import minimist from "minimist";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
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

if (!config.apiKey || !config.projectId) {
  console.error(
    "❌ Missing Firebase env configuration. Set VITE_FIREBASE_* variables."
  );
  process.exit(1);
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const DEV_EMAIL = argv.email || process.env.DEV_EMAIL;
const DEV_PASSWORD = argv.password || process.env.DEV_PASSWORD;
let DEV_UID = argv.uid || process.env.DEV_UID;

async function ensureAssignment({ developerId, admin, customer }) {
  const assignmentId = `${admin.uid}_${customer.uid}`;
  const ref = doc(db, "adminAssignments", assignmentId);
  const snap = await getDoc(ref);
  const base = {
    developerId,
    adminId: admin.uid,
    customerId: customer.uid,
    adminEmail: admin.email,
    customerEmail: customer.email,
    isActive: true,
    createdAt: serverTimestamp(),
  };
  if (!snap.exists()) {
    await setDoc(ref, base);
    return { created: true, id: assignmentId };
  }
  const data = snap.data();
  const needsUpdate =
    data.developerId !== developerId ||
    data.adminId !== admin.uid ||
    data.customerId !== customer.uid ||
    data.isActive === false;
  if (needsUpdate) {
    await updateDoc(ref, {
      developerId,
      adminId: admin.uid,
      customerId: customer.uid,
      isActive: true,
      updatedAt: serverTimestamp(),
    });
    return { updated: true, id: assignmentId };
  }
  return { ok: true, id: assignmentId };
}

async function run() {
  console.log("🛠️  Fix Developer Data");

  if (!DEV_UID) {
    if (!DEV_EMAIL || !DEV_PASSWORD) {
      console.error(
        "❌ Provide developer credentials: --email and --password or set DEV_EMAIL/DEV_PASSWORD"
      );
      process.exit(1);
    }
    console.log("🔐 Signing in as developer:", DEV_EMAIL);
    const cred = await signInWithEmailAndPassword(
      auth,
      DEV_EMAIL,
      DEV_PASSWORD
    );
    DEV_UID = cred.user.uid;
  } else if (DEV_EMAIL && DEV_PASSWORD) {
    // Sign in even if UID is provided to satisfy Firestore rules
    console.log("🔐 Signing in as developer:", DEV_EMAIL);
    const cred = await signInWithEmailAndPassword(
      auth,
      DEV_EMAIL,
      DEV_PASSWORD
    );
    if (cred.user.uid !== DEV_UID) {
      console.log(
        "⚠️ Signed-in UID differs from provided DEV_UID. Using signed-in UID:",
        cred.user.uid
      );
      DEV_UID = cred.user.uid;
    }
  }

  console.log("👤 Using developer UID:", DEV_UID);

  // Fetch all users created by this developer (broad query then filter in memory if needed)
  const q = query(collection(db, "users"), where("createdBy", "==", DEV_UID));
  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // If none found, we might need to scan all users and patch ones tied by email/domain
  if (users.length === 0) {
    console.warn(
      "⚠️ No users with createdBy == developer found. Trying broader fetch to locate untagged users..."
    );
    const allSnap = await getDocs(collection(db, "users"));
    const allUsers = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Heuristic: pick pairs that have assigned* links but missing createdBy
    const candidates = allUsers.filter(
      (u) => !u.createdBy && (u.assignedAdmin || u.assignedCustomer)
    );
    console.log(
      `🔎 Found ${candidates.length} candidate user(s) missing createdBy but linked by assignment fields.`
    );

    // If your intended pair is known, you can filter by their emails here by passing flags --adminEmail/--customerEmail
    const adminEmail = argv.adminEmail || process.env.ADMIN_EMAIL;
    const customerEmail = argv.customerEmail || process.env.CUSTOMER_EMAIL;
    let targetAdmins = candidates.filter((u) => u.role === "admin");
    let targetCustomers = candidates.filter((u) => u.role === "customer");

    if (adminEmail)
      targetAdmins = targetAdmins.filter(
        (u) => (u.email || "").toLowerCase() === adminEmail.toLowerCase()
      );
    if (customerEmail)
      targetCustomers = targetCustomers.filter(
        (u) => (u.email || "").toLowerCase() === customerEmail.toLowerCase()
      );

    // Patch createdBy on these users to DEV_UID (with confirmation in logs)
    for (const u of [...targetAdmins, ...targetCustomers]) {
      console.log("📝 Patching createdBy for user:", u.email || u.id);
      await updateDoc(doc(db, "users", u.id), {
        createdBy: DEV_UID,
        updatedAt: serverTimestamp(),
        isActive: u.isActive !== false, // default true
      });
    }
  }

  // Re-fetch after patch
  const s2 = await getDocs(
    query(collection(db, "users"), where("createdBy", "==", DEV_UID))
  );
  const devUsers = s2.docs.map((d) => ({ id: d.id, ...d.data() }));

  const admins = devUsers.filter(
    (u) => (u.role || u.profile?.role) === "admin"
  );
  const customers = devUsers.filter(
    (u) => (u.role || u.profile?.role) === "customer"
  );

  // Ensure top-level role, assigned links, and isActive
  for (const admin of admins) {
    const updates = {};
    if (!admin.role && admin.profile?.role === "admin") updates.role = "admin";
    if (admin.isActive === undefined) updates.isActive = true;
    if (!admin.createdBy) updates.createdBy = DEV_UID;
    if (!admin.assignedCustomer && admin.assignedCustomer !== null) {
      // Try to infer from any customer who references this admin
      const cs = customers.filter(
        (c) => c.assignedAdmin === admin.uid || c.assignedAdmin === admin.id
      );
      if (cs[0]) updates.assignedCustomer = cs[0].uid || cs[0].id;
    }
    if (Object.keys(updates).length) {
      console.log("🛠️ Updating admin doc:", admin.email || admin.id, updates);
      await updateDoc(doc(db, "users", admin.id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  }

  for (const customer of customers) {
    const updates = {};
    if (!customer.role && customer.profile?.role === "customer")
      updates.role = "customer";
    if (customer.isActive === undefined) updates.isActive = true;
    if (!customer.createdBy) updates.createdBy = DEV_UID;
    if (!customer.assignedAdmin && customer.assignedAdmin !== null) {
      // Try to infer from any admin who references this customer
      const as = admins.filter(
        (a) =>
          a.assignedCustomer === customer.uid ||
          a.assignedCustomer === customer.id
      );
      if (as[0]) updates.assignedAdmin = as[0].uid || as[0].id;
    }
    if (Object.keys(updates).length) {
      console.log(
        "🛠️ Updating customer doc:",
        customer.email || customer.id,
        updates
      );
      await updateDoc(doc(db, "users", customer.id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  }

  // Ensure adminAssignments
  for (const admin of admins) {
    const customerId =
      admin.assignedCustomer ||
      customers.find((c) => c.assignedAdmin === (admin.uid || admin.id))?.id;
    if (!customerId) continue;
    const customer = customers.find(
      (c) => c.id === customerId || c.uid === customerId
    );
    if (!customer) continue;

    const result = await ensureAssignment({
      developerId: DEV_UID,
      admin,
      customer,
    });
    if (result.created) console.log("🔗 Created assignment:", result.id);
    else if (result.updated) console.log("♻️ Updated assignment:", result.id);
  }

  console.log(
    "✅ Fix completed. You can run: npm run verify:developer to double-check."
  );
}

run().catch((err) => {
  console.error("💥 Fix script failed:", err.message);
  process.exit(1);
});
