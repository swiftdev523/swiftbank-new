import React, { createContext, useContext, useCallback } from "react";

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};

export const PermissionsProvider = ({ children, user }) => {
  // Permission checking functions
  const hasPermission = useCallback(
    (permission) => {
      if (!user || !user.permissions) return false;

      // Admin role has full access
      if (user.permissions.includes("*")) return true;

      // Check specific permission
      return user.permissions.includes(permission);
    },
    [user]
  );

  // Role checking functions
  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  const isManager = useCallback(() => {
    return user?.role === "manager";
  }, [user]);

  const isSupport = useCallback(() => {
    return user?.role === "support";
  }, [user]);

  const isCustomer = useCallback(() => {
    return user?.role === "customer" || (!user?.role && user); // Default to customer if no role specified
  }, [user]);

  // Combined admin access check
  const hasAdminAccess = useCallback(() => {
    return ["admin", "manager", "support"].includes(user?.role);
  }, [user]);

  // Specific admin panel access
  const canAccessAdminPanel = useCallback(() => {
    return hasPermission("admin_panel") || hasAdminAccess();
  }, [hasPermission, hasAdminAccess]);

  // Route-based access control
  const canAccessRoute = useCallback(
    (routePermissions = []) => {
      if (!routePermissions.length) return true;

      return routePermissions.some((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  // Feature-based access control
  const canAccessFeature = useCallback(
    (feature) => {
      const featurePermissions = {
        // Admin features
        user_management: ["user_view", "user_edit", "user_create"],
        transaction_management: [
          "transaction_view",
          "transaction_approve",
          "transaction_reject",
        ],
        content_management: [
          "content_edit",
          "content_create",
          "content_delete",
        ],
        system_settings: ["settings_view", "settings_edit"],
        security_center: ["security_view", "security_edit"],

        // Customer features
        account_view: ["account_view"],
        transaction_create: ["transaction_create"],
        profile_edit: ["profile_edit"],

        // Shared features
        notifications: ["notifications_view"],
      };

      const requiredPermissions = featurePermissions[feature];
      if (!requiredPermissions) return false;

      return requiredPermissions.some((permission) =>
        hasPermission(permission)
      );
    },
    [hasPermission]
  );

  // Data access control
  const canAccessUserData = useCallback(
    (targetUserId) => {
      // Admins can access all user data
      if (hasAdminAccess()) return true;

      // Users can only access their own data
      return user?.id === targetUserId;
    },
    [user, hasAdminAccess]
  );

  // Transaction access control
  const canAccessTransaction = useCallback(
    (transaction) => {
      // Admins can access all transactions
      if (hasAdminAccess()) return true;

      // Users can only access their own transactions
      return transaction.userId === user?.id;
    },
    [user, hasAdminAccess]
  );

  // Account access control
  const canAccessAccount = useCallback(
    (accountUserId) => {
      // Admins can access all accounts
      if (hasAdminAccess()) return true;

      // Users can only access their own accounts
      return user?.id === accountUserId;
    },
    [user, hasAdminAccess]
  );

  // Operation-based access control
  const canPerformOperation = useCallback(
    (operation, context = {}) => {
      const operationPermissions = {
        // User operations
        create_user: ["user_create"],
        edit_user: ["user_edit"],
        delete_user: ["user_delete"],
        view_user: ["user_view"],

        // Transaction operations
        create_transaction: ["transaction_create"],
        approve_transaction: ["transaction_approve"],
        reject_transaction: ["transaction_reject"],
        view_transaction: ["transaction_view"],

        // Content operations
        edit_content: ["content_edit"],
        create_content: ["content_create"],
        delete_content: ["content_delete"],

        // System operations
        edit_settings: ["settings_edit"],
        view_settings: ["settings_view"],
        security_audit: ["security_view"],

        // Profile operations
        edit_profile: ["profile_edit"],
        view_profile: ["profile_view"],
      };

      const requiredPermissions = operationPermissions[operation];
      if (!requiredPermissions) return false;

      // Check basic permission
      const hasBasicPermission = requiredPermissions.some((permission) =>
        hasPermission(permission)
      );

      if (!hasBasicPermission) return false;

      // Additional context-based checks
      if (context.targetUserId && !canAccessUserData(context.targetUserId)) {
        return false;
      }

      if (context.transaction && !canAccessTransaction(context.transaction)) {
        return false;
      }

      return true;
    },
    [hasPermission, canAccessUserData, canAccessTransaction]
  );

  // Get user's effective permissions (resolved from role)
  const getEffectivePermissions = useCallback(() => {
    if (!user) return [];

    // If user has wildcard permission, return all possible permissions
    if (user.permissions?.includes("*")) {
      return [
        "user_view",
        "user_edit",
        "user_create",
        "user_delete",
        "transaction_view",
        "transaction_create",
        "transaction_approve",
        "transaction_reject",
        "content_view",
        "content_edit",
        "content_create",
        "content_delete",
        "settings_view",
        "settings_edit",
        "security_view",
        "security_edit",
        "profile_view",
        "profile_edit",
        "admin_panel",
        "notifications_view",
      ];
    }

    return user.permissions || [];
  }, [user]);

  // Get user's role hierarchy level (for UI sorting/display)
  const getRoleLevel = useCallback(() => {
    const roleLevels = {
      admin: 100,
      manager: 75,
      support: 50,
      customer: 25,
    };

    return roleLevels[user?.role] || 0;
  }, [user]);

  // Check if user can impersonate another user (admin feature)
  const canImpersonate = useCallback(
    (targetUser) => {
      if (!isAdmin()) return false;

      // Admins can't impersonate other admins
      if (targetUser.role === "admin") return false;

      return true;
    },
    [isAdmin]
  );

  const value = {
    // Role checks
    isAdmin,
    isManager,
    isSupport,
    isCustomer,
    hasAdminAccess,

    // Permission checks
    hasPermission,
    canAccessAdminPanel,
    canAccessRoute,
    canAccessFeature,

    // Data access control
    canAccessUserData,
    canAccessTransaction,
    canAccessAccount,

    // Operation control
    canPerformOperation,

    // Utility functions
    getEffectivePermissions,
    getRoleLevel,
    canImpersonate,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
