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

async function fixAllMissingCreatedBy() {
  try {
    console.log("🔍 Finding all users without createdBy field...");

    const usersSnapshot = await db.collection("users").get();
    const developerUid = "XImTwn3OxsfGBDXN9PxoMzYbXZ53";
    let fixedCount = 0;

    console.log(`📊 Checking ${usersSnapshot.size} users...`);

    const batch = db.batch();

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();

      // Skip developers - they don't need createdBy
      if (userData.role === "developer") {
        return;
      }

      // If user is admin or customer but has no createdBy, fix it
      if (
        (userData.role === "admin" || userData.role === "customer") &&
        !userData.createdBy
      ) {
        console.log(`🔧 Fixing ${userData.role}: ${userData.email || doc.id}`);

        batch.update(doc.ref, {
          createdBy: developerUid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        fixedCount++;
      }
    });

    if (fixedCount > 0) {
      await batch.commit();
      console.log(`✅ Fixed ${fixedCount} users - added createdBy field`);
    } else {
      console.log("✅ All users already have createdBy field set correctly");
    }

    // Now verify the queries work
    console.log("\n🔍 Testing getCustomersByDeveloper query...");

    const customersQuery = await db
      .collection("users")
      .where("createdBy", "==", developerUid)
      .where("role", "==", "customer")
      .get();

    console.log(
      `📊 Found ${customersQuery.size} customers created by developer`
    );

    customersQuery.forEach((doc) => {
      const data = doc.data();
      console.log(
        `  - ${data.firstName || "Unknown"} ${data.lastName || "User"} (${data.email || doc.id}) - isActive: ${data.isActive}`
      );
    });

    const adminsQuery = await db
      .collection("users")
      .where("createdBy", "==", developerUid)
      .where("role", "==", "admin")
      .get();

    console.log(`📊 Found ${adminsQuery.size} admins created by developer`);

    adminsQuery.forEach((doc) => {
      const data = doc.data();
      console.log(
        `  - ${data.firstName || "Unknown"} ${data.lastName || "User"} (${data.email || doc.id}) - isActive: ${data.isActive}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing createdBy fields:", error);
    process.exit(1);
  }
}

fixAllMissingCreatedBy();
