// Utility to create the missing primary account for the customer
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgDQPF7YsUg8rR_aFE3_fHaEOFkVT8lN8",
  authDomain: "cl-bank-c82fc.firebaseapp.com",
  projectId: "cl-bank-c82fc",
  storageBucket: "cl-bank-c82fc.firebasestorage.app",
  messagingSenderId: "885244929138",
  appId: "1:885244929138:web:ba8fae7b84a65e87b55c5f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate account number
const generateAccountNumber = () => {
  return (
    "4" +
    Math.floor(Math.random() * 1000000000000000)
      .toString()
      .padStart(15, "0")
  );
};

export const createMissingAccount = async () => {
  try {
    const customerUID = "mYFGjRgsARS0AheCdYUkzhMRLkk2"; // John Boseman's UID

    // Create the missing primary checking account
    const primaryAccount = {
      userId: customerUID,
      type: "checking",
      accountNumber: generateAccountNumber(),
      accountName: "Primary Checking",
      balance: 8750.3,
      currency: "USD",
      status: "active",
      active: true,
      createdAt: new Date().toISOString(),
      lastTransaction: new Date().toISOString(),
      interestRate: 0.01,
      minimumBalance: 0,
      features: [
        "debit_card",
        "online_banking",
        "mobile_banking",
        "atm_access",
      ],
      isPrimary: true, // Mark as primary account
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, "accounts"), primaryAccount);
    console.log("✅ Primary account created with ID:", docRef.id);
    console.log("Account details:", primaryAccount);

    return true;
  } catch (error) {
    console.error("❌ Error creating account:", error);
    return false;
  }
};

// Make it available globally
window.createMissingAccount = createMissingAccount;

console.log(
  "🏦 Account creator loaded. Run createMissingAccount() in console to create the missing primary account."
);
