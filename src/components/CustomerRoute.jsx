import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const CustomerRoute = ({ children }) => {
  const { hasRole, isAuthenticated, user, isLoading, isUserDataLoading } =
    useAuth();
  const location = useLocation();

  // Show loading spinner while auth or user data is loading
  if (isLoading || isUserDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/95 flex items-center justify-center">
        <LoadingSpinner size="xl" message="Loading dashboard..." />
      </div>
    );
  }

  // If not authenticated at all, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin - only use loaded data, no fallbacks
  const isAdminUser = hasRole("admin");

  console.log("🛡️ CustomerRoute evaluation:", {
    isAuthenticated,
    isLoading,
    isUserDataLoading,
    userEmail: user?.email,
    userRole: user?.role,
    isAdminUser,
    currentPath: location.pathname,
  });

  // If authenticated but is admin, redirect to admin landing
  if (isAdminUser) {
    console.log("🔄 CustomerRoute: Redirecting admin user to admin dashboard");
    return <Navigate to="/admin/account-holders" replace />;
  }

  // Customer has access, render the children
  return children;
};

export default CustomerRoute;
