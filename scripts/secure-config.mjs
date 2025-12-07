// Secure script configuration
// This file should NOT contain any hardcoded API keys

export const SCRIPT_CONFIG = {
  // Environment detection
  isCI: process.env.CI === "true" || process.env.NETLIFY === "true",
  isDevelopment: process.env.NODE_ENV === "development",

  // Safe project identifiers (not sensitive)
  projectInfo: {
    name: "SwiftBank",
    description: "Modern Banking Application",
  },

  // Simulation mode message
  simulationMessage:
    "📝 Running in simulation mode - Firebase operations skipped for security",
};

// Function to safely exit scripts in build environments
export function exitIfBuildEnvironment() {
  if (SCRIPT_CONFIG.isCI) {
    console.log(SCRIPT_CONFIG.simulationMessage);
    console.log(
      "✅ Build environment detected - script execution completed safely"
    );
    process.exit(0);
  }
}

// Safe configuration loader (returns null in build environments)
export function getSecureConfig() {
  if (SCRIPT_CONFIG.isCI) {
    return null;
  }

  // Only load environment variables in non-build environments
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };
}
