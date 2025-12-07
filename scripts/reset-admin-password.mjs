import admin from "firebase-admin";
import { readFileSync } from "fs";

// Initialize Firebase Admin SDK
// Note: This requires a service account key
console.log("🔧 Firebase Admin SDK Password Reset Tool");

try {
  // Try to initialize with default credentials (if available)
  admin.initializeApp({
    projectId: "swiftbank-2811b",
  });

  console.log("✅ Firebase Admin SDK initialized");

  // Reset password for Seconds Wave admin
  const resetPassword = async () => {
    try {
      const uid = "pcwE3m8EnNSeMTrx3JOckHUj15H2";
      const newPassword =
        process.env.NEW_ADMIN_PASSWORD || generateSecurePassword();

      function generateSecurePassword() {
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        return Array.from(
          { length: 12 },
          () => chars[Math.floor(Math.random() * chars.length)]
        ).join("");
      }

      console.log(`🔐 Resetting password for UID: ${uid}`);

      await admin.auth().updateUser(uid, {
        password: newPassword,
      });

      console.log(`✅ Password reset successful!`);
      console.log(`📧 Email: seconds@swiftbank.com`);
      console.log(`🔑 New Password: ${newPassword}`);
    } catch (error) {
      console.error("❌ Password reset failed:", error.message);
    }
  };

  resetPassword();
} catch (error) {
  console.error("❌ Admin SDK initialization failed:", error.message);
  console.log("💡 You may need to set up service account credentials");
  console.log(
    "💡 Alternatively, use the web admin tools page to reset the password"
  );
}
