import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * AdminRedirectGuard - Ensures admin users are redirected away from customer areas
 * This component runs on every page load to catch any admin users who might
 * have navigated to customer-only areas
 */
const AdminRedirectGuard = ({ children }) => {
  const { hasRole, user, isAuthenticated, isLoading, isUserDataLoading } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth and user data to load before checking
    if (isLoading || isUserDataLoading) {
      return;
    }

    // Only proceed if user is authenticated and is admin - no fallbacks
    if (!isAuthenticated || !user || !hasRole("admin")) {
      return;
    }

    // At this point, user is authenticated and has admin role

    // List of paths that admin users should NOT be on
    const customerOnlyPaths = [
      "/dashboard",
      "/dashboard/accounts",
      "/dashboard/transactions",
      "/dashboard/analytics",
      "/dashboard/profile",
    ];

    const isOnCustomerPath = customerOnlyPaths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/")
    );

    if (isOnCustomerPath) {
      console.log(
        "🚨 ADMIN REDIRECT: Admin user detected on customer path:",
        location.pathname
      );
      console.log("🔄 Redirecting to admin panel...");
      navigate("/admin/account-holders", { replace: true });
    }
  }, [
    isAuthenticated,
    user,
    hasRole,
    location.pathname,
    navigate,
    isLoading,
    isUserDataLoading,
  ]);

  return children;
};

export default AdminRedirectGuard;
