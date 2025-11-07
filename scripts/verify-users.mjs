import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

// Expected user UIDs and roles
const expectedUsers = {
  rYIBpXZy0vX4hY1A3HCS8BYv6F02: { role: "admin", email: "admin@swiftbank.com" },
  mYFGjRgsARS0AheCdYUkzhMRLkk2: {
    role: "customer",
    email: "customer@swiftbank.com",
  },
};

async function verifySystemUsers() {
  try {
    console.log("👥 Verifying SwiftBank system users...");
    console.log("================================================");

    // Get all users
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    if (usersSnapshot.empty) {
      console.log("❌ NO USERS FOUND");
      console.log("Run: npm run seed:users to create the system users");
      return false;
    }

    console.log(`📊 Total users found: ${usersSnapshot.size}`);

    // Check if we have exactly 2 users
    if (usersSnapshot.size !== 2) {
      console.log(`⚠️  WARNING: Expected 2 users, found ${usersSnapshot.size}`);
    } else {
      console.log("✅ Correct number of users (2)");
    }

    // Analyze each user
    const users = [];
    const foundRoles = [];

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      users.push({ id: doc.id, ...user });
      foundRoles.push(user.role);
    });

    console.log("");
    console.log("👤 User Details:");
    console.log("================================================");

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName || user.displayName}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive ? "Yes" : "No"}`);
      console.log(`   Verified: ${user.isVerified ? "Yes" : "No"}`);
      console.log(
        `   Permissions: ${user.permissions ? user.permissions.length : 0} permissions`
      );
      console.log(`   Phone: ${user.phone || "Not provided"}`);
      if (user.address) {
        console.log(
          `   Address: ${user.address.street}, ${user.address.city}, ${user.address.state}`
        );
      }
      console.log(
        `   Last Sign In: ${user.lastSignIn ? new Date(user.lastSignIn.seconds * 1000).toLocaleString() : "Never"}`
      );
      console.log("");
    });

    console.log("📈 Summary Analysis:");
    console.log("================================================");
    console.log(`User Roles Found: ${foundRoles.join(", ")}`);

    // Check for expected users
    let adminFound = false;
    let customerFound = false;
    let unexpectedUsers = [];

    users.forEach((user) => {
      if (expectedUsers[user.uid]) {
        const expected = expectedUsers[user.uid];
        if (expected.role === "admin" && user.role === "admin") {
          adminFound = true;
          console.log(`✅ Admin user found: ${user.email}`);
        } else if (expected.role === "customer" && user.role === "customer") {
          customerFound = true;
          console.log(`✅ Customer user found: ${user.email}`);
        } else {
          console.log(
            `⚠️  User ${user.email} has unexpected role: ${user.role} (expected: ${expected.role})`
          );
        }
      } else {
        unexpectedUsers.push(user);
      }
    });

    if (adminFound && customerFound && unexpectedUsers.length === 0) {
      console.log("✅ All required users present with correct roles");
    } else {
      if (!adminFound) console.log("❌ Admin user missing or has wrong role");
      if (!customerFound)
        console.log("❌ Customer user missing or has wrong role");
      if (unexpectedUsers.length > 0) {
        console.log(
          `⚠️  Unexpected users found: ${unexpectedUsers.map((u) => u.email).join(", ")}`
        );
      }
    }

    // Admin editability check
    console.log("");
    console.log("🔧 Admin Editability Verification:");
    console.log("================================================");

    const editableFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "role",
      "permissions",
      "isActive",
      "preferences",
      "security",
      "personalDetails",
      "bankingProfile",
      "emergencyContact",
    ];

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName}:`);
      editableFields.forEach((field) => {
        const hasField = user.hasOwnProperty(field);
        const value = user[field];
        let displayValue = "Missing";

        if (hasField) {
          if (Array.isArray(value)) {
            displayValue = `[${value.length} items]`;
          } else if (typeof value === "object" && value !== null) {
            displayValue = `{object}`;
          } else {
            displayValue =
              String(value).substring(0, 30) +
              (String(value).length > 30 ? "..." : "");
          }
        }

        console.log(`   ${field}: ${hasField ? "✅" : "❌"} ${displayValue}`);
      });
      console.log("");
    });

    // Authentication sync check
    console.log("🔐 Authentication Sync Verification:");
    console.log("================================================");
    console.log("Checking if Firestore users match Firebase Authentication...");

    users.forEach((user) => {
      const expectedAuth = expectedUsers[user.uid];
      if (expectedAuth) {
        console.log(
          `✅ ${user.email}: UID matches expected authentication user`
        );
      } else {
        console.log(
          `⚠️  ${user.email}: UID not found in expected authentication users`
        );
      }
    });

    console.log("");
    console.log("🎯 Verification Complete!");
    console.log("");
    console.log("💡 Next Steps:");
    console.log("1. Use admin dashboard to view/edit user details");
    console.log("2. All user details including auth credentials are editable");
    console.log("3. Run scripts/manage-users CLI for user management");
    console.log(
      "4. Authentication email/password can be updated via CLI tools"
    );

    return (
      users.length === 2 &&
      adminFound &&
      customerFound &&
      unexpectedUsers.length === 0
    );
  } catch (error) {
    console.error("❌ Error verifying system users:", error);
    return false;
  }
}

// Run the verification function
verifySystemUsers()
  .then((success) => {
    if (success) {
      console.log(
        "✨ Verification passed - System users are correctly configured!"
      );
      process.exit(0);
    } else {
      console.log("⚠️  Verification completed with issues");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error);
    process.exit(1);
  });
