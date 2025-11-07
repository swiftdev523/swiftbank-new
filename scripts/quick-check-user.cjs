// Quick check of user data
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(
  path.join(__dirname, "..", "service-account-key.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function checkUser() {
  try {
    const userDoc = await db
      .collection("users")
      .doc("BMPayIo945gjgTJpNUk3jLS9VBy1")
      .get();

    if (userDoc.exists) {
      const data = userDoc.data();
      console.log("\n✅ User found: kindestwavelover@gmail.com\n");
      console.log("Available fields:");
      console.log("  - email:", data.email);
      console.log("  - firstName:", data.firstName);
      console.log("  - lastName:", data.lastName);
      console.log("  - name:", data.name);
      console.log("  - displayName:", data.displayName);
      console.log("  - role:", data.role);
    } else {
      console.log("❌ User not found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

checkUser();
