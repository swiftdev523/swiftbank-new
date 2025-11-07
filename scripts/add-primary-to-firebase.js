// Simple script to add Primary Account document to Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBaLBKaK_CLr2j74Vm_hRRc4nrMgkX_9Bs",
  authDomain: "swiftbank-2811b.firebaseapp.com",
  projectId: "swiftbank-2811b",
  storageBucket: "swiftbank-2811b.firebasestorage.app",
  messagingSenderId: "787764194169",
  appId: "1:787764194169:web:19ccc445fb743f71ea5da8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function addPrimaryAccountType() {
  try {
    console.log("🔄 Adding Primary Account type to Firebase...");

    // Use your existing user credentials (John Boseman's account)
    await signInWithEmailAndPassword(
      auth,
      "johnboseman@swiftbank.com",
      "password123"
    );
    console.log("✅ Authenticated successfully");

    const docRef = await addDoc(collection(db, "accountTypes"), {
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
      "🎉 Success! Check your Firebase Console -> accountTypes collection"
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("💡 Make sure you have the correct email/password");
    process.exit(1);
  }
}

addPrimaryAccountType();
