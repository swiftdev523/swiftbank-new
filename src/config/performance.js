/**
 * Mobile Performance Configuration for Swift Bank
 *
 * This file contains configuration options for optimizing the website
 * performance on mobile devices and slow networks.
 */

export const MobilePerformanceConfig = {
  // Animation settings
  animations: {
    // Reduce animation duration on mobile devices
    mobileSpeedMultiplier: 0.7, // 30% faster animations on mobile

    // Disable complex animations on slow connections
    disableOnSlowConnection: true,

    // Reduce concurrent animations to prevent jank
    maxConcurrentAnimations: 3,

    // Simplified animation curves for better performance
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)", // Material Design standard
      fast: "cubic-bezier(0.4, 0, 1, 1)", // Fast ease-in
      slow: "cubic-bezier(0, 0, 0.2, 1)", // Slow ease-out
    },
  },

  // Rendering optimizations
  rendering: {
    // Force hardware acceleration for key elements
    hardwareAcceleration: {
      enabled: true,
      selectors: [
        ".glass-morphism",
        ".backdrop-blur-md",
        ".floating-element",
        ".mobile-navigation",
        ".loading-spinner",
      ],
    },

    // Reduce backdrop filter complexity on mobile
    backdropFilters: {
      mobile: {
        blur: "6px",
        saturate: "150%",
      },
      desktop: {
        blur: "12px",
        saturate: "180%",
      },
    },

    // Container queries and layout containment
    containment: {
      enabled: true,
      strictMode: true, // Use strict containment on mobile
    },
  },

  // Network optimizations
  network: {
    // Preload settings based on connection speed
    preloading: {
      "4g": {
        images: true,
        fonts: true,
        criticalCSS: true,
      },
      "3g": {
        images: false,
        fonts: true,
        criticalCSS: true,
      },
      "2g": {
        images: false,
        fonts: false,
        criticalCSS: true,
      },
    },

    // Lazy loading thresholds
    lazyLoading: {
      rootMargin: {
        "4g": "100px",
        "3g": "50px",
        "2g": "20px",
      },
    },
  },

  // Memory management
  memory: {
    // Clear unused resources
    autoCleanup: true,

    // Limit concurrent heavy operations
    maxConcurrentOperations: 2,

    // Component recycling for lists
    virtualScrolling: {
      enabled: true,
      threshold: 50, // Items before virtualization kicks in
    },
  },

  // Touch and interaction optimizations
  touch: {
    // Improve touch responsiveness
    passiveListeners: true,

    // Optimize touch targets for mobile
    minTouchTargetSize: 44, // pixels

    // Reduce touch latency
    touchAction: "manipulation",

    // Disable unnecessary interactions
    disableHoverOnTouch: true,
  },

  // Performance monitoring
  monitoring: {
    // Enable performance tracking
    enabled: process.env.NODE_ENV === "development",

    // FPS monitoring
    fps: {
      warningThreshold: 30,
      errorThreshold: 20,
    },

    // Memory monitoring
    memory: {
      warningThreshold: 100, // MB
      errorThreshold: 200, // MB
    },

    // Render time monitoring
    renderTime: {
      warningThreshold: 16, // ms (60fps)
      errorThreshold: 33, // ms (30fps)
    },
  },

  // Feature flags for different devices
  deviceSpecific: {
    mobile: {
      reduceParallax: true,
      simplifyGradients: true,
      reduceBoxShadows: true,
      optimizeImages: true,
    },
    tablet: {
      reduceParallax: false,
      simplifyGradients: false,
      reduceBoxShadows: false,
      optimizeImages: true,
    },
    desktop: {
      reduceParallax: false,
      simplifyGradients: false,
      reduceBoxShadows: false,
      optimizeImages: false,
    },
  },

  // Accessibility and user preferences
  accessibility: {
    // Respect user motion preferences
    respectReducedMotion: true,

    // Provide performance mode toggle
    showPerformanceToggle: true,

    // Battery optimization
    enableBatterySaving: true,
  },
};

/**
 * Apply performance optimizations based on device and network conditions
 */
export const applyPerformanceOptimizations = () => {
  const config = MobilePerformanceConfig;

  // Detect device type
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

  // Get network information
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const networkSpeed = connection ? connection.effectiveType : "4g";

  // Apply device-specific optimizations
  const deviceConfig = isMobile
    ? config.deviceSpecific.mobile
    : isTablet
      ? config.deviceSpecific.tablet
      : config.deviceSpecific.desktop;

  // Apply CSS custom properties for dynamic optimization
  const root = document.documentElement;

  // Animation optimizations
  if (
    config.animations.disableOnSlowConnection &&
    (networkSpeed === "2g" || networkSpeed === "slow-2g")
  ) {
    root.style.setProperty("--animation-duration", "0.1s");
    root.style.setProperty("--transition-duration", "0.1s");
  } else {
    const speedMultiplier = isMobile
      ? config.animations.mobileSpeedMultiplier
      : 1;
    root.style.setProperty(
      "--animation-speed-multiplier",
      speedMultiplier.toString()
    );
  }

  // Backdrop filter optimizations
  const backdropConfig = isMobile
    ? config.rendering.backdropFilters.mobile
    : config.rendering.backdropFilters.desktop;
  root.style.setProperty("--backdrop-blur", backdropConfig.blur);
  root.style.setProperty("--backdrop-saturate", backdropConfig.saturate);

  // Device-specific optimizations
  if (deviceConfig.reduceParallax) {
    root.style.setProperty("--enable-parallax", "0");
  }

  if (deviceConfig.simplifyGradients) {
    root.style.setProperty("--gradient-complexity", "simple");
  }

  if (deviceConfig.reduceBoxShadows) {
    root.style.setProperty("--box-shadow-complexity", "reduced");
  }

  // Touch optimizations
  if (isMobile && config.touch.passiveListeners) {
    // This would typically be applied during event listener registration
    root.style.setProperty("--touch-action", "manipulation");
  }

  console.log("Performance optimizations applied", {
    device: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
    network: networkSpeed,
    optimizations: deviceConfig,
  });
};

/**
 * Performance utility functions
 */
export const PerformanceUtils = {
  // Check if device supports modern features
  supportsModernFeatures: () => {
    return (
      "IntersectionObserver" in window &&
      "requestIdleCallback" in window &&
      CSS.supports("backdrop-filter", "blur(10px)")
    );
  },

  // Get device performance tier
  getPerformanceTier: () => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;

    if (cores >= 8 && memory >= 8) return "high";
    if (cores >= 4 && memory >= 4) return "medium";
    return "low";
  },

  // Estimate available resources
  getResourceBudget: () => {
    const tier = PerformanceUtils.getPerformanceTier();

    const budgets = {
      high: { animations: 10, particles: 50, blur: "full" },
      medium: { animations: 5, particles: 20, blur: "reduced" },
      low: { animations: 2, particles: 5, blur: "minimal" },
    };

    return budgets[tier];
  },
};

// Initialize optimizations on module load
if (typeof window !== "undefined") {
  // Apply optimizations after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      applyPerformanceOptimizations
    );
  } else {
    applyPerformanceOptimizations();
  }
}

export default MobilePerformanceConfig;
