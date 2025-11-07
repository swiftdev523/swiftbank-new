#!/usr/bin/env node

/**
 * Quick Firebase Configuration Check
 *
 * This script checks if your Firebase environment variables are properly set.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get current script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkFirebaseConfig() {
  console.log("🔍 Checking Firebase configuration...\n");

  // Try to load .env file
  let envVars = {};
  try {
    const envPath = join(__dirname, "..", ".env");
    const envFile = readFileSync(envPath, "utf8");

    envFile.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
      }
    });

    console.log("✅ Found .env file");
  } catch (error) {
    console.log("⚠️  No .env file found, checking environment variables");
  }

  // Check required Firebase config
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  let allConfigured = true;

  console.log("📋 Configuration Status:");
  requiredVars.forEach((varName) => {
    const value = process.env[varName] || envVars[varName];
    if (value) {
      const masked =
        varName.includes("KEY") || varName.includes("ID")
          ? value.slice(0, 8) + "..."
          : value;
      console.log(`   ✅ ${varName}: ${masked}`);
    } else {
      console.log(`   ❌ ${varName}: Not set`);
      allConfigured = false;
    }
  });

  console.log("\\n" + "=".repeat(60));

  if (allConfigured) {
    console.log("🎉 All Firebase configuration variables are set!");
    console.log("\\n🚀 You can now run:");
    console.log("   npm run setup:developer");
  } else {
    console.log("⚠️  Some Firebase configuration is missing.");
    console.log("\\n🔧 To fix this:");
    console.log("   1. Create a .env file in the project root");
    console.log("   2. Add your Firebase config variables");
    console.log("   3. Run this check again");
    console.log("\\n📝 Example .env file:");
    console.log("   VITE_FIREBASE_API_KEY=your-api-key");
    console.log("   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com");
    console.log("   VITE_FIREBASE_PROJECT_ID=your-project-id");
    console.log("   # ... etc");
  }

  return allConfigured;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  checkFirebaseConfig();
}
