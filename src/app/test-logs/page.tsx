'use client';

import { useState, useEffect, useRef } from 'react';
import { LogsService } from '@/services/logsService';
import { LogEntry } from '@/sdk/logs/types';

export default function TestLogsPage() {
  // Create a stable reference to the LogsService instance
  const logsServiceRef = useRef<LogsService | null>(null);

  // Initialize the LogsService if it doesn't exist
  if (!logsServiceRef.current) {
    logsServiceRef.current = new LogsService('default');
  }

  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [refreshCount, setRefreshCount] = useState(0); // Add a refresh counter

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        setTestResult('Starting test...');

        try {
          // Step 1: Get log names using LogsService
          setTestResult(prev => `${prev}\n1. Getting log names using LogsService`);
          console.log('TestLogs: Fetching log names');

          const logNames = await logsServiceRef.current!.getLogNames();
          console.log('TestLogs: Log names response:', logNames);
          setTestResult(prev => `${prev}\nLog names: ${JSON.stringify(logNames)}`);
          setLogs(logNames);

          // Step 2: Get log entries for the first log
          if (logNames.length > 0) {
            const logName = logNames[0];
            setTestResult(prev => `${prev}\n\n2. Getting log entries for: ${logName}`);
            console.log('TestLogs: Fetching log entries for', logName);

            const entries = await logsServiceRef.current!.getLogByName(logName, 5);
            console.log('TestLogs: Log entries response:', entries);

            if (entries.length > 0) {
              setLogEntries(entries);
              setTestResult(prev => `${prev}\nLog entries found: ${entries.length}`);
              console.log('TestLogs: Setting log entries:', entries);
            } else {
              console.log('TestLogs: No entries found');
              setTestResult(prev => `${prev}\nNo log entries found`);
            }
          } else {
            console.log('TestLogs: No logs found');
            setTestResult(prev => `${prev}\nNo logs found`);
          }
        } catch (serviceError) {
          console.error('TestLogs: LogsService request failed:', serviceError);
          setTestResult(prev => `${prev}\nLogsService request failed: ${serviceError}`);
          setError(serviceError instanceof Error ? serviceError : new Error(String(serviceError)));
        }
      } catch (err) {
        console.error('Error in test:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setTestResult(prev => `${prev}\nUnexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [refreshCount]); // Only include refreshCount in the dependency array

  // Function to manually refresh the logs
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Logs API Test</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh Logs'}
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Results</h2>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{testResult || 'No results yet'}</pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Log Names</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs found</p>
        ) : (
          <ul className="list-disc pl-5">
            {logs.map((log, index) => (
              <li key={index} className="mb-1">{log}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Log Entries</h2>
        {logEntries.length === 0 ? (
          <p className="text-gray-500">No log entries found</p>
        ) : (
          <div>
            <p className="mb-2">Found {logEntries.length} log entries:</p>
            <div className="space-y-4">
              {logEntries.map((entry, index) => (
                <div key={entry.id || index} className="bg-gray-100 p-4 rounded">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <span className="font-semibold">ID:</span> {entry.id}
                    </div>
                    <div>
                      <span className="font-semibold">Name:</span> {entry.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Timestamp:</span> {entry.timestamp}
                    </div>
                    <div>
                      <span className="font-semibold">Model:</span> {entry.data?.model || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span> {entry.data?.status || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Latency:</span> {entry.data?.latency ? `${entry.data.latency}ms` : 'N/A'}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold">Message:</span> {entry.data?.message || 'N/A'}
                  </div>
                  {entry.data?.warnings && entry.data.warnings.length > 0 && (
                    <div className="mt-2">
                      <span className="font-semibold">Warnings:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {entry.data.warnings.map((warning: string, i: number) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
