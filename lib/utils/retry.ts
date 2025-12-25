/**
 * Retry utility with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryOn?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Execute a function with retry logic using exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function or throws after all retries exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryOn = () => true,
    onRetry,
  } = options;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt === maxRetries || !retryOn(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      // Notify about retry
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Execute a function with retry logic, returning a result object instead of throwing
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Result object with success status, data or error, and attempt count
 */
export async function tryWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  let attempts = 0;

  try {
    const data = await withRetry(fn, {
      ...options,
      onRetry: (error, attempt) => {
        attempts = attempt;
        options.onRetry?.(error, attempt);
      },
    });
    return { success: true, data, attempts: attempts + 1 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts: attempts + 1,
    };
  }
}

/**
 * Predicate to retry on specific HTTP status codes
 */
export function retryOnStatusCodes(...codes: number[]) {
  return (error: Error): boolean => {
    const status = (error as any).status;
    return codes.includes(status);
  };
}

/**
 * Predicate to retry on server errors (5xx) and rate limits (429)
 */
export function retryOnServerErrors(error: Error): boolean {
  const status = (error as any).status;
  return status === 429 || (status >= 500 && status < 600);
}
