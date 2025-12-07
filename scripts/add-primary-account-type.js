import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getFirebaseConfig, isFirebaseAvailable } from "./firebase-config.mjs";

// Get Firebase configuration securely
const firebaseConfig = getFirebaseConfig();

if (!isFirebaseAvailable()) {
  console.log('📝 Running in simulation mode - Firebase not available');
  process.exit(0);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addPrimaryAccountType() {
  try {
    const docRef = await addDoc(collection(db, "accountTypes"), {
      active: true,
      benefits: [
        "No minimum balance",
        "Free online transfers",
        "24/7 account access",
        "Mobile banking",
      ],
      category: "primary",
      createdAt: new Date().toISOString(),
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
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding document:", error);
    process.exit(1);
  }
}

addPrimaryAccountType();
