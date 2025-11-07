import React from "react";
import { ErrorLogger, AppError, ErrorTypes } from "../utils/errorUtils";

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    const enhancedError =
      error instanceof AppError
        ? error
        : new AppError(ErrorTypes.UNKNOWN, error.message, {
            stack: error.stack,
          });

    ErrorLogger.log(enhancedError, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || "Unknown",
      retryCount: this.state.retryCount,
    });

    this.setState({
      error: enhancedError,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI based on error type
      const error = this.state.error;
      const isRetryable = error?.retryable || this.state.retryCount < 3;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Oops! Something went wrong
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {error?.getUserFriendlyMessage() ||
                  "An unexpected error occurred"}
              </p>

              {process.env.NODE_ENV === "development" && error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(error.toJSON(), null, 2)}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              {isRetryable && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Try Again
                  {this.state.retryCount > 0 && (
                    <span className="ml-1">
                      ({this.state.retryCount + 1}/3)
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Reload Page
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go Back
              </button>
            </div>

            {this.props.showSupport !== false && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  If the problem persists, please{" "}
                  <a
                    href="mailto:support@swiftbank.com"
                    className="font-medium text-blue-600 hover:text-blue-500">
                    contact support
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
