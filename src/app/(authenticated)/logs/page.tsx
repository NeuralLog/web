'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogsService } from '@/services/logsService';
import { Button } from '@/components/ui/Button';
import { ErrorState, EmptyState, LoadingState } from '@/components/ui/ErrorState';
import Link from 'next/link';
import LogNameLink from '@/components/links/LogNameLink';
import { useAuth } from '@/context/AuthContext';

export default function LogsIndexPage() {
  // State
  const [logNames, setLogNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Get Auth0 token
  const { getAccessToken } = useAuth();

  // Create a stable reference to the LogsService instance
  const logsServiceRef = useRef<LogsService | null>(null);

  // Initialize the LogsService if it doesn't exist
  if (!logsServiceRef.current) {
    logsServiceRef.current = new LogsService('default');
  }

  // Fetch log names
  const fetchLogNames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the Auth0 token
      const token = await getAccessToken();

      // Set the Auth0 token in the LogsService
      if (token) {
        logsServiceRef.current!.setAuth0Token(token);
      }

      console.log('Fetching log names');
      const names = await logsServiceRef.current!.getLogNames();
      console.log(`Received ${names.length} log names`);

      setLogNames(names);
    } catch (err) {
      console.error('Error fetching log names:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  // Load log names on component mount or when refreshCount changes
  useEffect(() => {
    fetchLogNames();
  }, [fetchLogNames, refreshCount]);

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs</h1>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4">
          <ErrorState
            error={error}
            onRetry={fetchLogNames}
          />
        </div>
      )}

      {/* Log list */}
      {loading && !error ? (
        <div className="mt-8">
          <LoadingState message="Loading logs..." />
        </div>
      ) : (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Available Logs ({logNames.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Select a log to view its entries
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              {logNames.length === 0 ? (
                <div className="px-4 py-5 sm:px-6">
                  <EmptyState message="No logs found" />
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logNames.map((logName) => (
                    <li key={logName}>
                      <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <LogNameLink logName={logName} className="text-lg font-medium truncate">
                              {logName}
                            </LogNameLink>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                View
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
