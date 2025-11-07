import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRedirect = () => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasRole("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/admin/account-holders" replace />;
};

export default AdminRedirect;
