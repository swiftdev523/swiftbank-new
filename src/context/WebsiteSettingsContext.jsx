import React, { createContext, useContext, useState, useEffect } from "react";
import firestoreService from "../services/firestoreService";

const WebsiteSettingsContext = createContext();

export const useWebsiteSettings = () => {
  const context = useContext(WebsiteSettingsContext);
  if (!context) {
    throw new Error(
      "useWebsiteSettings must be used within a WebsiteSettingsProvider"
    );
  }
  return context;
};

export const WebsiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    bankName: "Swift Bank",
    tagline: "Online Banking Portal",
    description:
      "Your trusted financial partner for secure and convenient banking solutions.",
    website: "https://www.swiftbank.com",
    logoUrl: "/bank-logo.png",
    phone: "+1 (555) 123-4567",
    email: "support@swiftbank.com",
    address: "123 Financial District, New York, NY 10001",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Real-time subscription to website settings
    let listenerId = null;
    (async () => {
      try {
        listenerId = await firestoreService.subscribeToDocument(
          "bankSettings",
          "website",
          (doc, err) => {
            if (err) {
              console.log(
                "Website settings subscription error (ignoring):",
                err.message
              );
              return;
            }
            if (doc) {
              setSettings((prev) => ({ ...prev, ...doc }));
            }
          }
        );
      } catch (e) {
        console.log(
          "Could not subscribe to website settings, using one-time load only"
        );
      }
    })();

    return () => {
      if (listenerId) {
        try {
          firestoreService.unsubscribe(listenerId);
        } catch {}
      }
    };
  }, []);

  // Keep browser tab title in sync with bank name
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.title = settings?.bankName || "Banking App";
      }
    } catch {}
  }, [settings?.bankName]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Try to get website settings from Firebase
      const settingsData = await firestoreService.read(
        "bankSettings",
        "website"
      );

      if (settingsData) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...settingsData,
        }));
      } else {
        // Document doesn't exist, create it with default settings
        console.log(
          "Website settings document not found, creating with defaults"
        );
        try {
          // create(collectionName, data, docId)
          await firestoreService.create("bankSettings", settings, "website");
        } catch (createError) {
          console.log(
            "Could not create settings document, using defaults only"
          );
        }
      }
    } catch (error) {
      console.log(
        "No website settings found in database, using defaults:",
        error.message
      );
      // Just use default settings without trying to save
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      // Try to update first, if it fails try to create
      try {
        await firestoreService.update("bankSettings", "website", newSettings);
      } catch (updateError) {
        // If update fails, try to create the document
        console.log("Update failed, trying to create document");
        await firestoreService.create("bankSettings", "website", newSettings);
      }
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error("Error saving website settings:", error);
      // Don't throw - just log and continue with local settings
      return false;
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  };

  const value = {
    settings,
    loading,
    saveSettings,
    updateSetting,
    loadSettings,
  };

  return (
    <WebsiteSettingsContext.Provider value={value}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
};

export default WebsiteSettingsContext;
