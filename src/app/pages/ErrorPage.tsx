import { useRouteError, isRouteErrorResponse } from 'react-router';
import { AlertCircle, Home, Search } from 'lucide-react';
import { Link } from 'react-router';

export function ErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const statusText = isRouteErrorResponse(error)
    ? error.statusText
    : 'Internal Server Error';
  const message = isRouteErrorResponse(error)
    ? error.data?.message || error.statusText
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          {isNotFound ? (
            <Search className="w-20 h-20 text-blue-500" />
          ) : (
            <AlertCircle className="w-20 h-20 text-red-500" />
          )}
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-2">{status}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{statusText}</h2>

        <p className="text-gray-600 mb-6 text-lg">
          {isNotFound
            ? "The page you're looking for doesn't exist. It might have been moved or deleted."
            : message}
        </p>

        {error instanceof Error && (
          <details className="mb-6 text-left text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
              Error Details
            </summary>
            <pre className="whitespace-pre-wrap text-gray-600">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 flex-col sm:flex-row justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
