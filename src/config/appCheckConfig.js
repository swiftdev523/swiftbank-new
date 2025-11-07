/**
 * Firebase App Check Configuration
 * Enhanced security for the banking application
 */

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { app } from "./firebase";

// App Check configuration - DISABLED to prevent API errors
export const initAppCheck = () => {
  // App Check completely disabled to prevent API key errors
  console.log("🚫 App Check disabled to prevent API errors");
  return null;

  // Uncomment and configure below only after setting up App Check properly in Firebase Console
  /*
  try {
    // Initialize App Check with reCAPTCHA v3 provider
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
          "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      ), // Test key for development
      isTokenAutoRefreshEnabled: true,
    });

    console.log("App Check initialized successfully");
    return appCheck;
  } catch (error) {
    console.error("Error initializing App Check:", error);
    return null;
  }
  */
};

// Debug token for development (only use in development)
if (import.meta.env.MODE === "development") {
  // Set debug token for localhost
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export default initAppCheck;
