// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
    this.observers = [];
    this.thresholds = {
      render: 16, // 60fps
      api: 1000,
      navigation: 3000,
      resource: 5000,
    };
    this.setupObservers();
  }

  // Start timing operation
  startTiming(name, category = "general") {
    const startTime = performance.now();
    this.measurements.set(name, {
      startTime,
      category,
      name,
    });
    return startTime;
  }

  // End timing operation
  endTiming(name, context = {}) {
    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`No timing started for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    const result = {
      name: measurement.name,
      category: measurement.category,
      duration: Math.round(duration * 100) / 100,
      startTime: measurement.startTime,
      endTime,
      context,
      timestamp: Date.now(),
    };

    // Check if duration exceeds threshold
    const threshold =
      this.thresholds[measurement.category] || this.thresholds.general;
    if (duration > threshold) {
      result.isSlowOperation = true;
      this.notifySlowOperation(result);
    }

    this.measurements.delete(name);
    this.notifyObservers("timing", result);

    return result;
  }

  // Measure async operation
  async measureAsync(name, asyncFunction, category = "general", context = {}) {
    this.startTiming(name, category);
    try {
      const result = await asyncFunction();
      const timing = this.endTiming(name, context);
      return { result, timing };
    } catch (error) {
      this.endTiming(name, { ...context, error: error.message });
      throw error;
    }
  }

  // Measure sync operation
  measureSync(name, syncFunction, category = "general", context = {}) {
    this.startTiming(name, category);
    try {
      const result = syncFunction();
      const timing = this.endTiming(name, context);
      return { result, timing };
    } catch (error) {
      this.endTiming(name, { ...context, error: error.message });
      throw error;
    }
  }

  // Setup performance observers
  setupObservers() {
    if ("PerformanceObserver" in window) {
      // Observe navigation timing
      this.createObserver(["navigation"], (list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.notifyObservers("navigation", {
            name: "page_load",
            category: "navigation",
            duration: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart,
            domContentLoaded:
              entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            timestamp: Date.now(),
            details: entry,
          });
        });
      });

      // Observe resource timing
      this.createObserver(["resource"], (list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > this.thresholds.resource) {
            this.notifyObservers("resource", {
              name: entry.name,
              category: "resource",
              duration: entry.duration,
              size: entry.transferSize,
              type: entry.initiatorType,
              timestamp: Date.now(),
              isSlowOperation: true,
            });
          }
        });
      });

      // Observe long tasks
      this.createObserver(["longtask"], (list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.notifyObservers("longtask", {
            name: "long_task",
            category: "render",
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
            isSlowOperation: true,
          });
        });
      });

      // Observe layout shifts
      this.createObserver(["layout-shift"], (list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.value > 0.1) {
            // Significant layout shift
            this.notifyObservers("layout-shift", {
              name: "layout_shift",
              category: "render",
              value: entry.value,
              timestamp: Date.now(),
              hadRecentInput: entry.hadRecentInput,
            });
          }
        });
      });
    }
  }

  // Create performance observer
  createObserver(entryTypes, callback) {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ entryTypes });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to create observer for ${entryTypes}:`, error);
    }
  }

  // Add observer
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Remove observer
  removeObserver(callback) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  // Notify observers
  notifyObservers(type, data) {
    this.observers.forEach((observer) => {
      if (typeof observer === "function") {
        try {
          observer(type, data);
        } catch (error) {
          console.error("Performance observer error:", error);
        }
      }
    });
  }

  // Notify slow operation
  notifySlowOperation(measurement) {
    console.warn(
      `Slow operation detected: ${measurement.name} took ${measurement.duration}ms`
    );
  }

  // Get performance metrics
  getMetrics() {
    const navigation = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");
    const resources = performance.getEntriesByType("resource");

    return {
      navigation: navigation
        ? {
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
            firstByte: navigation.responseStart - navigation.requestStart,
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
          }
        : null,
      paint: paint.reduce((acc, entry) => {
        acc[entry.name.replace("-", "")] = entry.startTime;
        return acc;
      }, {}),
      resources: {
        total: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowResources: resources.filter(
          (r) => r.duration > this.thresholds.resource
        ).length,
      },
      memory: this.getMemoryInfo(),
    };
  }

  // Get memory information
  getMemoryInfo() {
    if ("memory" in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  }

  // Clear measurements
  clearMeasurements() {
    this.measurements.clear();
    if ("performance" in window && "clearMeasures" in performance) {
      performance.clearMeasures();
      performance.clearMarks();
    }
  }

  // Set thresholds
  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

// React performance optimization utilities
export class ReactOptimizer {
  constructor() {
    this.renderCounts = new Map();
    this.componentTimings = new Map();
  }

  // Memoization helper
  static memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
    const cache = new Map();

    return function memoized(...args) {
      const key = keyGenerator(...args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn.apply(this, args);
      cache.set(key, result);

      // Limit cache size
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      return result;
    };
  }

  // Track component renders
  trackRender(componentName) {
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);

    if (count > 10) {
      console.warn(`Component ${componentName} has rendered ${count} times`);
    }
  }

  // Get render statistics
  getRenderStats() {
    const stats = {};
    this.renderCounts.forEach((count, component) => {
      stats[component] = count;
    });
    return stats;
  }

  // Clear render counts
  clearRenderStats() {
    this.renderCounts.clear();
  }
}

// Lazy loading utilities
export class LazyLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
  }

  // Lazy load component
  async loadComponent(importFunction, fallback = null) {
    const key = importFunction.toString();

    if (this.loadedModules.has(key)) {
      return this.loadedModules.get(key);
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const loadPromise = importFunction()
      .then((module) => {
        const component = module.default || module;
        this.loadedModules.set(key, component);
        this.loadingPromises.delete(key);
        return component;
      })
      .catch((error) => {
        this.loadingPromises.delete(key);
        console.error("Failed to load component:", error);
        return fallback;
      });

    this.loadingPromises.set(key, loadPromise);
    return loadPromise;
  }

  // Preload component
  preloadComponent(importFunction) {
    const key = importFunction.toString();
    if (!this.loadedModules.has(key) && !this.loadingPromises.has(key)) {
      this.loadComponent(importFunction);
    }
  }

  // Check if component is loaded
  isLoaded(importFunction) {
    const key = importFunction.toString();
    return this.loadedModules.has(key);
  }
}

// Bundle analyzer
export class BundleAnalyzer {
  static analyzeChunks() {
    if ("performance" in window) {
      const resources = performance.getEntriesByType("resource");
      const jsChunks = resources.filter(
        (r) =>
          r.name.includes(".js") &&
          (r.name.includes("chunk") || r.name.includes("bundle"))
      );

      return jsChunks.map((chunk) => ({
        name: chunk.name.split("/").pop(),
        size: chunk.transferSize,
        loadTime: chunk.duration,
        url: chunk.name,
      }));
    }
    return [];
  }

  static getLoadingStrategy() {
    const chunks = this.analyzeChunks();
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

    return {
      chunks,
      totalSize,
      recommendations: this.getRecommendations(chunks, totalSize),
    };
  }

  static getRecommendations(chunks, totalSize) {
    const recommendations = [];

    if (totalSize > 1024 * 1024) {
      // > 1MB
      recommendations.push("Consider code splitting for large bundles");
    }

    const slowChunks = chunks.filter((c) => c.loadTime > 1000);
    if (slowChunks.length > 0) {
      recommendations.push(
        "Some chunks are loading slowly, consider optimizing"
      );
    }

    if (chunks.length > 10) {
      recommendations.push(
        "Many chunks detected, consider bundling strategy review"
      );
    }

    return recommendations;
  }
}

// Global instances
export const performanceMonitor = new PerformanceMonitor();
export const reactOptimizer = new ReactOptimizer();
export const lazyLoader = new LazyLoader();

// React hooks
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Performance monitoring hook
export function usePerformanceMonitor(name, category = "component") {
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = performanceMonitor.startTiming(name, category);

    return () => {
      if (startTimeRef.current) {
        performanceMonitor.endTiming(name);
      }
    };
  }, [name, category]);

  const measureOperation = useCallback(
    (operation, operationName = "operation") => {
      return performanceMonitor.measureSync(
        `${name}_${operationName}`,
        operation,
        category
      );
    },
    [name, category]
  );

  return { measureOperation };
}

// Optimized state hook with performance tracking
export function useOptimizedState(initialValue, name = "state") {
  const [value, setValue] = useState(initialValue);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    reactOptimizer.trackRender(name);
  });

  const optimizedSetValue = useCallback((newValue) => {
    setValue((prev) => {
      // Only update if value actually changed
      if (typeof newValue === "function") {
        const computed = newValue(prev);
        return JSON.stringify(computed) !== JSON.stringify(prev)
          ? computed
          : prev;
      }
      return JSON.stringify(newValue) !== JSON.stringify(prev)
        ? newValue
        : prev;
    });
  }, []);

  return [value, optimizedSetValue, renderCountRef.current];
}

// Memoized computation hook
export function useMemoizedComputation(computeFn, deps, name = "computation") {
  const memoizedFn = useMemo(
    () => ReactOptimizer.memoize(computeFn),
    [computeFn]
  );

  return useMemo(() => {
    const start = performance.now();
    const result = memoizedFn(...deps);
    const duration = performance.now() - start;

    if (duration > 10) {
      console.warn(`Slow computation in ${name}: ${duration}ms`);
    }

    return result;
  }, deps);
}

// Lazy component hook
export function useLazyComponent(importFunction, fallback = null) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    lazyLoader
      .loadComponent(importFunction, fallback)
      .then((component) => {
        setComponent(() => component);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [importFunction, fallback]);

  return { Component, loading, error };
}

// Performance metrics hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

export default {
  performanceMonitor,
  reactOptimizer,
  lazyLoader,
  BundleAnalyzer,
};
