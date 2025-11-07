// Script to add Primary Account document to accountTypes collection
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // You'll need this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "swiftbank-2811b",
});

const db = admin.firestore();

async function addPrimaryAccountType() {
  try {
    const docRef = await db.collection("accountTypes").add({
      active: true,
      benefits: [
        "No minimum balance",
        "Free online transfers",
        "24/7 account access",
        "Mobile banking",
      ],
      category: "primary",
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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

    console.log("Primary Account type added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

addPrimaryAccountType();
