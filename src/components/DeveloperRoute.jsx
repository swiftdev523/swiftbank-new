import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDeveloper } from "../context/DeveloperContext";
import { FaShieldAlt } from "react-icons/fa";

const DeveloperRoute = ({ children }) => {
  const { isDeveloperAuthenticated, developer } = useDeveloper();
  const location = useLocation();

  if (!isDeveloperAuthenticated || !developer) {
    // Redirect to developer login with return path
    return (
      <Navigate to="/developer/login" state={{ from: location }} replace />
    );
  }

  // Additional check for developer role
  if (developer.role !== "developer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have developer privileges to access this area.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default DeveloperRoute;
