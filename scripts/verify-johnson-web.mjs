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

// Johnson Boseman's user ID
const JOHNSON_BOSEMAN_UID = "mYFGjRgsARS0AheCdYUkzhMRLkk2";

async function verifyJohnsonAccounts() {
  try {
    console.log("🔍 Verifying Johnson Boseman accounts...");
    console.log("================================================");

    // Get all accounts
    const accountsRef = collection(db, "accounts");
    const accountsSnapshot = await getDocs(accountsRef);

    if (accountsSnapshot.empty) {
      console.log("❌ NO ACCOUNTS FOUND");
      console.log(
        "Run: node scripts/seed-johnson-web.mjs to create the accounts"
      );
      return false;
    }

    console.log(`📊 Total accounts found: ${accountsSnapshot.size}`);

    // Check if we have exactly 3 accounts
    if (accountsSnapshot.size !== 3) {
      console.log(
        `⚠️  WARNING: Expected 3 accounts, found ${accountsSnapshot.size}`
      );
    } else {
      console.log("✅ Correct number of accounts (3)");
    }

    // Analyze each account
    const accounts = [];
    const expectedTypes = ["primary", "savings", "checking"];
    const foundTypes = [];
    let totalBalance = 0;

    accountsSnapshot.forEach((doc) => {
      const account = doc.data();
      accounts.push({ id: doc.id, ...account });
      foundTypes.push(account.accountType);
      totalBalance += account.balance || 0;
    });

    console.log("");
    console.log("📋 Account Details:");
    console.log("================================================");

    accounts.forEach((account, index) => {
      console.log(
        `${index + 1}. ${account.displayName || account.accountName}`
      );
      console.log(`   ID: ${account.id}`);
      console.log(`   Type: ${account.accountType}`);
      console.log(
        `   Account Number: ${account.accountNumberPrefix || "****"}${account.accountNumberSuffix || account.accountNumber}`
      );
      console.log(
        `   Account Holder: ${account.accountHolderName || `${account.firstName} ${account.lastName}`}`
      );
      console.log(
        `   Balance: ${account.currency || "USD"} ${(account.balance || 0).toLocaleString()}`
      );
      console.log(`   Status: ${account.status}`);
      console.log(`   User ID: ${account.userId || account.customerUID}`);
      console.log(`   Primary: ${account.isPrimary ? "Yes" : "No"}`);
      console.log(
        `   Features: ${account.features ? account.features.length : 0} features`
      );
      console.log(`   Interest Rate: ${account.interestRate || 0}%`);
      console.log("");
    });

    console.log("📈 Summary Analysis:");
    console.log("================================================");
    console.log(
      `Total Portfolio Balance: USD ${totalBalance.toLocaleString()}`
    );
    console.log(`Account Types Found: ${foundTypes.join(", ")}`);

    // Check for Johnson Boseman
    const johnsonAccounts = accounts.filter(
      (acc) =>
        acc.userId === JOHNSON_BOSEMAN_UID ||
        acc.customerUID === JOHNSON_BOSEMAN_UID ||
        (acc.firstName === "Johnson" && acc.lastName === "Boseman")
    );

    console.log(`Johnson Boseman Accounts: ${johnsonAccounts.length}`);

    if (
      johnsonAccounts.length === accounts.length &&
      johnsonAccounts.length === 3
    ) {
      console.log("✅ All accounts belong to Johnson Boseman");
    } else {
      console.log("⚠️  Some accounts may not belong to Johnson Boseman");
    }

    // Check account types
    const missingTypes = expectedTypes.filter(
      (type) => !foundTypes.includes(type)
    );
    const extraTypes = foundTypes.filter(
      (type) => !expectedTypes.includes(type)
    );

    if (missingTypes.length === 0 && extraTypes.length === 0) {
      console.log(
        "✅ All required account types present (primary, savings, checking)"
      );
    } else {
      if (missingTypes.length > 0) {
        console.log(`❌ Missing account types: ${missingTypes.join(", ")}`);
      }
      if (extraTypes.length > 0) {
        console.log(`⚠️  Extra account types: ${extraTypes.join(", ")}`);
      }
    }

    // Admin editability check
    console.log("");
    console.log("🔧 Admin Editability Verification:");
    console.log("================================================");

    const editableFields = [
      "accountName",
      "displayName",
      "balance",
      "accountNumber",
      "routingNumber",
      "interestRate",
      "minimumBalance",
      "status",
      "features",
      "benefits",
      "nickname",
      "description",
    ];

    accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.displayName}:`);
      editableFields.forEach((field) => {
        const hasField = account.hasOwnProperty(field);
        const value = account[field];
        console.log(
          `   ${field}: ${hasField ? "✅" : "❌"} ${hasField ? (Array.isArray(value) ? `[${value.length} items]` : value) : "Missing"}`
        );
      });
      console.log("");
    });

    console.log("🎯 Verification Complete!");
    console.log("");
    console.log("💡 Next Steps:");
    console.log("1. Use admin dashboard to view/edit accounts");
    console.log("2. All account details are fully editable");
    console.log(
      "3. Run scripts/manage-johnson-accounts.cjs for CLI management"
    );

    return accounts.length === 3 && johnsonAccounts.length === 3;
  } catch (error) {
    console.error("❌ Error verifying Johnson accounts:", error);
    return false;
  }
}

// Run the verification function
verifyJohnsonAccounts()
  .then((success) => {
    if (success) {
      console.log("✨ Verification passed - All systems ready!");
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
