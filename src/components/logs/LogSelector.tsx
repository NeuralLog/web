'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '../crypto/CryptoProvider';
import { DirectLogsService } from '@/services/directLogsService';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MasterSecretInput } from '../crypto/MasterSecretInput';

interface LogSelectorProps {
  onSelectLog: (logName: string) => void;
  selectedLog?: string;
}

export const LogSelector: React.FC<LogSelectorProps> = ({
  onSelectLog,
  selectedLog,
}) => {
  const { isInitialized, tenantId } = useCrypto();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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
        const logNames = await logsService.getLogNames();
        setLogs(logNames);

        // If we have logs and no selected log, select the first one
        if (logNames.length > 0 && !selectedLog) {
          onSelectLog(logNames[0]);
        }

        setLoading(false);
      } catch (fetchError) {
        console.error('Error fetching logs:', fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        setLoading(false);
      }
    }

    fetchLogs();
  }, [isInitialized, tenantId, onSelectLog, selectedLog]);

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
      <div className="flex items-center space-x-2">
        <Spinner />
        <span>Loading logs...</span>
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

  if (logs.length === 0) {
    return (
      <Alert>
        <AlertTitle>No logs found</AlertTitle>
        <AlertDescription>No logs were found for your tenant.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      value={selectedLog}
      onValueChange={onSelectLog}
    >
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select a log" />
      </SelectTrigger>
      <SelectContent>
        {logs.map((logName) => (
          <SelectItem key={logName} value={logName}>
            {logName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
