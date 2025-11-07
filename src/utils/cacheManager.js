// Advanced caching system for banking application
export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.accessCounts = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxSize = 100; // Maximum number of cached items
    this.cleanupInterval = 60 * 1000; // 1 minute

    this.startCleanupTimer();
  }

  // Set item in cache with TTL
  set(key, value, ttl = this.defaultTTL) {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const now = Date.now();
    this.cache.set(key, value);
    this.timestamps.set(key, now + ttl);
    this.accessCounts.set(key, 1);

    return value;
  }

  // Get item from cache
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const now = Date.now();
    const expiry = this.timestamps.get(key);

    // Check if item has expired
    if (expiry && now > expiry) {
      this.delete(key);
      return null;
    }

    // Update access count
    const count = this.accessCounts.get(key) || 0;
    this.accessCounts.set(key, count + 1);

    return this.cache.get(key);
  }

  // Check if key exists and is not expired
  has(key) {
    return this.get(key) !== null;
  }

  // Delete item from cache
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    this.accessCounts.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.accessCounts.clear();
  }

  // Evict least recently used item
  evictLeastUsed() {
    let leastUsedKey = null;
    let leastCount = Infinity;

    for (const [key, count] of this.accessCounts.entries()) {
      if (count < leastCount) {
        leastCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.delete(leastUsedKey);
    }
  }

  // Clean up expired items
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, expiry] of this.timestamps.entries()) {
      if (expiry && now > expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.delete(key));

    return expiredKeys.length;
  }

  // Start automatic cleanup timer
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, expiry] of this.timestamps.entries()) {
      if (expiry && now > expiry) {
        expiredCount++;
      }
    }

    // Calculate approximate size
    for (const value of this.cache.values()) {
      totalSize += this.getObjectSize(value);
    }

    return {
      totalItems: this.cache.size,
      expiredItems: expiredCount,
      approximateSize: totalSize,
      hitRate: this.calculateHitRate(),
      mostAccessed: this.getMostAccessedItems(5),
    };
  }

  // Calculate approximate object size
  getObjectSize(obj) {
    try {
      return JSON.stringify(obj).length * 2; // Rough estimate
    } catch {
      return 100; // Default size for non-serializable objects
    }
  }

  // Calculate cache hit rate (simplified)
  calculateHitRate() {
    const totalAccesses = Array.from(this.accessCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const hits = this.cache.size;
    return hits > 0 ? (hits / totalAccesses) * 100 : 0;
  }

  // Get most accessed items
  getMostAccessedItems(limit = 5) {
    return Array.from(this.accessCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  }

  // Cached function wrapper
  cached(fn, keyGenerator, ttl = this.defaultTTL) {
    return async (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      // Try to get from cache first
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      try {
        const result = await fn(...args);
        this.set(key, result, ttl);
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };
  }

  // Smart cache for API responses
  cacheApiResponse(url, response, options = {}) {
    const {
      ttl = this.defaultTTL,
      keyPrefix = "api",
      includeTimestamp = true,
    } = options;

    const key = `${keyPrefix}:${url}`;
    const cacheData = {
      data: response,
      timestamp: includeTimestamp ? Date.now() : null,
      url,
    };

    this.set(key, cacheData, ttl);
    return cacheData;
  }

  // Get cached API response
  getCachedApiResponse(url, keyPrefix = "api") {
    const key = `${keyPrefix}:${url}`;
    return this.get(key);
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
    return keysToDelete.length;
  }

  // Preload data into cache
  async preload(items) {
    const promises = items.map(async (item) => {
      const { key, loader, ttl } = item;
      try {
        const data = await loader();
        this.set(key, data, ttl);
        return { key, success: true };
      } catch (error) {
        return { key, success: false, error };
      }
    });

    return Promise.all(promises);
  }

  // Export cache for persistence
  export() {
    const now = Date.now();
    const exportData = [];

    for (const [key, value] of this.cache.entries()) {
      const expiry = this.timestamps.get(key);
      const accessCount = this.accessCounts.get(key);

      // Only export non-expired items
      if (!expiry || now < expiry) {
        exportData.push({
          key,
          value,
          expiry,
          accessCount,
          remaining: expiry ? expiry - now : null,
        });
      }
    }

    return exportData;
  }

  // Import cache from exported data
  import(data) {
    const now = Date.now();
    let importedCount = 0;

    data.forEach((item) => {
      const { key, value, remaining, accessCount } = item;

      // Only import if not expired
      if (!remaining || remaining > 0) {
        const ttl = remaining || this.defaultTTL;
        this.cache.set(key, value);
        this.timestamps.set(key, now + ttl);
        this.accessCounts.set(key, accessCount || 1);
        importedCount++;
      }
    });

    return importedCount;
  }
}

// Specialized cache for user data
export class UserDataCache extends CacheManager {
  constructor() {
    super();
    this.defaultTTL = 10 * 60 * 1000; // 10 minutes for user data
  }

  // Cache user profile
  cacheUserProfile(userId, profile) {
    return this.set(`user:profile:${userId}`, profile);
  }

  // Get cached user profile
  getUserProfile(userId) {
    return this.get(`user:profile:${userId}`);
  }

  // Cache user transactions
  cacheUserTransactions(userId, transactions) {
    return this.set(`user:transactions:${userId}`, transactions);
  }

  // Get cached user transactions
  getUserTransactions(userId) {
    return this.get(`user:transactions:${userId}`);
  }

  // Invalidate all user data
  invalidateUserData(userId) {
    return this.invalidatePattern(`user:.*:${userId}`);
  }
}

// Global cache instances
export const globalCache = new CacheManager();
export const userDataCache = new UserDataCache();

// React hook for cache management
import { useState, useEffect, useCallback } from "react";

export function useCache(key, loader, options = {}) {
  const {
    ttl = globalCache.defaultTTL,
    cache = globalCache,
    dependencies = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    // Try cache first
    const cached = cache.get(key);
    if (cached !== null) {
      setData(cached);
      return cached;
    }

    // Load fresh data
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      cache.set(key, result, ttl);
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [key, loader, ttl, cache]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    return loadData();
  }, [cache, key, loadData]);

  return {
    data,
    loading,
    error,
    invalidate,
    refresh: loadData,
  };
}

// Cache decorator for methods
export function cached(ttl = globalCache.defaultTTL, keyGenerator) {
  return function (target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args) {
      const key = keyGenerator
        ? keyGenerator.call(this, ...args)
        : `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;

      return globalCache.cached(method.bind(this), () => key, ttl)(...args);
    };

    return descriptor;
  };
}

export default globalCache;
