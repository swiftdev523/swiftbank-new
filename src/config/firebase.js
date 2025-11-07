import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Analytics disabled to prevent API key errors
// import { getAnalytics } from "firebase/analytics";

// Firebase configuration - using environment variables only
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Add this for completeness
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const missingFields = requiredFields.filter(
    (field) => !import.meta.env[field]
  );

  // Log current environment for debugging
  console.log("🔍 Environment check:", {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    hasApiKey: !!config.apiKey,
    projectId: config.projectId || "MISSING",
    authDomain: config.authDomain || "MISSING",
  });

  if (missingFields.length > 0) {
    if (import.meta.env.DEV) {
      console.warn(
        "⚠️ Missing Firebase configuration in development mode:",
        missingFields
      );
      return false; // Allow development without Firebase
    } else {
      console.error(
        "❌ Missing Firebase configuration in production:",
        missingFields
      );
      console.error(
        "🔧 Please set these environment variables in Netlify:",
        requiredFields
      );
      return false; // Don't throw error, gracefully handle
    }
  }
  return true;
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;
let isFirebaseConfigured = false;

try {
  // Always try to initialize Firebase
  console.log("🔥 Initializing Firebase with config:", {
    apiKey: firebaseConfig.apiKey
      ? `${firebaseConfig.apiKey.slice(0, 10)}...`
      : "MISSING",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize essential Firebase services only
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Analytics disabled to prevent API errors
  // Uncomment and configure Analytics only if needed and properly set up
  // if (import.meta.env.PROD && firebaseConfig.measurementId) {
  //   try {
  //     analytics = getAnalytics(app);
  //     console.log('📊 Analytics initialized');
  //   } catch (analyticsError) {
  //     console.warn('⚠️ Analytics initialization failed:', analyticsError.message);
  //   }
  // }

  isFirebaseConfigured = true;
  console.log("✅ Firebase initialized successfully");

  // Validate configuration after initialization
  const configValid = validateConfig();
  if (!configValid && import.meta.env.PROD) {
    console.warn(
      "⚠️ Firebase initialized with fallback config - please set proper environment variables"
    );
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  console.error("🔧 This usually means:");
  console.error("   1. Environment variables are not set in Netlify");
  console.error("   2. Firebase project configuration is incorrect");
  console.error("   3. Domain is not authorized in Firebase console");

  // Fallback for development or when Firebase fails
  if (import.meta.env.DEV) {
    console.warn(
      "🔄 Running in development mode without Firebase - using mock data"
    );
  } else {
    console.error(
      "💥 Production Firebase initialization failed - app may not work correctly"
    );
  }
}

export { app, auth, db, storage, analytics, isFirebaseConfigured };
export default app;
