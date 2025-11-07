import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const AdminRoute = ({ children, requiredPermissions = [] }) => {
  const {
    canAccessRoute,
    hasRole,
    isAuthenticated,
    user,
    isLoading,
    isUserDataLoading,
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth or user data is loading
  if (isLoading || isUserDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner
          size="xl"
          message="Loading admin panel..."
          variant="white"
        />
      </div>
    );
  }

  // If not authenticated at all, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user is admin - only use loaded data, no fallbacks
  const isAdminUser = hasRole("admin");

  console.log("🔐 AdminRoute evaluation:", {
    isAuthenticated,
    isLoading,
    isUserDataLoading,
    userEmail: user?.email,
    userRole: user?.role,
    isAdminUser,
    currentPath: location.pathname,
  });

  // If authenticated but not admin, send to customer dashboard
  if (!isAdminUser) {
    console.log(
      "🚫 AdminRoute: Non-admin user, redirecting to customer dashboard"
    );
    return <Navigate to="/dashboard" replace />;
  }

  // Check specific route permissions if required (admins usually bypass)
  if (requiredPermissions.length > 0 && !canAccessRoute(requiredPermissions)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-7V9m0 0V7m0 2h2m-2 0H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-4">
            You don't have permission to access this admin section.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User has access, render the children
  return children;
};

export default AdminRoute;
