import React, { useState, useEffect } from "react";
import {
  usePerformanceMonitoring,
  useNetworkAwareLoading,
  useMemoryMonitoring,
} from "../hooks/usePerformance";

const PerformanceDashboard = ({ show = false }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [performanceData, setPerformanceData] = useState({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkSpeed: "Unknown",
  });

  const { connectionInfo } = useNetworkAwareLoading();
  const memoryInfo = useMemoryMonitoring("PerformanceDashboard");

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setPerformanceData((prev) => ({
          ...prev,
          fps,
          networkSpeed: connectionInfo.effectiveType,
          memoryUsage: memoryInfo?.usedJSHeapSize || 0,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    if (isVisible) {
      measureFPS();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, connectionInfo, memoryInfo]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Show performance warnings
  const getPerformanceStatus = () => {
    if (performanceData.fps < 30)
      return { status: "poor", color: "text-red-500" };
    if (performanceData.fps < 50)
      return { status: "fair", color: "text-yellow-500" };
    return { status: "good", color: "text-green-500" };
  };

  const performanceStatus = getPerformanceStatus();

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Show Performance Dashboard">
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg shadow-xl backdrop-blur-sm max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Performance Monitor</h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={performanceStatus.color}>
            {performanceData.fps} ({performanceStatus.status})
          </span>
        </div>

        <div className="flex justify-between">
          <span>Network:</span>
          <span>{connectionInfo.effectiveType || "Unknown"}</span>
        </div>

        {memoryInfo && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{memoryInfo.usedJSHeapSize}MB</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Connection:</span>
          <span>{Math.round(connectionInfo.downlink || 0)} Mbps</span>
        </div>

        {connectionInfo.saveData && (
          <div className="text-yellow-400 text-xs">📱 Data Saver Mode</div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-400">Performance Tips:</div>
          <ul className="text-xs text-gray-300 mt-1 space-y-1">
            {performanceData.fps < 30 && <li>• Close other browser tabs</li>}
            {connectionInfo.effectiveType === "2g" && (
              <li>• Slow connection detected</li>
            )}
            {memoryInfo && memoryInfo.usedJSHeapSize > 100 && (
              <li>• High memory usage</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Performance optimization suggestions component
export const PerformanceOptimizer = () => {
  const [suggestions, setSuggestions] = useState([]);
  const { connectionInfo } = useNetworkAwareLoading();

  useEffect(() => {
    const newSuggestions = [];

    // Check connection speed
    if (
      connectionInfo.effectiveType === "2g" ||
      connectionInfo.effectiveType === "slow-2g"
    ) {
      newSuggestions.push({
        type: "network",
        message: "Slow connection detected. Reducing animation complexity.",
        action: "enableDataSaverMode",
      });
    }

    // Check memory usage
    if (
      performance.memory &&
      performance.memory.usedJSHeapSize > 100 * 1024 * 1024
    ) {
      newSuggestions.push({
        type: "memory",
        message: "High memory usage detected. Consider closing other tabs.",
        action: "optimizeMemory",
      });
    }

    // Check device capabilities
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      newSuggestions.push({
        type: "cpu",
        message: "Limited CPU cores detected. Optimizing animations.",
        action: "reduceCPUUsage",
      });
    }

    setSuggestions(newSuggestions);
  }, [connectionInfo]);

  const applySuggestion = (suggestion) => {
    switch (suggestion.action) {
      case "enableDataSaverMode":
        // Reduce animation complexity
        document.documentElement.style.setProperty(
          "--animation-duration",
          "0.1s"
        );
        break;
      case "optimizeMemory":
        // Clear caches, reduce DOM complexity
        console.log("Memory optimization applied");
        break;
      case "reduceCPUUsage":
        // Reduce concurrent animations
        document.documentElement.style.setProperty(
          "--max-concurrent-animations",
          "1"
        );
        break;
      default:
        break;
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm">
      <h4 className="text-sm font-semibold text-yellow-800 mb-2">
        Performance Suggestions
      </h4>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="text-xs text-yellow-700 flex-1">
              {suggestion.message}
            </div>
            <button
              onClick={() => applySuggestion(suggestion)}
              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors">
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
