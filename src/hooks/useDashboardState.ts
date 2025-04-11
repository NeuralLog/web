import { useState, useEffect, useCallback } from 'react';
import { LogEntry } from '@/sdk/logs/types';

export interface DashboardStats {
  totalLogs: number;
  successRate: number;
  avgLatency: number;
  activeModels: number;
}

export interface DashboardState {
  logs: LogEntry[];
  logNames: string[];
  loading: boolean;
  error: unknown | null;
  stats: DashboardStats;
}

export interface DashboardActions {
  fetchLogs: () => Promise<void>;
  retryFetch: () => Promise<void>;
}

/**
 * Custom hook for managing dashboard state
 */
export function useDashboardState(): [DashboardState, DashboardActions] {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logNames, setLogNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalLogs: 0,
    successRate: 0,
    avgLatency: 0,
    activeModels: 0
  });

  // Calculate stats from log entries
  const calculateStats = useCallback((logEntries: LogEntry[]) => {
    if (logEntries.length === 0) {
      setStats({
        totalLogs: 0,
        successRate: 0,
        avgLatency: 0,
        activeModels: 0
      });
      return;
    }

    // Extract models and calculate success rate
    const models = new Set<string>();
    let successCount = 0;
    let totalLatency = 0;

    logEntries.forEach(entry => {
      // Extract model from data if available
      if (entry.data?.model) {
        models.add(entry.data.model);
      }

      // Count successes
      if (entry.data?.status === 'success') {
        successCount++;
      }

      // Sum latencies
      if (entry.data?.latency) {
        totalLatency += entry.data.latency;
      }
    });

    setStats({
      totalLogs: logEntries.length,
      successRate: logEntries.length > 0 ? (successCount / logEntries.length) * 100 : 0,
      avgLatency: logEntries.length > 0 ? Math.round(totalLatency / logEntries.length) : 0,
      activeModels: models.size
    });
  }, []);

  // Fetch logs data
  const fetchLogs = useCallback(async () => {
    console.log('useDashboardState: fetchLogs called');
    try {
      // Start with loading state, clear any previous errors
      setLoading(true);
      setError(null);
      
      // Set a timeout to force loading to false after 3 seconds
      const timeoutId = setTimeout(() => {
        console.log('useDashboardState: Force setting loading state to false after timeout');
        setLoading(false);
      }, 3000);

      // Set default empty values in case of error
      const emptyStats = {
        totalLogs: 0,
        successRate: 0,
        avgLatency: 0,
        activeModels: 0
      };

      try {
        // Get all log names
        const namesResponse = await fetch('/api/logs', {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!namesResponse.ok) {
          throw new Error(`HTTP error! status: ${namesResponse.status}`);
        }
        
        const namesData = await namesResponse.json();
        
        if (!namesData.logs || !Array.isArray(namesData.logs)) {
          throw new Error('Invalid response format for log names');
        }
        
        const names = namesData.logs;
        setLogNames(names);
        console.log('useDashboardState: Log names:', names);

        // Get logs from the fixed-log if available, otherwise use the first log
        const logName = names.includes('fixed-log') ? 'fixed-log' : names[0];
        if (logName) {
          console.log('useDashboardState: Using log:', logName);
          
          // Use direct fetch for better performance
          const logResponse = await fetch(`/api/logs/${logName}?limit=5`, {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!logResponse.ok) {
            throw new Error(`HTTP error! status: ${logResponse.status}`);
          }
          
          const logData = await logResponse.json();
          
          if (logData.entries && Array.isArray(logData.entries)) {
            const entries = logData.entries;
            
            // Process entries to handle nested data structure
            const processedEntries = entries.map(entry => {
              if (entry.data && entry.data.data && typeof entry.data.data === 'object') {
                // This is the old nested structure, unwrap it
                return {
                  ...entry,
                  data: entry.data.data
                };
              }
              return entry;
            });
            
            setLogs(processedEntries);
            calculateStats(processedEntries);
          } else {
            // No entries found
            setLogs([]);
            setStats(emptyStats);
          }
        } else {
          // No logs found
          setLogs([]);
          setStats(emptyStats);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError(error);
        
        // Set empty values on error
        setLogs([]);
        setLogNames([]);
        setStats(emptyStats);
      } finally {
        // Always set loading to false, regardless of success or failure
        clearTimeout(timeoutId);
        setLoading(false);
      }
    } catch (outerErr) {
      // This is a fallback in case of unexpected errors
      console.error('Unexpected error in fetchLogs:', outerErr);
      setError(outerErr);
      setLoading(false); // Ensure loading is set to false
      setLogs([]);
      setLogNames([]); // Also clear log names
      setStats({
        totalLogs: 0,
        successRate: 0,
        avgLatency: 0,
        activeModels: 0
      });
    }
  }, [calculateStats]);

  // Retry fetch (same as fetchLogs but can be called explicitly)
  const retryFetch = useCallback(() => {
    return fetchLogs();
  }, [fetchLogs]);

  // Load log data on component mount
  useEffect(() => {
    console.log('useDashboardState: Initial fetch');
    fetchLogs();
  }, [fetchLogs]);

  return [
    { logs, logNames, loading, error, stats },
    { fetchLogs, retryFetch }
  ];
}
