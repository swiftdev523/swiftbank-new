const admin = require("firebase-admin");

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

async function verifyAccountTypes() {
  try {
    console.log("🔍 Verifying account types in Firestore...");

    const accountTypesCollection = db.collection("accountTypes");
    const snapshot = await accountTypesCollection.get();

    console.log(`📊 Total documents found: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log("❌ No account types found in the database");
      return false;
    }

    // Expected account types
    const expectedTypes = new Set(["primary", "savings", "current"]);
    const foundTypes = new Set();
    const documents = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      foundTypes.add(doc.id);
      documents.push({
        id: doc.id,
        name: data.name,
        category: data.category,
        displayName: data.displayName,
        description: data.description,
        status: data.status,
        currentBalance: data.currentBalance,
        currency: data.currency,
        features: data.features?.length || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // Check if we have exactly the expected types
    const hasAllExpected =
      expectedTypes.size === foundTypes.size &&
      [...expectedTypes].every((type) => foundTypes.has(type));

    console.log("\n📋 Account Types Summary:");
    console.log("========================");

    documents
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.name} (ID: ${doc.id})`);
        console.log(`   Display Name: ${doc.displayName}`);
        console.log(`   Category: ${doc.category}`);
        console.log(`   Status: ${doc.status}`);
        console.log(
          `   Balance: ${doc.currency} ${doc.currentBalance?.toLocaleString() || "N/A"}`
        );
        console.log(`   Features: ${doc.features} features configured`);
        console.log(`   Description: ${doc.description?.substring(0, 80)}...`);
        console.log(
          `   Created: ${doc.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}`
        );
        console.log(
          `   Updated: ${doc.updatedAt?.toDate?.()?.toLocaleDateString() || "N/A"}`
        );
      });

    console.log("\n🎯 Verification Results:");
    console.log("========================");

    if (hasAllExpected) {
      console.log("✅ SUCCESS: All 3 expected account types found");
      console.log("✅ Expected types: primary, savings, current");
      console.log("✅ Found types:", Array.from(foundTypes).sort().join(", "));
    } else {
      console.log("❌ FAILED: Account types do not match expectations");
      console.log("🎯 Expected:", Array.from(expectedTypes).sort().join(", "));
      console.log("📍 Found:", Array.from(foundTypes).sort().join(", "));

      const missing = [...expectedTypes].filter(
        (type) => !foundTypes.has(type)
      );
      const extra = [...foundTypes].filter((type) => !expectedTypes.has(type));

      if (missing.length > 0) {
        console.log("⚠️  Missing:", missing.join(", "));
      }
      if (extra.length > 0) {
        console.log("⚠️  Extra:", extra.join(", "));
      }
    }

    // Additional validation checks
    console.log("\n🔍 Data Validation:");
    console.log("==================");

    let validationPassed = true;

    for (const doc of documents) {
      const issues = [];

      if (!doc.name) issues.push("missing name");
      if (!doc.category) issues.push("missing category");
      if (!doc.displayName) issues.push("missing displayName");
      if (!doc.description) issues.push("missing description");
      if (typeof doc.currentBalance !== "number")
        issues.push("invalid currentBalance");
      if (!doc.currency) issues.push("missing currency");
      if (!doc.status) issues.push("missing status");

      if (issues.length > 0) {
        console.log(`❌ ${doc.id}: ${issues.join(", ")}`);
        validationPassed = false;
      } else {
        console.log(`✅ ${doc.id}: all required fields present`);
      }
    }

    const overallSuccess = hasAllExpected && validationPassed;

    console.log("\n📊 Final Result:");
    console.log("================");
    console.log(`Count Check: ${hasAllExpected ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`Data Check: ${validationPassed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`Overall: ${overallSuccess ? "✅ SUCCESS" : "❌ FAILED"}`);

    return overallSuccess;
  } catch (error) {
    console.error("❌ Error verifying account types:", error);
    throw error;
  }
}

// Run the verification function
if (require.main === module) {
  verifyAccountTypes()
    .then((success) => {
      if (success) {
        console.log("\n🎉 Verification completed successfully!");
        process.exit(0);
      } else {
        console.log("\n💥 Verification failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Verification process failed:", error);
      process.exit(1);
    });
}

module.exports = { verifyAccountTypes };
