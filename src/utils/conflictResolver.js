// Conflict resolution utility for real-time updates
export class ConflictResolver {
  constructor() {
    this.conflictHandlers = new Map();
    this.pendingUpdates = new Map();
    this.lastKnownVersions = new Map();
  }

  // Register a conflict handler for a specific data type
  registerConflictHandler(dataType, handler) {
    this.conflictHandlers.set(dataType, handler);
  }

  // Track the last known version of a document
  trackVersion(docId, version, data) {
    this.lastKnownVersions.set(docId, {
      version,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      timestamp: Date.now(),
    });
  }

  // Detect conflicts when receiving updates
  async handleUpdate(docId, newData, newVersion, dataType) {
    const lastKnown = this.lastKnownVersions.get(docId);
    const pending = this.pendingUpdates.get(docId);

    // No conflict if no local changes or no previous version
    if (!lastKnown || !pending) {
      this.trackVersion(docId, newVersion, newData);
      return { conflict: false, resolvedData: newData };
    }

    // Check if there's a version conflict
    if (lastKnown.version !== newVersion - 1) {
      return this.resolveConflict(
        docId,
        lastKnown.data,
        newData,
        pending.data,
        dataType
      );
    }

    // No conflict, update successful
    this.trackVersion(docId, newVersion, newData);
    this.pendingUpdates.delete(docId);
    return { conflict: false, resolvedData: newData };
  }

  // Add pending update
  addPendingUpdate(docId, localData) {
    this.pendingUpdates.set(docId, {
      data: JSON.parse(JSON.stringify(localData)),
      timestamp: Date.now(),
    });
  }

  // Resolve conflicts using registered handlers or default strategies
  async resolveConflict(docId, baseData, serverData, localData, dataType) {
    const handler = this.conflictHandlers.get(dataType);

    if (handler) {
      try {
        const resolved = await handler(baseData, serverData, localData);
        this.trackVersion(docId, resolved.version || Date.now(), resolved.data);
        this.pendingUpdates.delete(docId);
        return {
          conflict: true,
          resolvedData: resolved.data,
          strategy: "custom",
        };
      } catch (error) {
        console.error("Custom conflict handler failed:", error);
      }
    }

    // Default conflict resolution strategies
    return this.defaultConflictResolution(
      docId,
      baseData,
      serverData,
      localData,
      dataType
    );
  }

  // Default conflict resolution strategies
  defaultConflictResolution(docId, baseData, serverData, localData, dataType) {
    switch (dataType) {
      case "account":
        return this.resolveAccountConflict(
          docId,
          baseData,
          serverData,
          localData
        );

      case "transaction":
        return this.resolveTransactionConflict(
          docId,
          baseData,
          serverData,
          localData
        );

      case "profile":
        return this.resolveProfileConflict(
          docId,
          baseData,
          serverData,
          localData
        );

      default:
        return this.resolveGenericConflict(
          docId,
          baseData,
          serverData,
          localData
        );
    }
  }

  // Account-specific conflict resolution
  resolveAccountConflict(docId, baseData, serverData, localData) {
    const resolved = { ...serverData };

    // For financial data, prefer server values for balance
    // but merge other fields intelligently
    if (localData.nickname && localData.nickname !== baseData.nickname) {
      resolved.nickname = localData.nickname;
    }

    if (
      localData.preferences &&
      JSON.stringify(localData.preferences) !==
        JSON.stringify(baseData.preferences)
    ) {
      resolved.preferences = {
        ...serverData.preferences,
        ...localData.preferences,
      };
    }

    this.trackVersion(docId, Date.now(), resolved);
    this.pendingUpdates.delete(docId);

    return {
      conflict: true,
      resolvedData: resolved,
      strategy: "account_merge",
    };
  }

  // Transaction-specific conflict resolution
  resolveTransactionConflict(docId, baseData, serverData, localData) {
    // For transactions, prefer server data as it's usually more authoritative
    // But preserve local metadata if different
    const resolved = { ...serverData };

    if (localData.category && localData.category !== baseData.category) {
      resolved.localCategory = localData.category; // Store as local override
    }

    if (localData.notes && localData.notes !== baseData.notes) {
      resolved.notes = localData.notes; // Notes can be merged
    }

    this.trackVersion(docId, Date.now(), resolved);
    this.pendingUpdates.delete(docId);

    return {
      conflict: true,
      resolvedData: resolved,
      strategy: "transaction_server_priority",
    };
  }

  // Profile-specific conflict resolution
  resolveProfileConflict(docId, baseData, serverData, localData) {
    const resolved = { ...serverData };

    // Merge profile fields intelligently
    const mergeableFields = ["displayName", "phone", "preferences", "settings"];

    mergeableFields.forEach((field) => {
      if (
        localData[field] &&
        JSON.stringify(localData[field]) !== JSON.stringify(baseData[field])
      ) {
        if (typeof localData[field] === "object") {
          resolved[field] = { ...serverData[field], ...localData[field] };
        } else {
          resolved[field] = localData[field];
        }
      }
    });

    // Always prefer server values for critical fields
    const serverOnlyFields = ["email", "verified", "role", "status"];
    serverOnlyFields.forEach((field) => {
      if (serverData[field] !== undefined) {
        resolved[field] = serverData[field];
      }
    });

    this.trackVersion(docId, Date.now(), resolved);
    this.pendingUpdates.delete(docId);

    return {
      conflict: true,
      resolvedData: resolved,
      strategy: "profile_intelligent_merge",
    };
  }

  // Generic conflict resolution - last write wins with timestamp check
  resolveGenericConflict(docId, baseData, serverData, localData) {
    const serverTimestamp = serverData.updatedAt || serverData.timestamp || 0;
    const localTimestamp = localData.updatedAt || localData.timestamp || 0;

    const resolved = serverTimestamp > localTimestamp ? serverData : localData;

    this.trackVersion(docId, Date.now(), resolved);
    this.pendingUpdates.delete(docId);

    return {
      conflict: true,
      resolvedData: resolved,
      strategy: serverTimestamp > localTimestamp ? "server_wins" : "local_wins",
    };
  }

  // Manual conflict resolution for complex cases
  requestManualResolution(docId, baseData, serverData, localData, dataType) {
    return {
      conflict: true,
      requiresManualResolution: true,
      conflictData: {
        docId,
        dataType,
        base: baseData,
        server: serverData,
        local: localData,
        timestamp: Date.now(),
      },
    };
  }

  // Clean up old versions and pending updates
  cleanup(maxAge = 24 * 60 * 60 * 1000) {
    // 24 hours
    const now = Date.now();

    // Clean up old version tracking
    for (const [docId, versionData] of this.lastKnownVersions.entries()) {
      if (now - versionData.timestamp > maxAge) {
        this.lastKnownVersions.delete(docId);
      }
    }

    // Clean up old pending updates
    for (const [docId, pendingData] of this.pendingUpdates.entries()) {
      if (now - pendingData.timestamp > maxAge) {
        this.pendingUpdates.delete(docId);
      }
    }
  }

  // Get conflict statistics
  getConflictStats() {
    return {
      trackedVersions: this.lastKnownVersions.size,
      pendingUpdates: this.pendingUpdates.size,
      registeredHandlers: this.conflictHandlers.size,
    };
  }
}

// Global conflict resolver instance
export const conflictResolver = new ConflictResolver();

// Register default conflict handlers
conflictResolver.registerConflictHandler(
  "account",
  async (base, server, local) => {
    // Custom account conflict resolution
    const resolved = { ...server };

    // Preserve local nickname changes
    if (local.nickname !== base.nickname) {
      resolved.nickname = local.nickname;
    }

    // Merge preferences
    if (local.preferences) {
      resolved.preferences = { ...server.preferences, ...local.preferences };
    }

    return { data: resolved, version: Date.now() };
  }
);

// React hook for conflict resolution
import { useState, useEffect } from "react";

export function useConflictResolution(docId, dataType) {
  const [conflictData, setConflictData] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleConflict = async (baseData, serverData, localData) => {
    setIsResolving(true);

    try {
      const result = await conflictResolver.resolveConflict(
        docId,
        baseData,
        serverData,
        localData,
        dataType
      );

      if (result.requiresManualResolution) {
        setConflictData(result.conflictData);
      }

      setIsResolving(false);
      return result;
    } catch (error) {
      setIsResolving(false);
      throw error;
    }
  };

  const resolveManually = (resolution) => {
    conflictResolver.trackVersion(docId, Date.now(), resolution);
    setConflictData(null);
  };

  return {
    conflictData,
    isResolving,
    handleConflict,
    resolveManually,
    addPendingUpdate: (data) => conflictResolver.addPendingUpdate(docId, data),
    trackVersion: (version, data) =>
      conflictResolver.trackVersion(docId, version, data),
  };
}

export default conflictResolver;
