// Debug utility to check Firebase/Firestore data
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// Firebase config - using the same config from the app
const firebaseConfig = {
  apiKey: "AIzaSyAgDQPF7YsUg8rR_aFE3_fHaEOFkVT8lN8",
  authDomain: "cl-bank-c82fc.firebaseapp.com",
  projectId: "cl-bank-c82fc",
  storageBucket: "cl-bank-c82fc.firebasestorage.app",
  messagingSenderId: "885244929138",
  appId: "1:885244929138:web:ba8fae7b84a65e87b55c5f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const debugUserData = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log("❌ No user currently authenticated");
    return;
  }

  console.log("🔍 Debug - Current Firebase Auth User:");
  console.log("  UID:", currentUser.uid);
  console.log("  Email:", currentUser.email);
  console.log("  Display Name:", currentUser.displayName);
  console.log("  Email Verified:", currentUser.emailVerified);

  // Check Firestore user profile
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("🔍 Debug - Firestore User Profile:");
      console.log(userData);
      console.log("  Name field specifically:", userData.name);
    } else {
      console.log("❌ No Firestore profile found for user");
    }
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
  }

  // Check user accounts
  try {
    const accountsQuery = query(
      collection(db, "accounts"),
      where("userId", "==", currentUser.uid)
    );
    const accountsSnapshot = await getDocs(accountsQuery);

    console.log(`🔍 Debug - User Accounts (${accountsSnapshot.size} found):`);
    accountsSnapshot.forEach((doc) => {
      console.log("  Account:", doc.id, doc.data());
    });
  } catch (error) {
    console.error("❌ Error fetching user accounts:", error);
  }
};

// Make it available globally for console debugging
window.debugUserData = debugUserData;

console.log(
  "🔧 Debug utility loaded. Run debugUserData() in console to check user data."
);
