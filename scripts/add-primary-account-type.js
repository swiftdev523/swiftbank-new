import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwH4A5HML5FGN-W6F3p9CIJ4qG2NBhQEQ",
  authDomain: "swiftbank-2811b.firebaseapp.com",
  projectId: "swiftbank-2811b",
  storageBucket: "swiftbank-2811b.firebasestorage.app",
  messagingSenderId: "368630072583",
  appId: "1:368630072583:web:fd8bbceedb88fdda7c2e1c",
};

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
