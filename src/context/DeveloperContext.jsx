import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import developerService from "../services/developerService";
import { firebaseErrorHandler } from "../utils/firebaseErrorHandler";
import { AppError, ErrorTypes } from "../utils/errorUtils";

const DeveloperContext = createContext();

export const useDeveloper = () => {
  const context = useContext(DeveloperContext);
  if (!context) {
    throw new Error("useDeveloper must be used within a DeveloperProvider");
  }
  return context;
};

export const DeveloperProvider = ({ children }) => {
  const [developer, setDeveloper] = useState(null);
  const [isDeveloperAuthenticated, setIsDeveloperAuthenticated] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [stats, setStats] = useState(null);

  // Security constants (disabled for debugging)
  const MAX_LOGIN_ATTEMPTS = Number.POSITIVE_INFINITY; // disable lockout
  const LOCKOUT_DURATION = 0; // disable lockout timer

  // Check for account lockout on component mount
  useEffect(() => {
    // Disable persisted lockout while debugging
    localStorage.removeItem("developerLockout");
    setIsLocked(false);
    setIsLoading(false);
  }, []);

  // Debug: Log developer state changes
  useEffect(() => {
    console.log("🔍 Developer state changed:", {
      developer,
      uid: developer?.uid,
      email: developer?.email,
      isDeveloperAuthenticated,
      timestamp: new Date().toISOString(),
    });
  }, [developer, isDeveloperAuthenticated]);

  // State consistency check - if authenticated but no developer object, reset state
  useEffect(() => {
    if (isDeveloperAuthenticated && (!developer || !developer.uid)) {
      console.warn(
        "⚠️ State inconsistency detected: authenticated but no developer object"
      );
      console.log("🔄 Resetting authentication state for consistency...");
      setIsDeveloperAuthenticated(false);
      setAdminList([]);
      setCustomerList([]);
      setAssignmentList([]);
      setStats(null);
    }
  }, [isDeveloperAuthenticated, developer]);

  // Developer login
  const loginDeveloper = useCallback(
    async (email, password) => {
      try {
        // Lockout disabled for debugging

        setIsLoading(true);
        const developerData = await developerService.authenticateDeveloper(
          email,
          password
        );

        setDeveloper(developerData);
        setIsDeveloperAuthenticated(true);
        setLoginAttempts(0);
        localStorage.removeItem("developerLockout");

        // Load initial data
        await Promise.all([
          loadAdmins(developerData.uid),
          loadCustomers(developerData.uid),
          loadStats(developerData.uid),
        ]);

        return developerData;
      } catch (error) {
        console.error("Developer login error:", error);

        // Do not increment/persist attempts while debugging

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isLocked, loginAttempts]
  );

  // Developer logout
  const logoutDeveloper = useCallback(async () => {
    try {
      setIsLoading(true);
      setDeveloper(null);
      setIsDeveloperAuthenticated(false);
      setAdminList([]);
      setCustomerList([]);
      setStats(null);

      // Clear any stored sessions
      localStorage.removeItem("developerSession");
    } catch (error) {
      console.error("Developer logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load admins created by developer
  const loadAdmins = useCallback(
    async (developerId = developer?.uid) => {
      if (!developerId) return;

      try {
        const admins = await developerService.getAdminsByDeveloper(developerId);
        setAdminList(admins);
        return admins;
      } catch (error) {
        console.error("Error loading admins:", error);
        throw error;
      }
    },
    [developer?.uid]
  );

  // Load customers created by developer
  const loadCustomers = useCallback(
    async (developerId = developer?.uid) => {
      if (!developerId) return;

      try {
        const customers =
          await developerService.getCustomersByDeveloper(developerId);
        setCustomerList(customers);
        return customers;
      } catch (error) {
        console.error("Error loading customers:", error);
        throw error;
      }
    },
    [developer?.uid]
  );

  // Load assignments created by developer
  const loadAssignments = useCallback(
    async (developerId = developer?.uid) => {
      if (!developerId) return;

      try {
        const assignments =
          await developerService.getAdminAssignments(developerId);
        setAssignmentList(assignments);
        return assignments;
      } catch (error) {
        console.error("Error loading assignments:", error);
        throw error;
      }
    },
    [developer?.uid]
  );

  // Load developer statistics
  const loadStats = useCallback(
    async (developerId = developer?.uid) => {
      if (!developerId) return;

      try {
        const statistics =
          await developerService.getDeveloperStats(developerId);
        setStats(statistics);
        return statistics;
      } catch (error) {
        console.error("Error loading stats:", error);
        throw error;
      }
    },
    [developer?.uid]
  );

  // Create new admin with customer
  const createAdminWithCustomer = useCallback(
    async (adminData, customerData) => {
      if (!developer?.uid) {
        throw new AppError(
          "Developer not authenticated",
          ErrorTypes.AUTH_ERROR
        );
      }

      try {
        setIsLoading(true);
        const result = await developerService.createAdminWithCustomer(
          adminData,
          customerData,
          developer.uid
        );

        // Refresh lists and stats
        await Promise.all([
          loadAdmins(),
          loadCustomers(),
          loadAssignments(),
          loadStats(),
        ]);

        return result;
      } catch (error) {
        console.error("Error creating admin with customer:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [developer?.uid, loadAdmins, loadCustomers, loadAssignments, loadStats]
  );

  // Deactivate admin-customer pair
  const deactivateAdminCustomerPair = useCallback(
    async (adminId, customerId) => {
      if (!developer?.uid) {
        throw new AppError(
          "Developer not authenticated",
          ErrorTypes.AUTH_ERROR
        );
      }

      try {
        setIsLoading(true);
        await developerService.deactivateAdminCustomerPair(
          adminId,
          customerId,
          developer.uid
        );

        // Refresh lists and stats
        await Promise.all([
          loadAdmins(),
          loadCustomers(),
          loadAssignments(),
          loadStats(),
        ]);

        return true;
      } catch (error) {
        console.error("Error deactivating admin-customer pair:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [developer?.uid, loadAdmins, loadCustomers, loadAssignments, loadStats]
  );

  // Toggle user active status - SIMPLIFIED VERSION
  const toggleUserActiveStatus = useCallback(
    async (userId, currentStatus) => {
      console.log("🎯 DeveloperContext.toggleUserActiveStatus called", {
        userId,
        currentStatus,
        hasDeveloper: !!developer,
        developerUid: developer?.uid,
        isDeveloperAuthenticated,
      });

      // Simple validation
      if (!developer || !developer.uid) {
        alert("Please login again as developer");
        setIsDeveloperAuthenticated(false);
        return;
      }

      try {
        setIsLoading(true);

        const result = await developerService.toggleUserActiveStatus(
          userId,
          currentStatus,
          developer.uid
        );

        console.log("✅ Toggle successful, refreshing data...");

        // Refresh data
        await Promise.all([
          loadAdmins(developer.uid),
          loadCustomers(developer.uid),
          loadAssignments(developer.uid),
          loadStats(developer.uid),
        ]);

        console.log("✅ Data refreshed");
        return result;
      } catch (error) {
        console.error("❌ Toggle error:", error);
        alert(`Failed to toggle status: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      developer,
      isDeveloperAuthenticated,
      loadAdmins,
      loadCustomers,
      loadAssignments,
      loadStats,
    ]
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!developer?.uid) {
      console.log("❌ No developer UID found, cannot refresh data");
      return;
    }

    console.log("🔄 Refreshing developer data for UID:", developer.uid);

    try {
      setIsLoading(true);
      await Promise.all([
        loadAdmins(),
        loadCustomers(),
        loadAssignments(),
        loadStats(),
      ]);
      console.log("✅ Data refresh completed successfully");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [developer?.uid, loadAdmins, loadCustomers, loadAssignments, loadStats]);

  // Update developer activity
  const updateActivity = useCallback(async () => {
    if (developer?.uid) {
      try {
        await developerService.updateDeveloperActivity(developer.uid);
      } catch (error) {
        console.error("Error updating developer activity:", error);
      }
    }
  }, [developer?.uid]);

  // Activity tracker effect
  useEffect(() => {
    if (isDeveloperAuthenticated && developer?.uid) {
      const activityInterval = setInterval(updateActivity, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(activityInterval);
    }
  }, [isDeveloperAuthenticated, developer?.uid, updateActivity]);

  // Check if developer has specific permissions
  const hasPermission = useCallback(
    (permission) => {
      if (!developer) return false;

      // Developer has all permissions by default
      const permissions = developer.permissions || [];
      return permissions.includes(permission) || developer.role === "developer";
    },
    [developer]
  );

  // Make functions available for debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.developerDebug = {
        refreshData,
        developer,
        adminList,
        customerList,
        assignmentList,
        stats,
        loadAdmins: () => loadAdmins(developer?.uid),
        loadCustomers: () => loadCustomers(developer?.uid),
        currentDeveloperUID: developer?.uid,
      };
    }
  }, [
    refreshData,
    developer,
    adminList,
    customerList,
    assignmentList,
    stats,
    loadAdmins,
    loadCustomers,
  ]);

  const value = {
    // State
    developer,
    isDeveloperAuthenticated,
    isLoading,
    loginAttempts,
    isLocked,
    adminList,
    customerList,
    assignmentList,
    stats,

    // Actions
    loginDeveloper,
    logoutDeveloper,
    createAdminWithCustomer,
    deactivateAdminCustomerPair,
    toggleUserActiveStatus,
    refreshData,
    loadAdmins,
    loadCustomers,
    loadAssignments,
    loadStats,
    updateActivity,
    hasPermission,

    // Computed values
    remainingAttempts: Infinity,
    lockoutTimeRemaining: 0,
  };

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  );
};
