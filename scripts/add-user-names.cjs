// Add name fields to user documents
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(
  path.join(__dirname, "..", "service-account-key.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// User names based on their roles
const userNames = {
  BMPayIo945gjgTJpNUk3jLS9VBy1: {
    // kindestwavelover@gmail.com
    firstName: "William",
    lastName: "Miller",
    displayName: "William Miller",
    name: "William Miller",
  },
  Hg2IMBwMkqdgilzvj2psq8UuREf1: {
    // seconds@swiftbank.com
    firstName: "Sarah",
    lastName: "Johnson",
    displayName: "Sarah Johnson",
    name: "Sarah Johnson",
  },
  XImTwn3OxsfGBDXN9PxoMzYbXZ53: {
    // developer@swiftbank.com
    firstName: "Prince",
    lastName: "Yekunya",
    displayName: "Prince Yekunya",
    name: "Prince Yekunya",
  },
};

async function updateUserNames() {
  console.log("\n📝 Updating user names in Firestore...\n");

  try {
    for (const [uid, nameData] of Object.entries(userNames)) {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        await userRef.update({
          ...nameData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Updated ${nameData.displayName} (${uid})`);
      } else {
        console.log(`⚠️  User ${uid} not found in Firestore`);
      }
    }

    console.log("\n✅ All user names updated successfully!\n");

    // Verify updates
    console.log("🔍 Verifying updates...\n");
    for (const [uid, nameData] of Object.entries(userNames)) {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        console.log(`${nameData.displayName}:`);
        console.log(`   firstName: ${data.firstName}`);
        console.log(`   lastName: ${data.lastName}`);
        console.log(`   displayName: ${data.displayName}`);
        console.log(`   email: ${data.email}`);
        console.log("");
      }
    }
  } catch (error) {
    console.error("❌ Error updating user names:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

updateUserNames();
