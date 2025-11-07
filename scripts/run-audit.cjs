#!/usr/bin/env node

/**
 * Wait for service account key and then run comprehensive audit
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  "..",
  "service-account-key.json"
);

console.log("🔍 Checking for service account key...\n");
console.log("Expected location:", SERVICE_ACCOUNT_PATH);
console.log("");

if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.log("✅ Service account key found!");
  console.log("🚀 Running comprehensive audit...\n");
  console.log("=".repeat(80));
  console.log("");

  // Run the comprehensive audit
  const audit = spawn("node", ["scripts/comprehensive-audit.cjs"], {
    stdio: "inherit",
    shell: true,
  });

  audit.on("close", (code) => {
    process.exit(code);
  });
} else {
  console.log("❌ Service account key not found!");
  console.log("");
  console.log("📋 INSTRUCTIONS:");
  console.log("=".repeat(80));
  console.log("");
  console.log("1. The Firebase Console should be open in your browser");
  console.log(
    "   URL: https://console.firebase.google.com/project/swiftbank-2811b/settings/serviceaccounts/adminsdk"
  );
  console.log("");
  console.log('2. Click the "Generate New Private Key" button');
  console.log("");
  console.log('3. Click "Generate Key" in the confirmation dialog');
  console.log("");
  console.log("4. Save the downloaded JSON file as:");
  console.log("   service-account-key.json");
  console.log("");
  console.log("5. Move it to this location:");
  console.log(`   ${SERVICE_ACCOUNT_PATH}`);
  console.log("");
  console.log("6. Run this script again:");
  console.log("   node scripts/comprehensive-audit.cjs");
  console.log("");
  console.log("=".repeat(80));
  console.log("");
  console.log("⏳ Waiting for service account key...");
  console.log("   (Press Ctrl+C to cancel)");
  console.log("");

  // Watch for the file
  let checking = setInterval(() => {
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      clearInterval(checking);
      console.log("\n✅ Service account key detected!");
      console.log("🚀 Running comprehensive audit...\n");

      const audit = spawn("node", ["scripts/comprehensive-audit.cjs"], {
        stdio: "inherit",
        shell: true,
      });

      audit.on("close", (code) => {
        process.exit(code);
      });
    } else {
      process.stdout.write(".");
    }
  }, 2000);
}
