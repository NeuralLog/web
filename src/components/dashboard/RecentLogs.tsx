'use client';

import React from 'react';
import Link from 'next/link';
import LogIdLink from '@/components/links/LogIdLink';
import LogNameLink from '@/components/links/LogNameLink';
import { Button } from '@/components/ui/Button';
import { ErrorState, EmptyState } from '@/components/ui/ErrorState';
import { formatDate } from '@/utils/date';
import { LogEntry } from '@/sdk/logs/types';

interface RecentLogsProps {
  logs: LogEntry[];
  isLoading: boolean;
  error: unknown | null;
  onRetry: () => void;
}



/**
 * Recent logs component for the dashboard
 */
export function RecentLogs({ logs, isLoading, error, onRetry }: RecentLogsProps) {
  console.log('RecentLogs: Rendering with isLoading =', isLoading, 'error =', error, 'logs.length =', logs.length);
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Logs</h3>
        <Link href="/logs">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={onRetry}
        />
      ) : logs.length === 0 ? (
        <EmptyState message="No logs found" />
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log) => (
            <li key={log.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <LogNameLink logName={log.name || 'unknown'} className="mb-1">
                      <p className="text-lg font-medium">
                        {log.name || 'unknown'}
                      </p>
                    </LogNameLink>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-bold">ID:</span> <LogIdLink logSlug={log.name || 'unknown'} logId={log.id} className="inline" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-bold">Timestamp:</span> {formatDate(log.timestamp)}
                    </p>
                    {log.data && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Preview:</p>
                        <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-20">
                          {JSON.stringify(log.data, null, 2).substring(0, 200)}
                          {JSON.stringify(log.data, null, 2).length > 200 ? '...' : ''}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 self-start">
                    <Link href={`/logs/${log.name || 'unknown'}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
