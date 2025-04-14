'use client';

import React, { useState } from 'react';
import { useCrypto } from '../crypto/CryptoProvider';
import { DirectLogsService } from '@/services/directLogsService';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MasterSecretInput } from '../crypto/MasterSecretInput';

interface ClientSideLogSearchProps {
  logName: string;
  limit?: number;
}

export const ClientSideLogSearch: React.FC<ClientSideLogSearchProps> = ({
  logName,
  limit = 100,
}) => {
  const { isInitialized, decryptData, tenantId } = useCrypto();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [decryptedResults, setDecryptedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!isInitialized) {
      setError(new Error('Crypto provider not initialized'));
      return;
    }

    if (!query.trim()) {
      setError(new Error('Please enter a search query'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Create a direct logs service
      const logsService = new DirectLogsService(tenantId);

      // Search logs directly from the logs server
      const searchResults = await logsService.searchLogs(logName, query, limit);
      setResults(searchResults);

      // Decrypt search results client-side
      const decrypted = await Promise.all(
        searchResults.map(async (entry) => {
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
            console.error(`Error decrypting search result ${entry.id}:`, decryptError);

            // Return the original entry if decryption fails
            return {
              ...entry,
              _decryptError: decryptError.message,
            };
          }
        })
      );

      setDecryptedResults(decrypted);
      setLoading(false);
    } catch (searchError) {
      console.error('Error searching logs:', searchError);
      setError(searchError instanceof Error ? searchError : new Error(String(searchError)));
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search logs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Spinner /> : 'Search'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {hasSearched && !loading && decryptedResults.length === 0 && (
        <Alert>
          <AlertTitle>No results</AlertTitle>
          <AlertDescription>No results found for "{query}" in {logName}.</AlertDescription>
        </Alert>
      )}

      {decryptedResults.length > 0 && (
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
              {decryptedResults.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
