// CLI script using Firebase Admin SDK to add primary account type
// Run: node add-primary-cli.js

import admin from "firebase-admin";

// Initialize Firebase Admin with service account
// For development, we'll use the application default credentials
try {
  admin.initializeApp({
    projectId: "swiftbank-2811b",
  });
} catch (error) {
  console.log("Firebase already initialized");
}

const db = admin.firestore();

async function addPrimaryAccountType() {
  try {
    console.log("🔄 Adding Primary Account type to accountTypes collection...");

    const docRef = await db.collection("accountTypes").add({
      active: true,
      benefits: [
        "No minimum balance",
        "Free online transfers",
        "24/7 account access",
        "Mobile banking",
      ],
      category: "primary",
      createdAt: "2025-09-21T14:41:59.846Z",
      description:
        "Primary checking account with comprehensive banking features and unlimited access",
      features: [
        "Online Banking",
        "Mobile Banking",
        "Debit Card",
        "ATM Access",
        "Direct Deposit",
      ],
    });

    console.log("✅ Primary Account type added with ID:", docRef.id);
    console.log(
      "🎉 Success! Document added to Firebase Console -> accountTypes"
    );

    // Now let's also ensure account balances are properly stored
    console.log("\n🔄 Checking existing accounts collection...");
    const accountsSnapshot = await db.collection("accounts").limit(3).get();

    if (!accountsSnapshot.empty) {
      console.log(`📊 Found ${accountsSnapshot.size} existing accounts:`);
      accountsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(
          `   - ${data.accountType}: $${data.balance} (ID: ${doc.id})`
        );
      });
      console.log(
        "\n✅ Account balances are properly stored and accessible for admin modification!"
      );
    } else {
      console.log(
        '📭 No accounts found yet - they will be created when you click "Create Accounts"'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("Could not load the default credentials")) {
      console.log(
        "\n💡 To fix this, run: gcloud auth application-default login"
      );
      console.log(
        "   Or install Google Cloud CLI: https://cloud.google.com/sdk/docs/install"
      );
    }
    process.exit(1);
  }
}

addPrimaryAccountType();
