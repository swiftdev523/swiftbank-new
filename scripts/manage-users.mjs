import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import readline from "readline";

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

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function listUsers() {
  console.log("\n👥 SwiftBank System Users:");
  console.log("================================================");

  const usersRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersRef);

  if (usersSnapshot.empty) {
    console.log("❌ No users found. Run: npm run seed:users");
    return [];
  }

  const users = [];
  usersSnapshot.forEach((doc, index) => {
    const user = doc.data();
    users.push({ id: doc.id, ...user });

    console.log(`${index + 1}. ${user.fullName || user.displayName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.isActive ? "Active" : "Inactive"}`);
    console.log(`   Phone: ${user.phone || "Not provided"}`);
    console.log(
      `   Last Sign In: ${user.lastSignIn ? new Date(user.lastSignIn.seconds * 1000).toLocaleString() : "Never"}`
    );
  });

  return users;
}

async function editUserBasicInfo(user) {
  console.log(`\n🔧 Editing Basic Info: ${user.fullName}`);
  console.log("================================================");
  console.log("Enter new values (press Enter to keep current value):");

  const fieldsToEdit = [
    { key: "firstName", label: "First Name", current: user.firstName },
    { key: "lastName", label: "Last Name", current: user.lastName },
    { key: "displayName", label: "Display Name", current: user.displayName },
    { key: "username", label: "Username", current: user.username },
    { key: "email", label: "Email Address", current: user.email },
    { key: "phone", label: "Phone Number", current: user.phone },
  ];

  const updates = {};

  for (const field of fieldsToEdit) {
    const currentValue = field.current || "Not set";
    const answer = await askQuestion(`${field.label} (${currentValue}): `);

    if (answer) {
      updates[field.key] = answer;
    }
  }

  // Update fullName if first or last name changed
  if (updates.firstName || updates.lastName) {
    const firstName = updates.firstName || user.firstName;
    const lastName = updates.lastName || user.lastName;
    updates.fullName = `${firstName} ${lastName}`;
  }

  return updates;
}

async function editUserAddress(user) {
  console.log(`\n🏠 Editing Address: ${user.fullName}`);
  console.log("================================================");

  const currentAddress = user.address || {};

  const addressFields = [
    { key: "street", label: "Street Address", current: currentAddress.street },
    { key: "city", label: "City", current: currentAddress.city },
    { key: "state", label: "State", current: currentAddress.state },
    { key: "zipCode", label: "ZIP Code", current: currentAddress.zipCode },
    { key: "country", label: "Country", current: currentAddress.country },
  ];

  const addressUpdates = { ...currentAddress };

  for (const field of addressFields) {
    const currentValue = field.current || "Not set";
    const answer = await askQuestion(`${field.label} (${currentValue}): `);

    if (answer) {
      addressUpdates[field.key] = answer;
    }
  }

  return { address: addressUpdates };
}

async function editUserSecurity(user) {
  console.log(`\n🔐 Editing Security Settings: ${user.fullName}`);
  console.log("================================================");

  const currentSecurity = user.security || {};
  const currentPrefs = user.preferences || {};

  const securityFields = [
    {
      key: "sessionTimeout",
      label: "Session Timeout (seconds)",
      current: currentSecurity.sessionTimeout,
      type: "number",
    },
    {
      key: "twoFactorEnabled",
      label: "Two-Factor Authentication (true/false)",
      current: currentPrefs.twoFactorEnabled,
      type: "boolean",
    },
    {
      key: "requirePasswordChange",
      label: "Require Password Change (true/false)",
      current: currentSecurity.requirePasswordChange,
      type: "boolean",
    },
  ];

  const updates = {};

  for (const field of securityFields) {
    const currentValue = field.current ?? "Not set";
    const answer = await askQuestion(`${field.label} (${currentValue}): `);

    if (answer) {
      if (field.type === "number") {
        const numValue = parseInt(answer);
        if (!isNaN(numValue)) {
          if (field.key === "twoFactorEnabled") {
            updates["preferences.twoFactorEnabled"] =
              numValue === 1 || answer.toLowerCase() === "true";
          } else {
            updates[`security.${field.key}`] = numValue;
          }
        }
      } else if (field.type === "boolean") {
        const boolValue = answer.toLowerCase() === "true" || answer === "1";
        if (field.key === "twoFactorEnabled") {
          updates["preferences.twoFactorEnabled"] = boolValue;
        } else {
          updates[`security.${field.key}`] = boolValue;
        }
      }
    }
  }

  return updates;
}

async function editUserPermissions(user) {
  console.log(`\n🔑 Editing Permissions: ${user.fullName}`);
  console.log("================================================");

  const currentPermissions = user.permissions || [];
  console.log("Current permissions:");
  currentPermissions.forEach((permission, index) => {
    console.log(`${index + 1}. ${permission}`);
  });

  console.log("\nAvailable permission sets:");
  console.log("1. Admin (full access)");
  console.log("2. Customer (standard)");
  console.log("3. Custom (enter manually)");

  const choice = await askQuestion("Choose permission set (1-3): ");

  let newPermissions = [];

  switch (choice) {
    case "1":
      newPermissions = [
        "user_management",
        "account_management",
        "transaction_management",
        "message_management",
        "settings_management",
        "audit_access",
        "full_admin_access",
      ];
      break;

    case "2":
      newPermissions = [
        "account_view",
        "transaction_create",
        "profile_edit",
        "support_contact",
      ];
      break;

    case "3":
      console.log("Enter permissions separated by commas:");
      const permissionsInput = await askQuestion("Permissions: ");
      if (permissionsInput) {
        newPermissions = permissionsInput
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);
      }
      break;
  }

  if (newPermissions.length > 0) {
    return { permissions: newPermissions };
  }

  return {};
}

async function editUserRole(user) {
  console.log(`\n👤 Editing Role: ${user.fullName}`);
  console.log("================================================");

  console.log(`Current role: ${user.role}`);
  console.log("\nAvailable roles:");
  console.log("1. admin");
  console.log("2. customer");
  console.log("3. manager");
  console.log("4. support");

  const choice = await askQuestion("Choose role (1-4): ");
  const roles = ["admin", "customer", "manager", "support"];

  if (choice >= 1 && choice <= 4) {
    return { role: roles[choice - 1] };
  }

  return {};
}

async function viewUserDetails(user) {
  console.log(`\n👤 ${user.fullName} - Detailed View`);
  console.log("================================================");

  // Basic Info
  console.log("📋 Basic Information:");
  console.log(`  Name: ${user.firstName} ${user.lastName}`);
  console.log(`  Display Name: ${user.displayName}`);
  console.log(`  Username: ${user.username}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Phone: ${user.phone}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Status: ${user.isActive ? "Active" : "Inactive"}`);

  // Address
  if (user.address) {
    console.log("\n🏠 Address:");
    console.log(`  ${user.address.street}`);
    console.log(
      `  ${user.address.city}, ${user.address.state} ${user.address.zipCode}`
    );
    console.log(`  ${user.address.country}`);
  }

  // Permissions
  console.log("\n🔑 Permissions:");
  (user.permissions || []).forEach((permission) => {
    console.log(`  • ${permission}`);
  });

  // Security
  if (user.security) {
    console.log("\n🔐 Security Settings:");
    console.log(`  Session Timeout: ${user.security.sessionTimeout} seconds`);
    console.log(`  Login Attempts: ${user.security.loginAttempts}`);
    console.log(`  Last Login IP: ${user.security.lastLoginIP}`);
  }

  // Preferences
  if (user.preferences) {
    console.log("\n⚙️  Preferences:");
    console.log(`  Theme: ${user.preferences.theme}`);
    console.log(`  Language: ${user.preferences.language}`);
    console.log(
      `  Two-Factor Auth: ${user.preferences.twoFactorEnabled ? "Enabled" : "Disabled"}`
    );
  }

  // Banking Profile (for customers)
  if (user.bankingProfile) {
    console.log("\n🏦 Banking Profile:");
    console.log(
      `  Customer Since: ${new Date(user.bankingProfile.customerSince.seconds * 1000).toLocaleDateString()}`
    );
    console.log(
      `  Account Types: ${user.bankingProfile.accountTypes.join(", ")}`
    );
    console.log(`  Credit Score: ${user.bankingProfile.creditScore}`);
    console.log(`  KYC Status: ${user.bankingProfile.kycStatus}`);
  }
}

async function saveUserUpdates(userId, updates) {
  if (Object.keys(updates).length === 0) {
    console.log("No changes to save.");
    return;
  }

  try {
    updates.updatedAt = new Date();
    updates.lastModifiedBy = "admin_cli";

    await updateDoc(doc(db, "users", userId), updates);
    console.log("✅ User updated successfully!");
  } catch (error) {
    console.error("❌ Error updating user:", error);
  }
}

async function manageUsers() {
  try {
    console.log("👥 SwiftBank User Management System");
    console.log("===================================");

    while (true) {
      const users = await listUsers();

      if (users.length === 0) {
        break;
      }

      console.log("\n📋 Actions:");
      console.log("1. Edit user basic info");
      console.log("2. Edit user address");
      console.log("3. Edit user role");
      console.log("4. Edit user permissions");
      console.log("5. Edit security settings");
      console.log("6. View user details");
      console.log("7. Toggle user active status");
      console.log("8. Refresh user list");
      console.log("9. Exit");

      const action = await askQuestion("\nChoose action: ");

      if (action === "9") {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      if (action === "8") {
        continue; // Refresh list
      }

      const userIndex = await askQuestion("Enter user number: ");
      const index = parseInt(userIndex) - 1;

      if (index < 0 || index >= users.length) {
        console.log("Invalid user number.");
        continue;
      }

      const selectedUser = users[index];
      let updates = {};

      switch (action) {
        case "1":
          updates = await editUserBasicInfo(selectedUser);
          break;

        case "2":
          updates = await editUserAddress(selectedUser);
          break;

        case "3":
          updates = await editUserRole(selectedUser);
          break;

        case "4":
          updates = await editUserPermissions(selectedUser);
          break;

        case "5":
          updates = await editUserSecurity(selectedUser);
          break;

        case "6":
          await viewUserDetails(selectedUser);
          continue;

        case "7":
          updates = { isActive: !selectedUser.isActive };
          console.log(
            `User status will be changed to: ${updates.isActive ? "Active" : "Inactive"}`
          );
          break;

        default:
          console.log("Invalid action.");
          continue;
      }

      if (Object.keys(updates).length > 0) {
        console.log("\n📝 Proposed changes:");
        Object.entries(updates).forEach(([key, value]) => {
          console.log(`   ${key}: ${JSON.stringify(value)}`);
        });

        const confirm = await askQuestion("\nConfirm changes? (y/n): ");

        if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
          await saveUserUpdates(selectedUser.id, updates);
        } else {
          console.log("Changes cancelled.");
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in user management:", error);
  }
}

// Run the management system
manageUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 User management system failed:", error);
    process.exit(1);
  });
