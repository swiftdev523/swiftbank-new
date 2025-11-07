const admin = require("firebase-admin");
const readline = require("readline");

// Initialize Firebase Admin SDK
let app;
try {
  app = admin.app();
} catch (error) {
  // App doesn't exist, initialize it
  app = admin.initializeApp({
    // Uses Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS
    projectId: "swiftbank-2811b",
  });
}

const db = admin.firestore();

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

async function listAccounts() {
  console.log("\n📋 Johnson Boseman's Accounts:");
  console.log("================================================");

  const accountsSnapshot = await db.collection("accounts").get();

  if (accountsSnapshot.empty) {
    console.log("❌ No accounts found. Run: npm run seed:johnson");
    return [];
  }

  const accounts = [];
  accountsSnapshot.forEach((doc, index) => {
    const account = doc.data();
    accounts.push({ id: doc.id, ...account });

    console.log(`${index + 1}. ${account.displayName || account.accountName}`);
    console.log(`   Type: ${account.accountType}`);
    console.log(
      `   Account: ****${account.accountNumberSuffix || account.accountNumber?.slice(-4)}`
    );
    console.log(
      `   Balance: ${account.currency || "USD"} ${(account.balance || 0).toLocaleString()}`
    );
    console.log(`   Status: ${account.status}`);
  });

  return accounts;
}

async function editAccount(account) {
  console.log(`\n🔧 Editing: ${account.displayName}`);
  console.log("================================================");
  console.log("Enter new values (press Enter to keep current value):");

  const fieldsToEdit = [
    { key: "displayName", label: "Display Name", current: account.displayName },
    { key: "accountName", label: "Account Name", current: account.accountName },
    {
      key: "balance",
      label: "Balance",
      current: account.balance,
      type: "number",
    },
    {
      key: "accountNumberSuffix",
      label: "Account Number Suffix",
      current: account.accountNumberSuffix,
    },
    {
      key: "routingNumber",
      label: "Routing Number",
      current: account.routingNumber,
    },
    {
      key: "interestRate",
      label: "Interest Rate (%)",
      current: account.interestRate,
      type: "number",
    },
    {
      key: "minimumBalance",
      label: "Minimum Balance",
      current: account.minimumBalance,
      type: "number",
    },
    {
      key: "monthlyFee",
      label: "Monthly Fee",
      current: account.monthlyFee,
      type: "number",
    },
    {
      key: "dailyWithdrawalLimit",
      label: "Daily Withdrawal Limit",
      current: account.dailyWithdrawalLimit,
      type: "number",
    },
    {
      key: "dailyTransferLimit",
      label: "Daily Transfer Limit",
      current: account.dailyTransferLimit,
      type: "number",
    },
    {
      key: "overdraftLimit",
      label: "Overdraft Limit",
      current: account.overdraftLimit,
      type: "number",
    },
    {
      key: "status",
      label: "Status (active/inactive/closed)",
      current: account.status,
    },
    { key: "nickname", label: "Nickname", current: account.nickname },
    { key: "description", label: "Description", current: account.description },
  ];

  const updates = {};

  for (const field of fieldsToEdit) {
    const currentValue = field.current || "Not set";
    const answer = await askQuestion(`${field.label} (${currentValue}): `);

    if (answer) {
      if (field.type === "number") {
        const numValue = parseFloat(answer);
        if (!isNaN(numValue)) {
          updates[field.key] = numValue;
        } else {
          console.log(`⚠️  Invalid number for ${field.label}, skipping...`);
        }
      } else {
        updates[field.key] = answer;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log("No changes made.");
    return;
  }

  console.log("\n📝 Proposed changes:");
  Object.entries(updates).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  const confirm = await askQuestion("\nConfirm changes? (y/n): ");

  if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
    try {
      updates.updatedAt = admin.firestore.Timestamp.now();

      await db.collection("accounts").doc(account.id).update(updates);
      console.log("✅ Account updated successfully!");
    } catch (error) {
      console.error("❌ Error updating account:", error);
    }
  } else {
    console.log("Changes cancelled.");
  }
}

async function editFeatures(account) {
  console.log(`\n🔧 Editing Features for: ${account.displayName}`);
  console.log("================================================");

  const currentFeatures = account.features || [];
  console.log("Current features:");
  currentFeatures.forEach((feature, index) => {
    console.log(`${index + 1}. ${feature}`);
  });

  console.log("\nOptions:");
  console.log("1. Add feature");
  console.log("2. Remove feature");
  console.log("3. Replace all features");
  console.log("4. Back to main menu");

  const choice = await askQuestion("Choose option: ");

  switch (choice) {
    case "1":
      const newFeature = await askQuestion("Enter new feature: ");
      if (newFeature) {
        const updatedFeatures = [...currentFeatures, newFeature];
        await db.collection("accounts").doc(account.id).update({
          features: updatedFeatures,
          updatedAt: admin.firestore.Timestamp.now(),
        });
        console.log("✅ Feature added!");
      }
      break;

    case "2":
      if (currentFeatures.length === 0) {
        console.log("No features to remove.");
        break;
      }
      const featureIndex = await askQuestion(
        "Enter feature number to remove: "
      );
      const index = parseInt(featureIndex) - 1;
      if (index >= 0 && index < currentFeatures.length) {
        const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
        await db.collection("accounts").doc(account.id).update({
          features: updatedFeatures,
          updatedAt: admin.firestore.Timestamp.now(),
        });
        console.log("✅ Feature removed!");
      } else {
        console.log("Invalid feature number.");
      }
      break;

    case "3":
      console.log("Enter features separated by commas:");
      const featuresInput = await askQuestion("Features: ");
      if (featuresInput) {
        const newFeatures = featuresInput
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f);
        await db.collection("accounts").doc(account.id).update({
          features: newFeatures,
          updatedAt: admin.firestore.Timestamp.now(),
        });
        console.log("✅ Features updated!");
      }
      break;
  }
}

async function manageAccounts() {
  try {
    console.log("🏦 Johnson Boseman Account Management System");
    console.log("============================================");

    while (true) {
      const accounts = await listAccounts();

      if (accounts.length === 0) {
        break;
      }

      console.log("\n📋 Actions:");
      console.log("1. Edit account details");
      console.log("2. Edit account features");
      console.log("3. View account summary");
      console.log("4. Refresh account list");
      console.log("5. Exit");

      const action = await askQuestion("\nChoose action: ");

      switch (action) {
        case "1":
          const accountIndex = await askQuestion(
            "Enter account number to edit: "
          );
          const index = parseInt(accountIndex) - 1;
          if (index >= 0 && index < accounts.length) {
            await editAccount(accounts[index]);
          } else {
            console.log("Invalid account number.");
          }
          break;

        case "2":
          const featuresIndex = await askQuestion(
            "Enter account number to edit features: "
          );
          const fIndex = parseInt(featuresIndex) - 1;
          if (fIndex >= 0 && fIndex < accounts.length) {
            await editFeatures(accounts[fIndex]);
          } else {
            console.log("Invalid account number.");
          }
          break;

        case "3":
          const summaryIndex = await askQuestion(
            "Enter account number to view: "
          );
          const sIndex = parseInt(summaryIndex) - 1;
          if (sIndex >= 0 && sIndex < accounts.length) {
            const account = accounts[sIndex];
            console.log(`\n📊 ${account.displayName} Summary:`);
            console.log("================================================");
            Object.entries(account).forEach(([key, value]) => {
              if (typeof value !== "object" || value === null) {
                console.log(`${key}: ${value}`);
              } else if (Array.isArray(value)) {
                console.log(
                  `${key}: [${value.length} items] ${value.join(", ")}`
                );
              }
            });
          }
          break;

        case "4":
          // Just refresh by continuing the loop
          break;

        case "5":
          console.log("👋 Goodbye!");
          rl.close();
          return;

        default:
          console.log("Invalid option.");
      }
    }
  } catch (error) {
    console.error("❌ Error in account management:", error);
  }
}

// Run the management system
if (require.main === module) {
  manageAccounts()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Management system failed:", error);
      process.exit(1);
    });
}

module.exports = { manageAccounts };
