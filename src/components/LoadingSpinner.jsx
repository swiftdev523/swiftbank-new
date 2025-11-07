import React from "react";

const LoadingSpinner = ({
  size = "md",
  message = "Loading...",
  showMessage = true,
  variant = "primary",
  fullScreen = false,
}) => {
  // Size configurations
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    xxl: "w-20 h-20",
  };

  // Color variants
  const colorClasses = {
    primary: "border-blue-500",
    secondary: "border-purple-500",
    success: "border-green-500",
    white: "border-white",
    gray: "border-gray-400",
  };

  const SpinnerElement = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main Spinner Container */}
      <div className="relative gpu-accelerated">
        {/* Outer Ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent ${colorClasses[variant]} border-t-transparent animate-spin`}
          style={{
            animation: "spin 1.5s linear infinite",
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Inner Ring - Counter Rotating */}
        <div
          className={`absolute inset-2 rounded-full border-2 border-transparent ${colorClasses[variant]} border-b-transparent opacity-60`}
          style={{
            animation: "spin-reverse 1s linear infinite",
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Center Dot */}
        <div
          className={`absolute inset-0 m-auto w-2 h-2 ${colorClasses[
            variant
          ].replace("border-", "bg-")} rounded-full opacity-80`}
          style={{
            animation: "pulse 2s ease-in-out infinite",
            transform: "translateZ(0)",
            willChange: "opacity",
          }}
        />
      </div>

      {/* Loading Message */}
      {showMessage && (
        <div className="text-center">
          <p
            className={`text-sm font-medium ${
              variant === "white" ? "text-white" : "text-gray-600"
            } animate-pulse`}>
            {message}
          </p>
          <div className="flex justify-center space-x-1 mt-2">
            <div
              className={`w-1 h-1 ${colorClasses[variant].replace(
                "border-",
                "bg-"
              )} rounded-full`}
              style={{
                animation: "bounce 1.4s ease-in-out infinite",
                transform: "translateZ(0)",
                willChange: "transform",
              }}
            />
            <div
              className={`w-1 h-1 ${colorClasses[variant].replace(
                "border-",
                "bg-"
              )} rounded-full`}
              style={{
                animation: "bounce 1.4s ease-in-out 0.2s infinite",
                transform: "translateZ(0)",
                willChange: "transform",
              }}
            />
            <div
              className={`w-1 h-1 ${colorClasses[variant].replace(
                "border-",
                "bg-"
              )} rounded-full`}
              style={{
                animation: "bounce 1.4s ease-in-out 0.4s infinite",
                transform: "translateZ(0)",
                willChange: "transform",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  // Full screen overlay version
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 gpu-accelerated">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl mobile-optimized-fade active">
          <SpinnerElement />
        </div>
      </div>
    );
  }

  // Inline version
  return <SpinnerElement />;
};

// Add the custom animations to the global CSS
const spinnerStyles = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes spin-reverse {
    to {
      transform: rotate(-360deg);
    }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
`;

// Inject styles if not already present
if (
  typeof document !== "undefined" &&
  !document.querySelector("#spinner-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "spinner-styles";
  styleSheet.textContent = spinnerStyles;
  document.head.appendChild(styleSheet);
}

export default LoadingSpinner;
