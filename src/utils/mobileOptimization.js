import React, { memo, useMemo } from "react";

// Mobile-optimized header utilities
export const MobileHeaderOptimizer = {
  // Throttle header updates to improve performance
  throttleHeaderUpdates: (callback, delay = 16) => {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        callback.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            callback.apply(this, args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime)
        );
      }
    };
  },

  // Optimize scroll listener for mobile
  optimizeScrollHandler: (handler) => {
    let ticking = false;

    return (event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handler(event);
          ticking = false;
        });
        ticking = true;
      }
    };
  },

  // Reduce animation complexity on mobile devices
  shouldReduceAnimations: () => {
    if (typeof window === "undefined") return false;

    // Check for reduced motion preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return true;
    }

    // Check if device is mobile/tablet
    const userAgent = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  },

  // Optimize backdrop filter usage
  getOptimizedBackdropFilter: () => {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? "blur(6px)" : "blur(12px)";
  },
};

// Mobile-optimized button component
export const MobileOptimizedButton = memo(
  ({
    children,
    className = "",
    onClick,
    disabled = false,
    variant = "primary",
    ...props
  }) => {
    const buttonClass = useMemo(() => {
      const baseClass =
        "mobile-optimized-button transform translateZ(0) touch-action-manipulation";
      const variantClass =
        variant === "primary"
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-800";

      return `${baseClass} ${variantClass} ${className}`.trim();
    }, [className, variant]);

    const handleClick = useMemo(() => {
      if (!onClick) return undefined;

      return MobileHeaderOptimizer.throttleHeaderUpdates(onClick, 150);
    }, [onClick]);

    return (
      <button
        className={buttonClass}
        onClick={handleClick}
        disabled={disabled}
        style={{
          transform: "translateZ(0)",
          willChange: "transform",
          touchAction: "manipulation",
        }}
        {...props}>
        {children}
      </button>
    );
  }
);

MobileOptimizedButton.displayName = "MobileOptimizedButton";

// Performance monitoring for mobile components
export class MobilePerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Set();
  }

  // Track component render performance
  trackRender(componentName, startTime = performance.now()) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }

    this.metrics.get(componentName).push(renderTime);

    // Alert if render time is too slow (>16ms for 60fps)
    if (renderTime > 16) {
      console.warn(
        `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  }

  // Get performance report
  getReport() {
    const report = {};

    for (const [component, times] of this.metrics.entries()) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      report[component] = {
        averageRenderTime: avgTime.toFixed(2),
        maxRenderTime: maxTime.toFixed(2),
        minRenderTime: minTime.toFixed(2),
        renderCount: times.length,
        isPerformant: avgTime < 16,
      };
    }

    return report;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Global mobile performance monitor instance
export const mobilePerformanceMonitor = new MobilePerformanceMonitor();

// React hook for mobile performance optimization
export const useMobileOptimization = (componentName) => {
  const startTime = performance.now();

  React.useEffect(() => {
    mobilePerformanceMonitor.trackRender(componentName, startTime);
  });

  const shouldReduceAnimations = useMemo(() => {
    return MobileHeaderOptimizer.shouldReduceAnimations();
  }, []);

  const optimizedClassName = useMemo(() => {
    return shouldReduceAnimations
      ? "reduce-motion gpu-accelerated"
      : "gpu-accelerated";
  }, [shouldReduceAnimations]);

  return {
    shouldReduceAnimations,
    optimizedClassName,
    throttle: MobileHeaderOptimizer.throttleHeaderUpdates,
    optimizeScroll: MobileHeaderOptimizer.optimizeScrollHandler,
  };
};

// Mobile-specific animation configurations
export const MobileAnimationConfig = {
  // Reduced animation durations for mobile
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  // Simplified easing functions
  easing: {
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  },

  // Mobile-optimized spring configurations
  spring: {
    gentle: { tension: 120, friction: 14 },
    normal: { tension: 170, friction: 26 },
    wobbly: { tension: 180, friction: 12 },
  },
};

export default MobileHeaderOptimizer;
