'use client';

import React, { useState, useEffect } from 'react';
import { EmptyState } from './EmptyState';

interface LoadingStateProps {
  message?: string;
  timeout?: number; // Timeout in milliseconds
  className?: string;
}

/**
 * Loading state component
 * 
 * Displays a loading spinner with an optional message
 * Automatically switches to empty state after timeout
 */
export function LoadingState({ 
  message = 'Loading...', 
  timeout = 5000, // Default timeout of 5 seconds
  className = '' 
}: LoadingStateProps) {
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  // Set a timeout to automatically hide the loading spinner
  useEffect(() => {
    console.log(`LoadingState: Setting timeout of ${timeout}ms`);
    const timer = setTimeout(() => {
      console.log('LoadingState: Timeout reached, hiding spinner');
      setIsTimedOut(true);
    }, timeout);
    
    return () => {
      clearTimeout(timer);
    };
  }, [timeout]);
  
  // If timed out, show empty state
  if (isTimedOut) {
    return <EmptyState message="No data available" />;
  }
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      {message && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
