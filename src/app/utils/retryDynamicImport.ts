/**
 * Retry logic for failed dynamic imports with exponential backoff
 */

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Wraps a dynamic import with retry logic
 * @param importFn - The dynamic import function
 * @param config - Retry configuration
 */
export async function retryDynamicImport<T>(
  importFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const maxRetries = config.maxRetries ?? MAX_RETRIES;
  const baseDelay = config.baseDelay ?? BASE_DELAY;
  const onRetry = config.onRetry;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is a dynamic import failure
 */
export function isDynamicImportError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to import')
    );
  }
  return false;
}

/**
 * Check if error is likely due to being offline
 */
export function isLikelyOfflineError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      !navigator.onLine
    );
  }
  return !navigator.onLine;
}
