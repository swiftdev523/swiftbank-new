import React from "react";

const LoadingIndicator = ({
  loading = false,
  message = "Loading...",
  progress = 0,
}) => {
  if (!loading) return null;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          {/* Circular progress indicator */}
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 animate-spin">
            <div
              className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent"
              style={{
                transform: `rotate(${progress * 360}deg)`,
                transition: "transform 0.3s ease-in-out",
              }}
            />
          </div>

          {/* Progress percentage */}
          {progress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Loading message */}
        {message && (
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingIndicator;
