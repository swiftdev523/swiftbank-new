import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "SAFE_PLACEHOLDER",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:placeholder",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUserData() {
  try {
    // Check John Boseman's user data
    const userRef = doc(db, "users", "mYFGjRgsARS0AheCdYUkzhMRLkk2");
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("Current user data structure:");
      console.log(JSON.stringify(userSnap.data(), null, 2));
    } else {
      console.log("User document not found");
    }
  } catch (error) {
    console.error("Error checking user data:", error);
  }

  process.exit(0);
}

checkUserData();
