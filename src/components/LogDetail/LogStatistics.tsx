'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LogsService } from '@/services/logsService';
import { LogStatistics } from '@neurallog/shared';
import { formatDate } from '@/utils/date';

interface LogStatisticsProps {
  logSlug: string;
}

export default function LogStatisticsPanel({ logSlug }: LogStatisticsProps) {
  // State
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
      if (!logSlug) return;

      try {
        setLoading(true);
        setError(null);

        const stats = await logsServiceRef.current!.getLogStatistics(logSlug);
        console.log(`Fetched statistics for ${logSlug}:`, stats);
        setStatistics(stats);
      } catch (err) {
        console.error(`Error fetching statistics for ${logSlug}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [logSlug]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Log Statistics
          </h3>
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Log Statistics
          </h3>
          <div className="text-red-500 dark:text-red-400">
            Error loading statistics
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Log Statistics
          </h3>
          <div className="text-gray-500 dark:text-gray-400">
            No statistics available for this log
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
          Log Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Entries
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {statistics.entryCount}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              First Entry
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {statistics.firstEntryTimestamp 
                ? formatDate(new Date(statistics.firstEntryTimestamp).toISOString()) 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last Entry
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {statistics.lastEntryTimestamp 
                ? formatDate(new Date(statistics.lastEntryTimestamp).toISOString()) 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Log Name
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {statistics.logName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
