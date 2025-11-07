import React, { useState, useEffect } from "react";
import { firebaseErrorHandler } from "../utils/firebaseErrorHandler";
import { isFirebaseConfigured } from "../config/firebase";

const DevelopmentNotice = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);

  useEffect(() => {
    // Only show in development mode and if Firebase is not configured
    if (
      import.meta.env.DEV &&
      (!isFirebaseConfigured || firebaseErrorHandler.fallbackMode)
    ) {
      setShowNotice(true);
    }
  }, []);

  if (!showNotice) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0 mt-0.5"></div>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">
              Development Mode
            </h4>
            <p className="text-xs text-blue-700">
              Firebase configuration required
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNotice(false)}
          className="text-blue-400 hover:text-blue-600 text-lg leading-none">
          ×
        </button>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setExpandedInfo(!expandedInfo)}
          className="text-xs text-blue-600 hover:text-blue-800 underline">
          {expandedInfo ? "Hide Details" : "Show Configuration Status"}
        </button>

        {expandedInfo && (
          <div className="mt-2 space-y-2">
            <div className="text-xs text-blue-800 font-medium">
              System Status:
            </div>

            <div className="mt-3 pt-2 border-t border-blue-200">
              <div className="text-xs text-blue-700">
                <strong>Status:</strong>
                <div className="mt-1">
                  • Firebase:{" "}
                  {isFirebaseConfigured ? "✅ Configured" : "⚠️ Not configured"}
                </div>
                <div>
                  • Mode:{" "}
                  {firebaseErrorHandler.fallbackMode
                    ? "🔄 Mock data"
                    : "🔥 Live data"}
                </div>
                <div>
                  • Performance Dashboard:{" "}
                  {process.env.NODE_ENV === "development"
                    ? "📊 Enabled"
                    : "❌ Disabled"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentNotice;
