import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

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

async function updateUserNameFields() {
  try {
    console.log("Updating user data with firstName and lastName fields...");

    // John Boseman's user data
    const userId = "mYFGjRgsARS0AheCdYUkzhMRLkk2";
    const userRef = doc(db, "users", userId);

    // First, check current data
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentData = userSnap.data();
      console.log("Current user data:", currentData);

      // Update with firstName and lastName
      const updateData = {
        firstName: "John",
        lastName: "Boseman",
        ...currentData, // Preserve existing data
      };

      await updateDoc(userRef, updateData);
      console.log("Successfully updated user with firstName and lastName");

      // Verify the update
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        console.log("Updated user data:", updatedSnap.data());
      }
    } else {
      console.log("User document not found");
    }
  } catch (error) {
    console.error("Error updating user data:", error);
  }

  process.exit(0);
}

updateUserNameFields();
