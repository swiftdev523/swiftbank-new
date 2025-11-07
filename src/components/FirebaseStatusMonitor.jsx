import React, { useState, useEffect } from "react";
import { firebaseCircuitBreaker } from "../utils/firebaseCircuitBreaker";
import { emergencyMode } from "../utils/emergencyMode";
import { useAuth } from "../context/AuthContext";

/**
 * Firebase Status Monitor - Shows Firebase connectivity and quota status
 * Only visible to admin users
 */
const FirebaseStatusMonitor = () => {
  const { user } = useAuth();
  const [circuitStatus, setCircuitStatus] = useState(
    firebaseCircuitBreaker.getStatus()
  );
  const [emergencyStatus, setEmergencyStatus] = useState(
    emergencyMode.getStatus()
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update status every 10 seconds
    const interval = setInterval(() => {
      setCircuitStatus(firebaseCircuitBreaker.getStatus());
      setEmergencyStatus(emergencyMode.getStatus());
    }, 10000);

    // Listen for emergency mode changes
    const handleEmergencyActivated = () => {
      setEmergencyStatus(emergencyMode.getStatus());
    };

    const handleEmergencyDeactivated = () => {
      setEmergencyStatus(emergencyMode.getStatus());
    };

    window.addEventListener("emergencyModeActivated", handleEmergencyActivated);
    window.addEventListener(
      "emergencyModeDeactivated",
      handleEmergencyDeactivated
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "emergencyModeActivated",
        handleEmergencyActivated
      );
      window.removeEventListener(
        "emergencyModeDeactivated",
        handleEmergencyDeactivated
      );
    };
  }, []);

  const getStatusColor = () => {
    if (circuitStatus.isOpen || emergencyStatus.isActive) return "text-red-600";
    if (circuitStatus.failureCount > 0) return "text-amber-600";
    return "text-green-600";
  };

  const getStatusIcon = () => {
    if (circuitStatus.isOpen) {
      return (
        <svg
          className="w-4 h-4"
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
      );
    }

    if (emergencyStatus.isActive) {
      return (
        <svg
          className="w-4 h-4"
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
      );
    }

    if (circuitStatus.failureCount > 0) {
      return (
        <svg
          className="w-4 h-4"
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
      );
    }

    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  const getStatusText = () => {
    if (circuitStatus.isOpen) {
      const timeRemaining = Math.ceil(circuitStatus.timeUntilReset / 1000);
      return `Firebase Offline (${timeRemaining}s)`;
    }

    if (emergencyStatus.isActive) {
      return "Emergency Mode";
    }

    if (circuitStatus.failureCount > 0) {
      return `Firebase Warning (${circuitStatus.failureCount} failures)`;
    }

    return "Firebase Online";
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to force reset the Firebase connection? This should only be done when you are certain Firebase is working properly."
      )
    ) {
      firebaseCircuitBreaker.forceReset();
      setCircuitStatus(firebaseCircuitBreaker.getStatus());
    }
  };

  const handleToggleEmergency = () => {
    emergencyMode.toggle("Manual toggle from status monitor");
    setEmergencyStatus(emergencyMode.getStatus());
  };

  // Only show for admin users (and when there are issues or in development)
  const isAdmin = user?.role === "admin";
  const hasIssues =
    circuitStatus.isOpen ||
    emergencyStatus.isActive ||
    circuitStatus.failureCount > 0;
  const shouldShow =
    isAdmin &&
    (process.env.NODE_ENV === "development" || hasIssues || true); // Always show for admins, even when everything is working

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
        bg-white rounded-lg shadow-lg border-l-4 transition-all duration-300
        ${
          circuitStatus.isOpen || emergencyStatus.isActive
            ? "border-red-500"
            : circuitStatus.failureCount > 0
              ? "border-amber-500"
              : "border-green-500"
        }
        ${isExpanded ? "w-80" : "w-48"}
      `}>
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2">
            <div className={getStatusColor()}>{getStatusIcon()}</div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-3 space-y-3">
            {/* Circuit Breaker Status */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">
                Circuit Breaker
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  State:{" "}
                  <span className="font-mono">{circuitStatus.state}</span>
                </div>
                <div>
                  Failures:{" "}
                  <span className="font-mono">
                    {circuitStatus.failureCount}
                  </span>
                </div>
                {circuitStatus.isOpen && (
                  <div>
                    Reset in:{" "}
                    <span className="font-mono">
                      {Math.ceil(circuitStatus.timeUntilReset / 1000)}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Mode Status */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">
                Emergency Mode
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  Status:{" "}
                  <span className="font-mono">
                    {emergencyStatus.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                {emergencyStatus.isActive && (
                  <>
                    <div>
                      Reason:{" "}
                      <span className="text-xs">{emergencyStatus.reason}</span>
                    </div>
                    <div>
                      Duration:{" "}
                      <span className="font-mono">
                        {Math.ceil(emergencyStatus.duration / 1000)}s
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {circuitStatus.isOpen && (
                <button
                  onClick={handleReset}
                  className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                  Force Reset
                </button>
              )}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={handleToggleEmergency}
                  className="flex-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors">
                  Toggle Emergency
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              {circuitStatus.isOpen
                ? "Firebase requests are blocked due to quota exhaustion. Service will resume automatically."
                : emergencyStatus.isActive
                  ? "Using cached data due to Firebase issues. Live data will resume when connectivity is restored."
                  : circuitStatus.failureCount > 0
                    ? "Firebase is experiencing some issues but is still functional."
                    : "Firebase is operating normally."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseStatusMonitor;
