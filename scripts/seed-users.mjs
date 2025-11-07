import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr4b7RvGtrhm8qpB5c_HvjePaEOlK5LfY",
  authDomain: "swiftbank-2811b.firebaseapp.com",
  projectId: "swiftbank-2811b",
  storageBucket: "swiftbank-2811b.firebasestorage.app",
  messagingSenderId: "611029351731",
  appId: "1:611029351731:web:68f8c2e00a1d0f78c712e8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// User data - Only these two users should exist
const systemUsers = [
  {
    id: "rYIBpXZy0vX4hY1A3HCS8BYv6F02", // Admin UID from Authentication
    uid: "rYIBpXZy0vX4hY1A3HCS8BYv6F02",
    email: "admin@swiftbank.com",
    username: "admin",
    role: "admin",

    // Personal Information (All Editable by Admin)
    firstName: "System",
    lastName: "Administrator",
    fullName: "System Administrator",
    displayName: "Admin",

    // Contact Information (All Editable)
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Bank Street",
      city: "Financial District",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },

    // Account Status (All Editable)
    isActive: true,
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,

    // Authentication Details (Editable by Admin)
    authProvider: "email",
    lastSignIn: new Date(),
    signUpDate: new Date("2025-09-23"),
    passwordLastChanged: new Date(),

    // Admin Permissions (All Editable)
    permissions: [
      "user_management",
      "account_management",
      "transaction_management",
      "message_management",
      "settings_management",
      "audit_access",
      "full_admin_access",
    ],

    // Profile Settings (All Editable)
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "America/New_York",
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      twoFactorEnabled: true,
    },

    // Security Settings (All Editable)
    security: {
      loginAttempts: 0,
      lastLoginIP: "192.168.1.1",
      deviceTrusted: true,
      sessionTimeout: 3600,
      requirePasswordChange: false,
    },

    // Audit Trail
    createdAt: new Date("2025-09-23"),
    updatedAt: new Date(),
    createdBy: "system",
    lastModifiedBy: "system",

    // Additional Admin Fields
    department: "IT Administration",
    accessLevel: "Level 5 - Full Access",
    emergencyContact: {
      name: "IT Support",
      phone: "+1 (555) 999-9999",
      email: "support@swiftbank.com",
    },
  },
  {
    id: "mYFGjRgsARS0AheCdYUkzhMRLkk2", // Customer UID (Johnson Boseman)
    uid: "mYFGjRgsARS0AheCdYUkzhMRLkk2",
    email: "customer@swiftbank.com",
    username: "johnson.boseman",
    role: "customer",

    // Personal Information (All Editable by Admin)
    firstName: "Johnson",
    lastName: "Boseman",
    fullName: "Johnson Boseman",
    displayName: "Johnson B.",
    middleName: "Marcus",

    // Contact Information (All Editable)
    phone: "+1 (555) 987-6543",
    address: {
      street: "456 Customer Avenue",
      city: "Brooklyn",
      state: "NY",
      zipCode: "11201",
      country: "United States",
    },

    // Account Status (All Editable)
    isActive: true,
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,

    // Authentication Details (Editable by Admin)
    authProvider: "email",
    lastSignIn: new Date(),
    signUpDate: new Date("2025-09-23"),
    passwordLastChanged: new Date(),

    // Customer Permissions (All Editable)
    permissions: [
      "account_view",
      "transaction_create",
      "profile_edit",
      "support_contact",
    ],

    // Profile Settings (All Editable)
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      twoFactorEnabled: false,
    },

    // Security Settings (All Editable)
    security: {
      loginAttempts: 0,
      lastLoginIP: "192.168.1.100",
      deviceTrusted: true,
      sessionTimeout: 1800,
      requirePasswordChange: false,
    },

    // Banking Information (All Editable)
    bankingProfile: {
      customerSince: new Date("2025-09-23"),
      accountTypes: ["primary", "savings", "checking"],
      primaryAccountId: "johnson_primary",
      creditScore: 750,
      riskLevel: "low",
      kycStatus: "approved",
      kycDate: new Date("2025-09-23"),
    },

    // Personal Details (All Editable)
    personalDetails: {
      dateOfBirth: "1985-03-15",
      ssn: "XXX-XX-1234", // Masked for security
      occupation: "Software Engineer",
      employer: "Tech Solutions Inc.",
      annualIncome: 85000,
      maritalStatus: "single",
    },

    // Emergency Contact (All Editable)
    emergencyContact: {
      name: "Sarah Boseman",
      relationship: "Sister",
      phone: "+1 (555) 444-5555",
      email: "sarah.boseman@email.com",
    },

    // Audit Trail
    createdAt: new Date("2025-09-23"),
    updatedAt: new Date(),
    createdBy: "admin",
    lastModifiedBy: "admin",
  },
];

async function seedSystemUsers() {
  try {
    console.log("👥 Starting SwiftBank users seeding process...");

    const usersRef = collection(db, "users");

    // First, get all existing users and clean them up
    console.log("🧹 Cleaning up existing users...");
    const existingUsersSnapshot = await getDocs(usersRef);

    if (!existingUsersSnapshot.empty) {
      console.log(
        `📋 Found ${existingUsersSnapshot.size} existing users to delete`
      );

      // Delete existing users one by one
      for (const docSnapshot of existingUsersSnapshot.docs) {
        await deleteDoc(doc(db, "users", docSnapshot.id));
      }

      console.log("✅ Successfully deleted all existing users");
    } else {
      console.log("✅ No existing users found");
    }

    // Create the two system users using batch write
    console.log("📝 Creating SwiftBank system users...");
    const batch = writeBatch(db);

    for (const user of systemUsers) {
      console.log(`👤 Preparing ${user.fullName} (${user.role})`);

      const userRef = doc(db, "users", user.id);
      batch.set(userRef, user);
    }

    // Commit the batch
    await batch.commit();
    console.log("✅ Successfully created all users in batch");

    console.log("🎉 SwiftBank users seeding completed successfully!");
    console.log(
      "📊 Final state: 2 users (1 Admin, 1 Customer) - Johnson Boseman system"
    );
    console.log("");
    console.log("User Summary:");
    systemUsers.forEach((user) => {
      console.log(`• ${user.fullName} (${user.email}) - Role: ${user.role}`);
      console.log(
        `  Permissions: ${user.permissions.length} permissions configured`
      );
    });

    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Run: npm run verify:users (to verify users)");
    console.log("2. Use admin dashboard to edit user details");
    console.log("3. Run: npm run manage:users (for CLI management)");
    console.log("");
    console.log(
      "⚠️  Important: Authentication credentials can be managed through CLI tools"
    );
  } catch (error) {
    console.error("❌ Error seeding system users:", error);
    throw error;
  }
}

// Run the seeding function
seedSystemUsers()
  .then(() => {
    console.log("✨ User seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 User seeding process failed:", error);
    process.exit(1);
  });
