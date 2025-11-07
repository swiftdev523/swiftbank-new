// Performance monitoring utility for banking application
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isEnabled = process.env.NODE_ENV === "development";
  }

  // Start measuring performance for an operation
  startMeasure(operationName) {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.metrics.set(operationName, {
      startTime,
      endTime: null,
      duration: null,
      memory: this.getMemoryUsage(),
    });
  }

  // End measuring and calculate duration
  endMeasure(operationName) {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(operationName);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const updatedMetric = {
      ...metric,
      endTime,
      duration,
      memoryEnd: this.getMemoryUsage(),
    };

    this.metrics.set(operationName, updatedMetric);
    this.notifyObservers(operationName, updatedMetric);

    return updatedMetric;
  }

  // Get memory usage information
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  }

  // Measure async function execution
  async measureAsync(operationName, asyncFn) {
    if (!this.isEnabled) return await asyncFn();

    this.startMeasure(operationName);
    try {
      const result = await asyncFn();
      this.endMeasure(operationName);
      return result;
    } catch (error) {
      this.endMeasure(operationName);
      throw error;
    }
  }

  // Get performance report
  getReport() {
    const report = {
      totalOperations: this.metrics.size,
      operations: [],
      averageDuration: 0,
      slowestOperation: null,
      fastestOperation: null,
    };

    let totalDuration = 0;
    let slowest = { duration: 0 };
    let fastest = { duration: Infinity };

    for (const [name, metric] of this.metrics.entries()) {
      if (metric.duration !== null) {
        const operation = { name, ...metric };
        report.operations.push(operation);

        totalDuration += metric.duration;

        if (metric.duration > slowest.duration) {
          slowest = operation;
        }

        if (metric.duration < fastest.duration) {
          fastest = operation;
        }
      }
    }

    report.averageDuration =
      report.operations.length > 0
        ? totalDuration / report.operations.length
        : 0;
    report.slowestOperation = slowest.duration > 0 ? slowest : null;
    report.fastestOperation = fastest.duration < Infinity ? fastest : null;

    return report;
  }

  // Add observer for performance metrics
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Notify observers of performance updates
  notifyObservers(operationName, metric) {
    this.observers.forEach((callback) => {
      try {
        callback(operationName, metric);
      } catch (error) {
        console.error("Performance observer error:", error);
      }
    });
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
  }

  // Log performance summary
  logSummary() {
    if (!this.isEnabled) return;

    const report = this.getReport();
    console.group("🚀 Performance Summary");
    console.log(`Total Operations: ${report.totalOperations}`);
    console.log(`Average Duration: ${report.averageDuration.toFixed(2)}ms`);

    if (report.slowestOperation) {
      console.log(
        `Slowest: ${report.slowestOperation.name} (${report.slowestOperation.duration.toFixed(2)}ms)`
      );
    }

    if (report.fastestOperation) {
      console.log(
        `Fastest: ${report.fastestOperation.name} (${report.fastestOperation.duration.toFixed(2)}ms)`
      );
    }

    console.groupEnd();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance decorator for methods
export function measurePerformance(operationName) {
  return function (target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args) {
      return await performanceMonitor.measureAsync(
        operationName || `${target.constructor.name}.${propertyName}`,
        () => method.apply(this, args)
      );
    };

    return descriptor;
  };
}

// React hook for performance monitoring
import { useEffect, useRef } from "react";

export function usePerformanceMonitor(componentName) {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - renderStartTime.current;
    performanceMonitor.metrics.set(`${componentName}_mount`, {
      startTime: renderStartTime.current,
      endTime: performance.now(),
      duration: mountTime,
      memory: performanceMonitor.getMemoryUsage(),
    });

    return () => {
      performanceMonitor.metrics.set(`${componentName}_unmount`, {
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        memory: performanceMonitor.getMemoryUsage(),
      });
    };
  }, [componentName]);
}

export default performanceMonitor;
