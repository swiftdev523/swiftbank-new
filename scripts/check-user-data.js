import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo1ezOaGvNhJUWFrQGjlhwKic2UW7Pz6w",
  authDomain: "clbank-14206.firebaseapp.com",
  projectId: "clbank-14206",
  storageBucket: "clbank-14206.firebasestorage.app",
  messagingSenderId: "721572118498",
  appId: "1:721572118498:web:203dd599da7c504d56b2ac",
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
