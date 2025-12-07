// scripts/firebase-config.mjs
// Secure Firebase configuration for scripts
// This file reads from environment variables to avoid hardcoded secrets

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

export const getFirebaseConfig = () => {
  // Check if we're in a CI/build environment where we should skip Firebase operations
  if (process.env.CI === 'true' || process.env.NETLIFY === 'true') {
    console.warn('⚠️ Detected CI/Build environment. Firebase operations will be skipped.');
    return null;
  }

  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  // Validate that all required config values are present
  const missingConfig = Object.entries(config)
    .filter(([key, value]) => key !== 'measurementId' && !value)
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    console.warn('⚠️ Missing Firebase configuration:', missingConfig);
    console.warn('📝 Scripts will run in simulation mode without Firebase connectivity');
    return null;
  }

  return config;
};

// Export a function to check if Firebase is available
export const isFirebaseAvailable = () => {
  return getFirebaseConfig() !== null;
};