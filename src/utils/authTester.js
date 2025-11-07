import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../config/firebase.js";

// Test Firebase Authentication with your existing accounts
class AuthenticationTester {
  async testCredentials(email, password) {
    try {
      console.log(`🔐 Testing login for: ${email}`);

      // Try to sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log(`✅ Firebase Auth successful for ${email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email Verified: ${user.emailVerified}`);

      // Try to get user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log(`✅ Firestore user data found:`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
        console.log(`   Active: ${userData.isActive}`);
        return {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            ...userData,
          },
        };
      } else {
        console.log(
          `⚠️  No Firestore user document found for UID: ${user.uid}`
        );

        // Search for user by email in all documents
        console.log(`🔍 Searching for user by email in Firestore...`);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          console.log(`✅ Found user by email:`);
          console.log(`   Document ID: ${userDoc.id}`);
          console.log(`   Role: ${userData.role}`);
          console.log(`   Name: ${userData.firstName} ${userData.lastName}`);

          return {
            success: true,
            user: {
              uid: user.uid,
              email: user.email,
              firestoreId: userDoc.id,
              ...userData,
            },
            note: "User found by email, UID mismatch with Firestore document ID",
          };
        } else {
          return {
            success: false,
            message: "User authenticated but no Firestore data found",
          };
        }
      }
    } catch (error) {
      console.error(`❌ Login failed for ${email}:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  async testAllKnownCredentials() {
    console.log("🚀 Testing all known Firebase Authentication accounts...\n");

    const testAccounts = [
      {
        email: "developer@swiftbank.com",
        password: "Developer123!",
        expectedRole: "developer",
      },
      {
        email: "seconds@swiftbank.com",
        password: "Admin123!",
        expectedRole: "admin",
      },
      {
        email: "kindestwavelover@gmail.com",
        password: "Admin123!", // This might be different
        expectedRole: "admin",
      },
    ];

    const results = [];

    for (const account of testAccounts) {
      const result = await this.testCredentials(
        account.email,
        account.password
      );
      results.push({
        ...account,
        ...result,
      });

      console.log("---\n");

      // Add delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Summary
    console.log("📊 SUMMARY:");
    console.log("=".repeat(50));

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`✅ Successful logins: ${successful.length}/${results.length}`);
    successful.forEach((r) => {
      console.log(`   ${r.email} (${r.user?.role || "unknown role"})`);
    });

    if (failed.length > 0) {
      console.log(`❌ Failed logins: ${failed.length}/${results.length}`);
      failed.forEach((r) => {
        console.log(`   ${r.email}: ${r.error || r.message}`);
      });
    }

    return results;
  }

  async createMissingFirestoreDocuments() {
    console.log("🔧 Attempting to create missing Firestore documents...\n");

    // This would create Firestore documents for Firebase Auth users that don't have them
    // Implementation would go here if needed
  }
}

export default AuthenticationTester;
