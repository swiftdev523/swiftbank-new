const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(
  path.join(__dirname, "..", "service-account-key.json")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkUserData() {
  try {
    console.log("🔍 Checking William Miller and developer data...");

    // Get William Miller's document
    const williamDoc = await db
      .collection("users")
      .doc("BMPayIo945gjgTJpNUk3jLS9VBy1")
      .get();

    if (williamDoc.exists) {
      const williamData = williamDoc.data();
      console.log("\n👤 William Miller Data:");
      console.log("  - Email:", williamData.email);
      console.log("  - Role:", williamData.role);
      console.log("  - isActive:", williamData.isActive);
      console.log("  - createdBy:", williamData.createdBy);
      console.log("  - assignedAdmin:", williamData.assignedAdmin);
    } else {
      console.log("❌ William Miller document not found");
      return;
    }

    // Get developer document
    const developerDoc = await db
      .collection("users")
      .doc("XImTwn3OxsfGBDXN9PxoMzYbXZ53")
      .get();

    if (developerDoc.exists) {
      const developerData = developerDoc.data();
      console.log("\n🔧 Developer Data:");
      console.log("  - Email:", developerData.email);
      console.log("  - Role:", developerData.role);
      console.log("  - UID: XImTwn3OxsfGBDXN9PxoMzYbXZ53");
    } else {
      console.log("❌ Developer document not found");
    }

    // Check if William was created by this developer
    const williamData = williamDoc.data();
    if (
      williamData &&
      williamData.createdBy === "XImTwn3OxsfGBDXN9PxoMzYbXZ53"
    ) {
      console.log("\n✅ William Miller WAS created by the current developer");
    } else if (williamData && williamData.createdBy) {
      console.log(
        "\n⚠️ William Miller was created by a different developer:",
        williamData.createdBy
      );
    } else {
      console.log("\n❌ William Miller has NO createdBy field");

      // Let's fix this by setting the createdBy field
      console.log("🔧 Setting createdBy field for William Miller...");
      await db.collection("users").doc("BMPayIo945gjgTJpNUk3jLS9VBy1").update({
        createdBy: "XImTwn3OxsfGBDXN9PxoMzYbXZ53",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ Fixed: William Miller now has createdBy field set");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking user data:", error);
    process.exit(1);
  }
}

checkUserData();
