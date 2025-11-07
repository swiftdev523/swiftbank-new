#!/usr/bin/env node
/**
 * Firebase Authentication Setup Script
 * Creates developer and admin authentication accounts
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe1-_WMF0DxSp9xLxhb7DhQZ6j4UqPbYU",
  authDomain: "swiftbank-2811b.firebaseapp.com",
  projectId: "swiftbank-2811b",
  storageBucket: "swiftbank-2811b.firebasestorage.app",
  messagingSenderId: "577013507808",
  appId: "1:577013507808:web:d9e27e9a6c4c2b0f1234b9",
  measurementId: "G-XXXXXXXXXX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase initialized for authentication setup");

// Developer and Admin accounts to create
const authAccounts = [
  {
    email: "developer@swiftbank.com",
    password: "Developer123!",
    role: "developer",
    userData: {
      id: "dev-001",
      email: "developer@swiftbank.com",
      role: "developer",
      firstName: "System",
      lastName: "Developer",
      permissions: ["all"],
      isActive: true,
      canCreateAdmins: true,
      canCreateCustomers: true,
      canModifyRules: true,
      canAccessAllData: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  },
  {
    email: "admin1@clbank.com",
    password: "Admin123!",
    role: "admin",
    userData: {
      id: "admin-001",
      email: "admin1@clbank.com",
      role: "admin",
      firstName: "John",
      lastName: "Administrator",
      createdBy: "dev-001",
      permissions: [
        "customer_management",
        "transaction_oversight",
        "product_management",
      ],
      assignedCustomers: ["cust-001", "cust-002"],
      isActive: true,
      adminLevel: "senior",
      territories: ["northeast", "midwest"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  },
  {
    email: "admin2@clbank.com",
    password: "Admin123!",
    role: "admin",
    userData: {
      id: "admin-002",
      email: "admin2@clbank.com",
      role: "admin",
      firstName: "Sarah",
      lastName: "Manager",
      createdBy: "dev-001",
      permissions: ["customer_management", "transaction_oversight"],
      assignedCustomers: ["cust-003", "cust-004"],
      isActive: true,
      adminLevel: "standard",
      territories: ["southwest", "southeast"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  },
  {
    email: "customer1@email.com",
    password: "Customer123!",
    role: "customer",
    userData: {
      id: "cust-001",
      email: "customer1@email.com",
      role: "customer",
      firstName: "Alice",
      lastName: "Johnson",
      assignedAdmin: "admin-001",
      isActive: true,
      phoneNumber: "+1-555-0101",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      accounts: [
        {
          id: "acc-001",
          accountNumber: "1001234567",
          accountType: "checking",
          productId: "checking-premium",
          balance: 5250.75,
          status: "active",
          openedDate: new Date(),
        },
        {
          id: "acc-002",
          accountNumber: "2001234567",
          accountType: "savings",
          productId: "savings-high-yield",
          balance: 12500.0,
          status: "active",
          openedDate: new Date(),
        },
      ],
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        statementDelivery: "electronic",
        language: "en",
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  },
];

async function createAuthAccount(accountData) {
  try {
    console.log(`\\n👤 Creating auth account for: ${accountData.email}`);

    // Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      accountData.email,
      accountData.password
    );

    const user = userCredential.user;
    console.log(`  ✅ Auth account created with UID: ${user.uid}`);

    // Update the user profile
    await updateProfile(user, {
      displayName: `${accountData.userData.firstName} ${accountData.userData.lastName}`,
    });

    // Update the Firestore user document with the correct UID
    const updatedUserData = {
      ...accountData.userData,
      uid: user.uid,
      authCreated: true,
      authCreatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", accountData.userData.id), updatedUserData);
    console.log(`  📄 Firestore user document updated`);

    // Sign out to allow next account creation
    await auth.signOut();

    return {
      success: true,
      uid: user.uid,
      email: accountData.email,
      role: accountData.role,
    };
  } catch (error) {
    console.log(
      `  ❌ Error creating auth account for ${accountData.email}:`,
      error.code || error.message
    );

    if (error.code === "auth/email-already-in-use") {
      console.log(
        `  ℹ️  Account already exists, updating Firestore document only`
      );

      try {
        // Just update the Firestore document
        const updatedUserData = {
          ...accountData.userData,
          authExists: true,
          authUpdatedAt: serverTimestamp(),
        };

        await setDoc(
          doc(db, "users", accountData.userData.id),
          updatedUserData
        );
        console.log(`  📄 Firestore user document updated`);

        return {
          success: true,
          email: accountData.email,
          role: accountData.role,
          note: "Auth account already existed",
        };
      } catch (firestoreError) {
        console.log(`  ❌ Error updating Firestore:`, firestoreError.message);
      }
    }

    return {
      success: false,
      email: accountData.email,
      error: error.code || error.message,
    };
  }
}

async function testDeveloperLogin() {
  try {
    console.log("\\n🧪 Testing developer login...");

    const userCredential = await signInWithEmailAndPassword(
      auth,
      "developer@swiftbank.com",
      "Developer123!"
    );

    console.log(`  ✅ Developer login successful!`);
    console.log(`  👤 UID: ${userCredential.user.uid}`);
    console.log(`  📧 Email: ${userCredential.user.email}`);
    console.log(`  📝 Display Name: ${userCredential.user.displayName}`);

    await auth.signOut();
    console.log(`  🚪 Signed out successfully`);

    return true;
  } catch (error) {
    console.log(`  ❌ Developer login failed:`, error.code || error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Firebase Authentication Setup");
  console.log("=".repeat(60));

  const results = [];

  try {
    // Create authentication accounts
    console.log("\\n👥 Creating Authentication Accounts");
    console.log("-".repeat(40));

    for (const accountData of authAccounts) {
      const result = await createAuthAccount(accountData);
      results.push(result);

      // Small delay between account creations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Test developer login
    console.log("\\n🧪 Testing Authentication");
    console.log("-".repeat(40));

    const loginSuccess = await testDeveloperLogin();

    // Generate summary report
    console.log("\\n📋 AUTHENTICATION SETUP SUMMARY");
    console.log("=".repeat(60));

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`\\n✅ Successfully created: ${successful.length} accounts`);
    successful.forEach((result) => {
      console.log(
        `  • ${result.email} (${result.role}) ${result.note ? "- " + result.note : ""}`
      );
    });

    if (failed.length > 0) {
      console.log(`\\n❌ Failed to create: ${failed.length} accounts`);
      failed.forEach((result) => {
        console.log(`  • ${result.email} - ${result.error}`);
      });
    }

    console.log("\\n🔑 LOGIN CREDENTIALS:");
    console.log("  🔧 Developer:");
    console.log("    Email: developer@swiftbank.com");
    console.log("    Password: Developer123!");

    console.log("\\n  👨‍💼 Admin Accounts:");
    console.log("    Email: admin1@clbank.com");
    console.log("    Password: Admin123!");
    console.log("    Email: admin2@clbank.com");
    console.log("    Password: Admin123!");

    console.log("\\n  👤 Test Customer:");
    console.log("    Email: customer1@email.com");
    console.log("    Password: Customer123!");

    if (loginSuccess) {
      console.log("\\n🎉 AUTHENTICATION SETUP COMPLETE!");
      console.log("\\n🔗 Next Steps:");
      console.log(
        "  1. Access developer portal at: http://localhost:5174/developer/login"
      );
      console.log("  2. Login with developer credentials");
      console.log("  3. Test admin and customer login functionality");
      console.log("  4. Verify role-based access controls");
    } else {
      console.log(
        "\\n⚠️  Authentication setup completed but login test failed"
      );
      console.log("  Please check Firebase Authentication console for issues");
    }
  } catch (error) {
    console.error("\\n❌ Authentication setup failed:", error.message);
  }
}

main().catch(console.error);
