'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { LogsService } from '@/services/logsService';
import { LogEntry } from '@/sdk/logs/types';
import { formatDate } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import LogNameLink from '@/components/links/LogNameLink';
import { ErrorState, LoadingState } from '@/components/ui/ErrorState';
import JsonViewer from '@/components/LogDetail/JsonViewer';

interface LogDetailPageProps {
  params: {
    logSlug: string;
    logId: string;
  };
}

export default function LogDetailPage({ params }: LogDetailPageProps) {
  // Get the log slug and ID from the URL using React.use() to unwrap the params promise
  const unwrappedParams = use(params);
  const { logSlug, logId } = unwrappedParams;

  // State
  const [logEntry, setLogEntry] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  // Create a stable reference to the LogsService instance
  const logsServiceRef = React.useRef<LogsService | null>(null);

  // Initialize the LogsService if it doesn't exist
  if (!logsServiceRef.current) {
    logsServiceRef.current = new LogsService('default');
  }

  // Fetch log entry
  const fetchLogEntry = useCallback(async () => {
    if (!logSlug || !logId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching log entry for: ${logSlug}/${logId}`);

      // First try to get the log by name and then find the entry by ID
      const entries = await logsServiceRef.current!.getLogByName(logSlug, 100);
      const entry = entries.find(e => e.id === logId);

      if (entry) {
        console.log(`Found entry for ${logId}`);
        setLogEntry(entry);
      } else {
        console.error(`Entry not found for ${logId}`);
        setError(new Error(`Log entry not found: ${logId}`));
      }
    } catch (err) {
      console.error(`Error fetching log entry for ${logSlug}/${logId}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [logSlug, logId]);

  // Load log entry on component mount
  useEffect(() => {
    fetchLogEntry();
  }, [fetchLogEntry]);

  // Determine if the data is JSON
  const isJson = (data: any): boolean => {
    if (typeof data !== 'object') return false;
    try {
      return true;
    } catch (e) {
      return false;
    }
  };

  // Format the data based on its type
  const formatData = (data: any) => {
    if (isJson(data)) {
      return <JsonViewer data={data} className="max-h-[600px]" />;
    } else {
      return (
        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-[600px]">
          {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
        </pre>
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Log Entry Details
            </h1>
            <div className="flex space-x-2 text-sm">
              <LogNameLink logName={logSlug} className="inline-flex items-center">
                <span>← Back to {logSlug} logs</span>
              </LogNameLink>
            </div>
          </div>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4">
          <ErrorState
            error={error}
            onRetry={fetchLogEntry}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && !error ? (
        <div className="mt-8">
          <LoadingState message={`Loading log entry ${logId}...`} />
        </div>
      ) : null}

      {/* Log entry details */}
      {!loading && !error && logEntry && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Entry Information
            </h2>
          </div>

          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                  {logEntry.id}
                </dd>
              </div>

              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(logEntry.timestamp)}
                </dd>
              </div>

              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Log Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {logEntry.name || logSlug}
                </dd>
              </div>

              {logEntry.userId && (
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {logEntry.userId}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Log Data
            </h3>
            {formatData(logEntry.data)}
          </div>

          {/* Add a copy button for the entire log entry */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(logEntry, null, 2));
                alert('Log entry copied to clipboard');
              }}
              variant="outline"
              size="sm"
            >
              Copy Full Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
