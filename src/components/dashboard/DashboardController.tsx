'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LogsService } from '@/services/logsService';
import { LogEntry } from '@/sdk/logs/types';
import { StatsPanel } from './StatsPanel';
import { RecentLogs } from './RecentLogs';

/**
 * Dashboard controller component
 * Manages loading state and data fetching for the dashboard
 */
export function DashboardController() {
  // State for logs data
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logNames, setLogNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  // Create stable references
  const logsServiceRef = useRef<LogsService | null>(null);
  const logsRef = useRef<LogEntry[]>([]);
  const loadingRef = useRef<boolean>(true);

  // Initialize the LogsService if it doesn't exist
  if (!logsServiceRef.current) {
    logsServiceRef.current = new LogsService('default');
  }



  // Fetch logs data
  const fetchLogs = useCallback(async () => {
    console.log('DashboardController: fetchLogs called');
    try {
      // Start with loading state, clear any previous errors
      console.log('Dashboard: Setting loading state to true');
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      // No delay to improve performance

      // Set a timeout to force loading to false after 3 seconds
      const timeoutId = setTimeout(() => {
        console.log('Dashboard: Force setting loading state to false after timeout');
        setLoading(false);
      }, 3000);



      try {
        // Try to get all log names
        const names = await logsServiceRef.current!.getLogNames();
        setLogNames(names);
        console.log('Dashboard: Log names:', names);

        // Get logs from the fixed-log if available, otherwise use the first log
        const logName = names.includes('fixed-log') ? 'fixed-log' : names[0];
        if (logName) {
          console.log('Dashboard: Using log:', logName);
          console.log('Dashboard: Fetching log entries for:', logName);

          // Use direct fetch for better performance
          try {
            console.log('Dashboard: Using direct fetch');
            const response = await fetch(`/api/logs/${logName}?limit=5`, {
              cache: 'no-store', // Don't cache the response
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.entries && Array.isArray(data.entries)) {
              console.log('Dashboard: Got entries:', data.entries.length);
              const entries = data.entries;
              setLogs(entries);
              logsRef.current = entries;

              setLoading(false);
              loadingRef.current = false;
              clearTimeout(timeoutId); // Clear the timeout since we've loaded successfully
              return; // Exit early
            } else {
              console.log('Dashboard: No entries in response:', data);
              setLogs([]);
              logsRef.current = [];
              setLoading(false);
              loadingRef.current = false;
              return;
            }
          } catch (directError) {
            console.error('Dashboard: Direct fetch failed:', directError);
            // Continue to fallback
          }

          // Fall back to using the service
          try {
            console.log('Dashboard: Falling back to service');
            const logEntries = await logsServiceRef.current!.getLogByName(logName, 5);

            // Check for nested data structure and unwrap if needed
            logEntries.forEach(entry => {
              if (entry.data && entry.data.data && typeof entry.data.data === 'object') {
                // This is the old nested structure, unwrap it
                console.log('Dashboard: Unwrapping nested data structure');
                entry.data = entry.data.data;
              }
            });
            setLogs(logEntries);


            setLoading(false);
          } catch (serviceError) {
            console.error('Dashboard: Service fallback failed:', serviceError);
            setError(serviceError);
            setLoading(false);
          }
        } else {
          // No logs found
          setLogs([]);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError(error);

        // Set empty values on error
        setLogs([]);
        setLogNames([]);
      } finally {
        // Always set loading to false, regardless of success or failure
        console.log('Dashboard: Setting loading state to false');
        setLoading(false);
        // Clear the timeout
        clearTimeout(timeoutId);
      }
    } catch (outerErr) {
      // This is a fallback in case of unexpected errors
      console.error('Unexpected error in fetchLogs:', outerErr);
      setError(outerErr);
      console.log('Dashboard: Setting loading state to false (outer catch)');
      setLoading(false); // Ensure loading is set to false
      setLogs([]);
      setLogNames([]); // Also clear log names
    }
  }, []);

  // Load log data on component mount
  useEffect(() => {
    console.log('DashboardController: Component mounted, fetching logs');
    fetchLogs();

    // Add a timeout to check if we're still loading after 5 seconds
    const timeoutId = setTimeout(() => {
      if (loadingRef.current) {
        console.log('DashboardController: Still loading after 5 seconds, possible infinite loading');
        // Force loading to false
        setLoading(false);
        loadingRef.current = false;

        // Only set an error if no logs have been loaded
        if (logsRef.current.length === 0) {
          setError(new Error('Loading timed out. Please try again.'));
        }
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [fetchLogs]);

  return (
    <div className="space-y-8">
      <StatsPanel />
      <RecentLogs logs={logs} isLoading={loading} error={error} onRetry={fetchLogs} />
    </div>
  );
}
