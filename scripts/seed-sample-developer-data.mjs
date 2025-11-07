#!/usr/bin/env node
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

// Load environment variables
const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

const DEV_UID =
  process.argv[2] || process.env.DEV_UID || "XImTwn30XsfgBDXNP9XoMzYbXZ53";

async function seedSampleData() {
  console.log("🌱 Seeding sample admin/customer data for developer:", DEV_UID);

  const batch = writeBatch(db);

  // Sample admin/customer pairs
  const pairs = [
    {
      admin: {
        uid: "admin1_test_uid",
        email: "admin1@testbank.com",
        firstName: "John",
        lastName: "Administrator",
        role: "admin",
      },
      customer: {
        uid: "customer1_test_uid",
        email: "customer1@testbank.com",
        firstName: "Alice",
        lastName: "Johnson",
        phone: "+1-555-0101",
        role: "customer",
      },
    },
    {
      admin: {
        uid: "admin2_test_uid",
        email: "admin2@testbank.com",
        firstName: "Sarah",
        lastName: "Manager",
        role: "admin",
      },
      customer: {
        uid: "customer2_test_uid",
        email: "customer2@testbank.com",
        firstName: "Bob",
        lastName: "Smith",
        phone: "+1-555-0102",
        role: "customer",
      },
    },
  ];

  try {
    for (let i = 0; i < pairs.length; i++) {
      const { admin, customer } = pairs[i];

      console.log(
        `📝 Creating pair ${i + 1}: ${admin.email} <-> ${customer.email}`
      );

      // Admin user document
      const adminData = {
        ...admin,
        createdBy: DEV_UID,
        assignedCustomer: customer.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      // Customer user document
      const customerData = {
        ...customer,
        createdBy: DEV_UID,
        assignedAdmin: admin.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        accounts: [], // Initialize empty accounts array
      };

      // Admin assignment document
      const assignmentData = {
        developerId: DEV_UID,
        adminId: admin.uid,
        customerId: customer.uid,
        adminEmail: admin.email,
        customerEmail: customer.email,
        createdAt: serverTimestamp(),
        isActive: true,
      };

      // Add to batch
      batch.set(doc(db, "users", admin.uid), adminData);
      batch.set(doc(db, "users", customer.uid), customerData);
      batch.set(
        doc(db, "adminAssignments", `${admin.uid}_${customer.uid}`),
        assignmentData
      );
    }

    // Ensure developer document exists
    const developerData = {
      uid: DEV_UID,
      email: "developer@swiftbank.com",
      firstName: "Lead",
      lastName: "Developer",
      role: "developer",
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      isActive: true,
    };

    batch.set(doc(db, "developers", DEV_UID), developerData);

    // Commit batch
    await batch.commit();

    console.log("✅ Successfully seeded sample data:");
    console.log(`   - ${pairs.length} admin users`);
    console.log(`   - ${pairs.length} customer users`);
    console.log(`   - ${pairs.length} admin assignments`);
    console.log(`   - 1 developer document`);
    console.log("");
    console.log("🎯 Now refresh your Developer Dashboard to see the data!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedSampleData().catch((err) => {
  console.error("💥 Seeding failed:", err);
  process.exit(1);
});
