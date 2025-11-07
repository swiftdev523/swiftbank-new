import React, { useState, useEffect } from "react";

/**
 * Firebase Error Display Component
 * Shows user-friendly messages for Firebase quota and other errors
 */
const FirebaseErrorDisplay = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Listen for Firebase quota errors
    const handleError = (event) => {
      const error = event.detail || event.error;

      if (!error) return;

      const isFirebaseQuotaError =
        error.code === "resource-exhausted" ||
        error.message?.includes("quota") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.message?.includes("429");

      if (isFirebaseQuotaError) {
        const errorMsg = {
          id: Date.now(),
          type: "quota",
          message:
            "Service temporarily limited due to high usage. Please wait a moment and try again.",
          timestamp: new Date().toLocaleTimeString(),
        };

        setErrors((prev) => {
          // Prevent duplicate error messages
          const exists = prev.some(
            (e) => e.type === "quota" && Date.now() - e.id < 30000
          );
          if (exists) return prev;

          return [...prev.slice(-2), errorMsg]; // Keep only last 3 errors
        });

        // Auto-remove error after 10 seconds
        setTimeout(() => {
          setErrors((prev) => prev.filter((e) => e.id !== errorMsg.id));
        }, 10000);
      }
    };

    // Listen for global errors
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (event) => {
      handleError({ error: event.reason });
    });

    // Custom Firebase error event
    window.addEventListener("firebaseError", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
      window.removeEventListener("firebaseError", handleError);
    };
  }, []);

  const dismissError = (errorId) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-md
            animate-slide-in-right backdrop-blur-sm border
            ${
              error.type === "quota"
                ? "bg-amber-50/95 border-amber-200 text-amber-800"
                : "bg-red-50/95 border-red-200 text-red-800"
            }
          `}>
          <div className="flex-shrink-0">
            {error.type === "quota" ? (
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium">
              {error.type === "quota"
                ? "Service Temporarily Limited"
                : "Service Error"}
            </p>
            <p className="text-xs opacity-90 mt-1">{error.message}</p>
            <p className="text-xs opacity-70 mt-2">{error.timestamp}</p>
          </div>

          <button
            onClick={() => dismissError(error.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to dispatch Firebase errors
export const dispatchFirebaseError = (error) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("firebaseError", { detail: error }));
  }
};

export default FirebaseErrorDisplay;
