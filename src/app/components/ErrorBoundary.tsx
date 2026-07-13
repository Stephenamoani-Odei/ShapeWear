import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Wifi } from 'lucide-react';
import { isLikelyOfflineError, isDynamicImportError } from '../utils/retryDynamicImport';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isOfflineError: boolean;
  isDynamicImportFailed: boolean;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOfflineError: false,
      isDynamicImportFailed: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isOfflineError = isLikelyOfflineError(error);
    const isDynamicImportFailed = isDynamicImportError(error);

    return {
      hasError: true,
      isOfflineError,
      isDynamicImportFailed,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler (e.g., for Sentry, LogRocket)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isOfflineError: false,
      isDynamicImportFailed: false,
      retryCount: 0,
    });
  };

  handleRetry = () => {
    // Wait a moment for network to potentially recover
    setTimeout(() => {
      this.setState(prev => ({
        retryCount: prev.retryCount + 1,
      }));
      this.handleReset();
    }, 1000);
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-6">
            <div className="text-center max-w-md">
              <div className="flex justify-center mb-4">
                {this.state.isOfflineError ? (
                  <Wifi className="w-16 h-16 text-orange-500" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-500" />
                )}
              </div>

              {this.state.isOfflineError ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    No Internet Connection
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You appear to be offline. Please check your internet connection and try again.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {this.props.context && `Error in ${this.props.context}: `}
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                </>
              )}

              {this.state.errorInfo && (
                <details className="mb-4 text-left text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    Error Details
                  </summary>
                  <pre className="whitespace-pre-wrap text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {this.state.retryCount > 0 && (
                <p className="text-xs text-gray-500 mb-4">
                  Retry attempt: {this.state.retryCount}
                </p>
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </a>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
