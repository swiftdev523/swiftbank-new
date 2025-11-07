import { collection, query, where, getDocs } from "firebase/firestore";
import AuthenticationTester from "../src/utils/authTester.js";

// Import the missing functions
const {
  collection: firestoreCollection,
  query: firestoreQuery,
  where: firestoreWhere,
  getDocs: firestoreGetDocs,
} = await import("firebase/firestore");

async function runAuthenticationTest() {
  console.log("🔐 Firebase Authentication Test Suite");
  console.log("=====================================\n");

  const tester = new AuthenticationTester();

  try {
    const results = await tester.testAllKnownCredentials();

    console.log("\n🎯 RECOMMENDATIONS:");
    console.log("=".repeat(50));

    const successful = results.filter((r) => r.success);

    if (successful.length > 0) {
      console.log("✅ You can log in to the application using:");
      successful.forEach((account) => {
        console.log(
          `\n🔑 ${account.user?.role?.toUpperCase() || "USER"} ACCESS:`
        );
        console.log(`   Email: ${account.email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Role: ${account.user?.role || "unknown"}`);
        console.log(
          `   Dashboard: /${account.user?.role === "admin" ? "admin" : account.user?.role === "developer" ? "developer/dashboard" : "dashboard"}`
        );
      });
    }

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      console.log("\n⚠️  FAILED ACCOUNTS:");
      failed.forEach((account) => {
        console.log(`❌ ${account.email}: ${account.error || account.message}`);
        if (account.code === "auth/user-not-found") {
          console.log(
            `   → This account needs to be created in Firebase Authentication`
          );
        } else if (account.code === "auth/wrong-password") {
          console.log(
            `   → The password might be different from what we tested`
          );
        }
      });
    }

    console.log("\n🎮 NEXT STEPS:");
    console.log("=".repeat(50));
    console.log(
      "1. Use the working credentials above to log into the application"
    );
    console.log(
      "2. Visit http://localhost:5173/developer/setup if developer account needs setup"
    );
    console.log(
      "3. Once logged in, create new admins/customers - they will automatically get Firebase Auth accounts"
    );
    console.log(
      "4. All new users will be able to log in with their generated credentials"
    );
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run the test
runAuthenticationTest().catch(console.error);
