'use client';

import React from 'react';
import { Button } from './Button';
import { isConnectionError, getUserFriendlyErrorMessage } from '@/utils/error-helpers';
import { useState, useEffect } from 'react';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error state component
 *
 * Displays a user-friendly error message with optional retry button
 */
export function ErrorState({ error, onRetry, className = '' }: ErrorStateProps) {
  // Use state to prevent flash of error content
  const [isVisible, setIsVisible] = useState(false);
  const [isConnection, setIsConnection] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Process the error after a short delay to prevent UI flashing
  useEffect(() => {
    if (!error) {
      setIsVisible(false);
      return;
    }

    // Reset visibility when error changes
    setIsVisible(false);

    // Process the error
    const isConn = isConnectionError(error);
    const message = getUserFriendlyErrorMessage(error);
    setIsConnection(isConn);
    setErrorMessage(message);

    // Don't show error immediately to prevent flashing
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // Longer delay to prevent flashing

    return () => clearTimeout(timer);
  }, [error]);

  // Don't render anything if not visible yet
  if (!isVisible) return null;

  return (
    <div className={`p-6 rounded-lg bg-red-50 dark:bg-red-900/20 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {isConnection ? 'Connection Error' : 'Error'}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{errorMessage}</p>

            {isConnection && (
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Check if the logs server is running</li>
                <li>Verify the server URL is correct</li>
                <li>Check for any network issues</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {onRetry && (
        <div className="mt-4">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800/30"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Empty state component
 *
 * Displays a message when no data is available
 */
export function EmptyState({ message = 'No data available', className = '' }: { message?: string, className?: string }) {
  return (
    <div className={`p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 ${className}`}>
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{message}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No items to display at this time.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading state component
 *
 * Displays a loading indicator
 */
export function LoadingState({ message = 'Loading...', className = '' }: { message?: string, className?: string }) {
  return (
    <div className={`p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 dark:border-gray-500 mx-auto"></div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{message}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we load the data.
        </p>
      </div>
    </div>
  );
}
