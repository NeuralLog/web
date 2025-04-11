/**
 * Error handling utilities
 */

/**
 * Check if an error is a connection error (server not available)
 *
 * @param error The error to check
 * @returns True if the error is a connection error
 */
export function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for common connection error patterns
    return (
      message.includes('failed to fetch') ||
      message.includes('network error') ||
      message.includes('connection refused') ||
      message.includes('network request failed') ||
      message.includes('cannot connect') ||
      message.includes('econnrefused') ||
      message.includes('timeout') ||
      message.includes('unexpected token') ||
      message.includes('not valid json') ||
      message.includes('syntaxerror')
    );
  }

  return false;
}

/**
 * Format an error message for display
 *
 * @param error The error to format
 * @param defaultMessage Default message to show if error is not an Error object
 * @returns Formatted error message
 */
export function formatErrorMessage(error: unknown, defaultMessage = 'An unknown error occurred'): string {
  if (error instanceof Error) {
    if (isConnectionError(error)) {
      return 'Unable to connect to the logs server. Please make sure it is running.';
    }

    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Get a user-friendly error message
 *
 * @param error The error to get a message for
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isConnectionError(error)) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('unexpected token') || message.includes('not valid json') || message.includes('syntaxerror')) {
        return 'The logs server returned an invalid response. This might be due to CORS issues or the server not running correctly.';
      }
    }

    return 'Unable to connect to the logs server. Please make sure it is running and accessible.';
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('404')) {
      return 'The requested resource was not found. Please check the API endpoint configuration.';
    }

    if (error.message.includes('401') || error.message.includes('403')) {
      return 'You do not have permission to access this resource. Please check your authentication.';
    }

    if (error.message.includes('500')) {
      return 'The server encountered an error. Please check the server logs for more information.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again later.';
}
