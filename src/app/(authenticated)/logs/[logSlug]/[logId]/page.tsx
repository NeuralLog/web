'use client';

import React from 'react';
import { useCrypto } from '@/components/crypto/CryptoProvider'; // Added
import { DirectLogsService } from '@/services/directLogsService'; // Added
// import { LogsService } from '@/services/logsService'; // Module resolution issue - Commented out
// import { LogEntry } from '@/sdk/logs/types'; // Module likely doesn't exist
type LogEntry = any; // Placeholder type
// import { formatDate } from '@/utils/date'; // Module resolution issue - Commented out
// Placeholder formatDate
const formatDate = (date: any) => new Date(date).toLocaleString();
// import { Button } from '@/components/ui/Button'; // Module not found - Commented out
// import Link from 'next/link'; // Already imported by default? Check if needed.
// import LogNameLink from '@/components/links/LogNameLink'; // Module not found - Commented out
// import { ErrorState, LoadingState } from '@/components/ui/ErrorState'; // Module not found - Commented out
// import JsonViewer from '@/components/LogDetail/JsonViewer'; // Module not found - Commented out
// Converting back to a Client Component to resolve the TypeScript error
// This is a simpler approach than trying to fix the Server Component type issues
export default function LogDetailPage({
  params
}: {
  params: { logSlug: string; logId: string }
}) {
  // Get the log slug and ID directly from params
  const { logSlug, logId } = params;

  // Client-side state for data fetching
  const [logEntry, setLogEntry] = React.useState<LogEntry | null>(null);
  const [error, setError] = React.useState<unknown | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get crypto context
  const { isInitialized, decryptData, tenantId } = useCrypto();

  // Fetch data on component mount
  React.useEffect(() => {
    async function fetchLogEntry() {
      // Check if crypto is initialized
      if (!isInitialized || !tenantId) {
        console.log('Crypto not initialized or tenantId missing, waiting...');
        setIsLoading(false); // Stop loading indicator if we can't proceed
        setError(new Error('Encryption context not ready. Please ensure the master secret is set.')); // Set an informative error
        return;
      }

      try {
        setIsLoading(true); // Start loading
        setError(null); // Clear previous errors
        console.log(`Fetching encrypted log entries for: ${logSlug}`);

        // Instantiate the service
        const logsService = new DirectLogsService(tenantId);

        // Fetch ENCRYPTED entries for the log slug
        // Assuming getLogEntries fetches all if no limit is provided.
        const encryptedEntries = await logsService.getLogEntries(logSlug);
        console.log(`Fetched ${encryptedEntries.length} entries for ${logSlug}`);

        // Find the specific encrypted entry
        const encryptedEntry = encryptedEntries.find(e => e.id === logId);

        if (encryptedEntry) {
          console.log(`Found encrypted entry for ${logId}`);
          try {
            // Decrypt the data
            console.log(`Attempting decryption for ${logId}...`);
            const decryptedData = await decryptData(encryptedEntry.data, logSlug);
            console.log(`Successfully decrypted data for ${logId}`);

            // Create the final log entry object
            const decryptedEntry = {
              ...encryptedEntry,
              data: decryptedData,
              _decrypted: true, // Add flag for clarity
            };

            setLogEntry(decryptedEntry); // Update state with decrypted entry

          } catch (decryptError) {
            console.error(`Error decrypting log entry ${logId}:`, decryptError);
            setError(new Error(`Failed to decrypt log entry: ${decryptError.message}`));
            // Optionally set entry with error state for display
            setLogEntry({
                ...encryptedEntry,
                data: { error: 'Decryption failed', details: decryptError.message }, // Show error in data field
                _decryptError: decryptError.message
            });
          }
        } else {
          console.error(`Entry not found for ${logId} in log ${logSlug}`);
          setError(new Error(`Log entry with ID ${logId} not found in log ${logSlug}.`));
        }
      } catch (fetchError) {
        console.error(`Error fetching log entries for ${logSlug}:`, fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
      } finally {
        setIsLoading(false); // Stop loading indicator
      }
    }

    fetchLogEntry();
    // Update dependencies
  }, [logSlug, logId, isInitialized, tenantId, decryptData]);

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
  // This function can remain if needed for formatting server-fetched data
  const formatData = (data: any) => {
    if (isJson(data)) {
      // return <JsonViewer data={data} className="max-h-[600px]" />; // Commented out due to import issue
      return <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-[600px]">{JSON.stringify(data, null, 2)}</pre>; // Fallback display
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
              {/* <LogNameLink logName={logSlug} className="inline-flex items-center"> */}
              <a href={`/logs/${logSlug}`} className="inline-flex items-center text-blue-600 hover:underline">
                <span>← Back to {logSlug} logs</span>
              {/* </LogNameLink> */}
              </a>
            </div>
          </div>
          {/* <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back
          </Button> */}
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading log entry...</div>
          </div>
        </div>
      )}

      {/* Error message */}
      {!isLoading && error && (
        <div className="mt-4">
           <div className="text-red-500">Error loading log entry: {error instanceof Error ? error.message : String(error)}</div>
        </div>
      )}

      {/* Log entry details */}
      {!isLoading && !error && logEntry && (
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
            {/* <Button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(logEntry, null, 2));
                alert('Log entry copied to clipboard');
              }}
              variant="outline"
              size="sm"
            >
              Copy Full Entry
            </Button> */}
             {/* Now we can use onClick in a Client Component */}
             <button
               onClick={() => {
                 navigator.clipboard.writeText(JSON.stringify(logEntry, null, 2));
                 alert('Log entry copied to clipboard');
               }}
               className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
             >
               Copy Full Entry
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
