'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link
import { useCrypto } from '@/components/crypto/CryptoProvider';
import { DirectLogsService } from '@/services/directLogsService';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MasterSecretInput } from '@/components/crypto/MasterSecretInput';

interface ClientSideLogViewerProps {
  logName: string;
  limit?: number;
}

export const ClientSideLogViewer: React.FC<ClientSideLogViewerProps> = ({
  logName,
  limit = 100,
}) => {
  const { isInitialized, decryptData, tenantId } = useCrypto();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [decryptedLogs, setDecryptedLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      if (!isInitialized) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create a direct logs service
        const logsService = new DirectLogsService(tenantId);

        // Fetch logs directly from the logs server
        const entries = await logsService.getLogEntries(logName, limit);
        setLogs(entries);

        // Decrypt logs client-side
        const decrypted = await Promise.all(
          entries.map(async (entry) => {
            try {
              // Decrypt the log entry
              const decryptedData = await decryptData(entry.data, logName);

              // Return a new entry with decrypted data
              return {
                ...entry,
                data: decryptedData,
                _decrypted: true,
              };
            } catch (decryptError) {
              console.error(`Error decrypting log entry ${entry.id}:`, decryptError);

              // Return the original entry if decryption fails
              return {
                ...entry,
                _decryptError: decryptError.message,
              };
            }
          })
        );

        setDecryptedLogs(decrypted);
        setLoading(false);
      } catch (fetchError) {
        console.error('Error fetching logs:', fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        setLoading(false);
      }
    }

    fetchLogs();
  }, [logName, limit, isInitialized, decryptData, tenantId]);

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zero-Knowledge Encryption Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <MasterSecretInput />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (decryptedLogs.length === 0) {
    return (
      <Alert>
        <AlertTitle>No logs found</AlertTitle>
        <AlertDescription>No log entries were found for {logName}.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Log: {logName}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">Timestamp</th>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            {decryptedLogs.map((log) => (
              <Link key={log.id} href={`/logs/${logName}/${log.id}`} passHref legacyBehavior>
                <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer">
                  <td className="p-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">{log.id}</td>
                  <td className="p-2">
                    {log._decryptError ? (
                      <span className="text-red-500">Decryption error: {log._decryptError}</span>
                    ) : (
                      <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        {typeof log.data === 'object'
                          ? JSON.stringify(log.data, null, 2)
                          : String(log.data)}
                      </pre>
                    )}
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
