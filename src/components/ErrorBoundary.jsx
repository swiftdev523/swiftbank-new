import React from "react";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <FaExclamationTriangle className="text-red-600 text-2xl" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. A technical error has occurred.
              Please try refreshing the page or contact support if the problem
              persists.
            </p>

            {/* Error Details (Only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Error Details:
                </h3>
                <p className="text-sm text-red-600 font-mono break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <FaRedo className="text-sm" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FaHome className="text-sm" />
                <span>Go Home</span>
              </button>
            </div>

            {/* Support Contact */}
            <div className="mt-6 text-sm text-gray-500">
              Need help? Contact{" "}
              <button
                onClick={() =>
                  alert("Please call 1-800-CL-BANK for technical support.")
                }
                className="text-blue-600 hover:text-blue-700 underline">
                Swift Bank Support
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
