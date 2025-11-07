import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AuthDebugger = () => {
  const { user, isAuthenticated, isLoading, getSessionInfo } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const sessionInfo = getSessionInfo();
      const savedUser = localStorage.getItem("bankUser");
      const sessionData = localStorage.getItem("sessionData");
      const dataVersion = localStorage.getItem("bankDataVersion");

      setDebugInfo({
        user: user ? { username: user.username, role: user.role } : null,
        isAuthenticated,
        isLoading,
        sessionInfo,
        localStorage: {
          hasSavedUser: !!savedUser,
          hasSessionData: !!sessionData,
          dataVersion,
        },
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading, getSessionInfo]);

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 10000,
        maxWidth: "300px",
      }}>
      <h4>Auth Debug Info</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default AuthDebugger;
