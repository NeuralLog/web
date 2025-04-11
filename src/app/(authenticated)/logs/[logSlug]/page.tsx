'use client';

import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import { LogsService } from '@/services/logsService';
import { LogEntry } from '@/sdk/logs/types';
import { formatDate } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import LogIdLink from '@/components/links/LogIdLink';
import { ErrorState, EmptyState, LoadingState } from '@/components/ui/ErrorState';
import LogStatisticsPanel from '@/components/LogDetail/LogStatistics';

interface LogPageProps {
  params: {
    logSlug: string;
  };
}

export default function LogPage({ params }: LogPageProps) {
  // Get the log slug from the URL using React.use() to unwrap the params promise
  const unwrappedParams = use(params);
  const { logSlug } = unwrappedParams;

  // State
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Create a stable reference to the LogsService instance
  const logsServiceRef = useRef<LogsService | null>(null);

  // Initialize the LogsService if it doesn't exist
  if (!logsServiceRef.current) {
    logsServiceRef.current = new LogsService('default');
  }

  // Fetch log entries
  const fetchLogEntries = useCallback(async () => {
    if (!logSlug) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching log entries for: ${logSlug}`);
      const entries = await logsServiceRef.current!.getLogByName(logSlug, 100);
      console.log(`Received ${entries.length} entries for ${logSlug}`);

      setLogEntries(entries);
    } catch (err) {
      console.error(`Error fetching log entries for ${logSlug}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [logSlug]);

  // Load log entries on component mount or when refreshCount changes
  useEffect(() => {
    fetchLogEntries();
  }, [fetchLogEntries, refreshCount]);

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {logSlug}
          </h1>
          <div className="mt-2">
            <Link href="/logs" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
              ← Back to all logs
            </Link>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Log Statistics */}
      <LogStatisticsPanel logSlug={logSlug} />

      {/* Error message */}
      {error && (
        <div className="mt-4">
          <ErrorState
            error={error}
            onRetry={fetchLogEntries}
          />
        </div>
      )}

      {/* Log entries */}
      {loading && !error ? (
        <div className="mt-8">
          <LoadingState message={`Loading entries for ${logSlug}...`} />
        </div>
      ) : (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {logEntries.length} entries
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              {logEntries.length === 0 ? (
                <div className="px-4 py-5 sm:px-6">
                  <EmptyState message="No log entries found" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {logEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            <LogIdLink logSlug={logSlug} logId={entry.id} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            <div className="whitespace-normal">{formatDate(entry.timestamp)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(entry.data, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
