import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useContext,
} from "react";

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    isSlowRendering: false,
  });

  useEffect(() => {
    renderCount.current++;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;

    if (renderCount.current > 1) {
      // Skip first render
      const isSlowRendering = renderTime > 16; // 60fps threshold

      setPerformanceMetrics((prev) => ({
        renderCount: renderCount.current,
        averageRenderTime:
          (prev.averageRenderTime * (renderCount.current - 2) + renderTime) /
          (renderCount.current - 1),
        isSlowRendering,
      }));

      if (isSlowRendering) {
        console.warn(
          `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    }

    lastRenderTime.current = currentTime;
  });

  return performanceMetrics;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef,
  options = { threshold: 0.1, rootMargin: "50px" }
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// Mobile viewport detection hook
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width <= 768);
    };

    checkViewport();

    const debouncedResize = debounce(checkViewport, 150);
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return { isMobile, viewportWidth };
};

// Touch gesture detection hook
export const useTouchGestures = (elementRef) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwipe, setIsSwipe] = useState(false);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipe(false);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setIsSwipe(true);
    }
  }, [touchStart, touchEnd]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", onTouchStart);
    element.addEventListener("touchmove", onTouchMove);
    element.addEventListener("touchend", onTouchEnd);

    return () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", onTouchEnd);
    };
  }, [elementRef, onTouchStart, onTouchMove, onTouchEnd]);

  return {
    isSwipe,
    touchStart,
    touchEnd,
    swipeDirection:
      touchStart && touchEnd
        ? touchStart - touchEnd > minSwipeDistance
          ? "left"
          : touchEnd - touchStart > minSwipeDistance
            ? "right"
            : null
        : null,
  };
};

// Optimized animation hook for mobile
export const useOptimizedAnimation = (shouldAnimate = true) => {
  const [canAnimate, setCanAnimate] = useState(shouldAnimate);
  const { isMobile } = useMobileViewport();

  useEffect(() => {
    // Check for reduced motion preference and performance indicators
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldReduce = mediaQuery.matches;

    // Additional mobile performance checks
    const isLowEndDevice =
      isMobile &&
      (navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 4);

    setCanAnimate(shouldAnimate && !shouldReduce && !isLowEndDevice);

    const handleChange = (e) => {
      setCanAnimate(shouldAnimate && !e.matches && !isLowEndDevice);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [shouldAnimate, isMobile]);

  const animationProps = {
    transition: canAnimate
      ? {
          duration: isMobile ? 0.15 : 0.25,
          ease: "easeOut",
        }
      : { duration: 0 },
    animate: canAnimate,
    variants: {
      hidden: { opacity: 0, y: isMobile ? 10 : 20 },
      visible: { opacity: 1, y: 0 },
    },
  };

  return { canAnimate, animationProps, isMobile };
};

// Memory usage monitoring
export const useMemoryMonitoring = (componentName) => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const checkMemory = () => {
      if ("memory" in performance) {
        const memory = performance.memory;
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        });

        // Warn if memory usage is high
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
          console.warn(`High memory usage in ${componentName}:`, memoryInfo);
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [componentName]);

  return memoryInfo;
};

// Network-aware loading hook
export const useNetworkAwareLoading = () => {
  const [connectionInfo, setConnectionInfo] = useState({
    effectiveType: "4g",
    downlink: 10,
    rtt: 100,
    saveData: false,
  });

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = navigator.connection;

      const updateConnectionInfo = () => {
        setConnectionInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      };

      updateConnectionInfo();
      connection.addEventListener("change", updateConnectionInfo);

      return () => {
        connection.removeEventListener("change", updateConnectionInfo);
      };
    }
  }, []);

  const shouldOptimizeForSlowConnection = () => {
    return (
      connectionInfo.effectiveType === "slow-2g" ||
      connectionInfo.effectiveType === "2g" ||
      connectionInfo.saveData
    );
  };

  const shouldPreloadImages = () => {
    return connectionInfo.effectiveType === "4g" && !connectionInfo.saveData;
  };

  return {
    connectionInfo,
    shouldOptimizeForSlowConnection,
    shouldPreloadImages,
  };
};

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Global performance context
export const PerformanceContext = React.createContext({
  isOptimizedMode: false,
  reducedMotion: false,
  isMobile: false,
  connectionSpeed: "4g",
});

export const PerformanceProvider = ({ children }) => {
  const { isMobile } = useMobileViewport();
  const { connectionInfo } = useNetworkAwareLoading();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value = {
    isOptimizedMode: isMobile || reducedMotion || connectionInfo.saveData,
    reducedMotion,
    isMobile,
    connectionSpeed: connectionInfo.effectiveType,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error(
      "usePerformanceContext must be used within a PerformanceProvider"
    );
  }
  return context;
};
