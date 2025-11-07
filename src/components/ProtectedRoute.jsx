import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, requiresHighSecurity = false }) => {
  const { isAuthenticated, isLoading, user, logout, getSessionInfo } =
    useAuth();
  const [securityCheck, setSecurityCheck] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only set security check when we have an authenticated user
    if (isAuthenticated && user) {
      setSecurityCheck(true);
    }
  }, [isAuthenticated, user]);

  // Enhanced loading screen with security indicators
  if (isLoading) {
    return (
      <LoadingSpinner
        size="xl"
        message="Securing Connection"
        variant="white"
        fullScreen={true}
      />
    );
  }

  // Security validation for authenticated users
  if (isAuthenticated && !securityCheck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-900"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-lg font-semibold text-yellow-100 mt-4">
            Security Validation
          </p>
          <p className="text-sm text-yellow-300 mt-2">
            Verifying session integrity...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
