'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LogsService } from '@/services/logsService';
import { AggregateStatistics } from '@neurallog/shared';
import { formatDate } from '@/utils/date';
import Link from 'next/link';

interface StatsPanelProps {
  isLoading?: boolean;
}

/**
 * Stats panel component for the dashboard
 */
export function StatsPanel({ isLoading: initialLoading }: StatsPanelProps) {
  // State
  const [statistics, setStatistics] = useState<AggregateStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(initialLoading || true);
  const [error, setError] = useState<unknown | null>(null);

  // Create a stable reference to the LogsService instance
  const logsServiceRef = useRef<LogsService | null>(null);

  // Initialize the LogsService if it doesn't exist
  if (!logsServiceRef.current) {
    logsServiceRef.current = new LogsService('default');
  }

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const stats = await logsServiceRef.current!.getAggregateStatistics();
        console.log('Fetched statistics:', stats);
        setStatistics(stats);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Statistics
        </h3>

        {loading ? (
          <div className="mt-5 grid grid-cols-2 gap-5">
            <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Logs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </dd>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Entries
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </dd>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="mt-5 text-center py-4">
            <p className="text-red-500 dark:text-red-400">Error loading statistics</p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-5">
              <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Logs
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {statistics?.totalLogs || 0}
                  </dd>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Entries
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {statistics?.totalEntries || 0}
                  </dd>
                </div>
              </div>
            </div>

            {statistics?.logStats && statistics.logStats.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Top Logs</h4>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Log Name
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Entries
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Entry
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {statistics.logStats.slice(0, 5).map((logStat) => (
                        <tr key={logStat.logName} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                            <Link href={`/logs/${logStat.logName}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                              {logStat.logName}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {logStat.entryCount}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {logStat.lastEntryTimestamp ? formatDate(new Date(logStat.lastEntryTimestamp).toISOString()) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
