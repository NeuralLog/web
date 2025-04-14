// 'use client'; // Removed to make it a Server Component

import React from 'react'; // Removed client-side hooks
import { LogsService } from '../../../services/logsService'; // Use relative path
// import { Button } from '@/components/ui/Button'; // Module not found - Commented out
// import { ErrorState, EmptyState, LoadingState } from '@/components/ui/ErrorState'; // Module not found - Commented out
import Link from 'next/link';
// import LogNameLink from '@/components/links/LogNameLink'; // Module not found - Commented out
// import { useAuth } from '@/context/AuthContext'; // Removed useAuth

// Server Component - fetch data directly
async function getLogNamesData() {
  // Note: Assumes LogsService constructor doesn't rely on client-side context
  // and that the /api/logs route reads the httpOnly cookie for auth.
  // Tenant ID might need to be read from headers/context if applicable server-side.
  const logsService = new LogsService('default'); // Or get tenantId appropriately
  try {
    console.log('Fetching log names (Server Component)');
    const names = await logsService.getLogNames();
    console.log(`Received ${names.length} log names (Server Component)`);
    return { logNames: names, error: null };
  } catch (err) {
    console.error('Error fetching log names (Server Component):', err);
    return { logNames: [], error: err };
  }
}

export default async function LogsIndexPage() {
  // Fetch data on the server
  const { logNames, error } = await getLogNamesData();

  // Refresh logic needs rethinking for Server Components (e.g., router.refresh())
  // const handleRefresh = () => { ... };
  // Stray brace removed

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs</h1>
        {/* <Button
          // onClick={handleRefresh} // Client-side refresh removed
          disabled={true} // Disable refresh for now
          variant="outline"
        >
          Refresh (Disabled)
        </Button> */}
        <button disabled={true}>Refresh (Disabled)</button> {/* Basic button */}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4">
          {/* <ErrorState
            error={error instanceof Error ? error : new Error(String(error))}
            // onRetry={fetchLogNames} // Client-side retry removed
          /> */}
          <div className="text-red-500">Error loading logs: {error instanceof Error ? error.message : String(error)}</div>
        </div>
      )}

      {/* Log list */}
      {/* Server components render directly, no explicit loading state needed here unless using Suspense */}
      {!error && (
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
                  {/* <EmptyState message="No logs found" /> */}
                  <p>No logs found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logNames.map((logName) => (
                    <li key={logName}>
                      <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            {/* <LogNameLink logName={logName} className="text-lg font-medium truncate"> */}
                            <Link href={`/logs/${logName}`} className="text-lg font-medium truncate text-blue-600 hover:underline">
                              {logName}
                            {/* </LogNameLink> */}
                            </Link>
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
