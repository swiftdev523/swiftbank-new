const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(
  path.join(__dirname, "..", "service-account-key.json")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://swiftbank-2811b-default-rtdb.firebaseio.com",
  });
}

const db = admin.firestore();

async function setAllUsersActive() {
  try {
    console.log("🔄 Fetching all users from Firestore...");

    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("❌ No users found in Firestore");
      return;
    }

    console.log(`📊 Found ${usersSnapshot.size} users`);

    const batch = db.batch();
    let updatedCount = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();

      // Only update if isActive is not already set
      if (userData.isActive === undefined || userData.isActive === null) {
        console.log(
          `🔄 Setting isActive: true for user: ${userData.email || doc.id}`
        );
        batch.update(doc.ref, {
          isActive: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updatedCount++;
      } else {
        console.log(
          `✅ User ${userData.email || doc.id} already has isActive: ${userData.isActive}`
        );
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
      console.log(
        `✅ Successfully set isActive: true for ${updatedCount} users`
      );
    } else {
      console.log("✅ All users already have isActive field set");
    }

    // Display current status
    console.log("\n📊 Current User Status:");
    const updatedSnapshot = await db.collection("users").get();
    updatedSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(
        `  - ${data.email || doc.id}: isActive = ${data.isActive}, role = ${data.role}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting users active:", error);
    process.exit(1);
  }
}

setAllUsersActive();
