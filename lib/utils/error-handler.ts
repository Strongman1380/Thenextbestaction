export interface ApiError extends Error {
  status?: number;
  details?: any;
}

export function createApiError(message: string, status: number, details?: any): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.details = details;
  return error;
}

export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'status' in error;
}

export function handleApiError(error: any): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return createApiError(error.message, 500);
  }

  return createApiError('An unknown error occurred', 500);
}

// Log error with additional context
export function logError(error: any, context?: string): void {
  const apiError = handleApiError(error);
  
  console.error('API Error:', {
    message: apiError.message,
    status: apiError.status,
    details: apiError.details,
    context,
    timestamp: new Date().toISOString(),
    stack: apiError.stack,
  });
}

