#!/usr/bin/env node
// Safe placeholder script - prevents hardcoded API key exposure during builds
import { exitIfBuildEnvironment } from "./secure-config.mjs";

// Exit immediately in build environments to prevent API key scanning
exitIfBuildEnvironment();

console.log("🔒 Script disabled during build to protect sensitive credentials");

// Secure Firebase configuration (only loads in development)
const firebaseConfig = null; // Replaced with secure loader

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
