/**
 * NeuralLog context provider for the web application
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useNeuralLog } from '../hooks/useNeuralLog';
import { LogEntry, LogOptions, SearchOptions } from '@neurallog/client-sdk';
import { setCurrentTenantId } from '../utils/neurallog-client';

/**
 * NeuralLog context value
 */
interface NeuralLogContextValue {
  /**
   * Whether the client is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the client is loading
   */
  isLoading: boolean;

  /**
   * Error message
   */
  error: string | null;

  /**
   * Log in with username and password
   */
  login: (username: string, password: string) => Promise<boolean>;

  /**
   * Log in with API key
   */
  loginWithApiKey: (apiKey: string) => Promise<boolean>;

  /**
   * Log out
   */
  logout: () => Promise<void>;

  /**
   * Create a new API key
   */
  createApiKey: (name: string, scopes?: string[]) => Promise<string>;

  /**
   * List API keys
   */
  listApiKeys: () => Promise<any[]>;

  /**
   * Revoke an API key
   */
  revokeApiKey: (keyId: string) => Promise<void>;

  /**
   * Log data
   */
  log: (logName: string, data: any) => Promise<string>;

  /**
   * Get logs
   */
  getLogs: (logName: string, options?: LogOptions) => Promise<LogEntry[]>;

  /**
   * Search logs
   */
  searchLogs: (logName: string, options: SearchOptions) => Promise<LogEntry[]>;

  /**
   * Get log names
   */
  getLogNames: () => Promise<string[]>;
}

// Create context
const NeuralLogContext = createContext<NeuralLogContextValue | undefined>(undefined);

/**
 * NeuralLog context provider props
 */
interface NeuralLogProviderProps {
  /**
   * Children
   */
  children: ReactNode;

  /**
   * Tenant ID
   */
  tenantId?: string;

  /**
   * Registry URL
   */
  registryUrl?: string;

  /**
   * Auth URL (fallback if registry is not available)
   */
  authUrl?: string;

  /**
   * Logs URL (fallback if registry is not available)
   */
  logsUrl?: string;
}

/**
 * NeuralLog context provider
 *
 * @param props Provider props
 * @returns Provider component
 */
export function NeuralLogProvider({
  children,
  tenantId,
  registryUrl,
  authUrl,
  logsUrl
}: NeuralLogProviderProps): JSX.Element {
  // Initialize the client with the provided configuration
  React.useEffect(() => {
    if (tenantId) {
      setCurrentTenantId(tenantId);
    }
  }, [tenantId]);

  // Set the registry, auth, and logs URLs in the environment variables
  React.useEffect(() => {
    if (registryUrl) {
      process.env.NEXT_PUBLIC_REGISTRY_URL = registryUrl;
    }

    if (authUrl) {
      process.env.NEXT_PUBLIC_AUTH_URL = authUrl;
    }

    if (logsUrl) {
      process.env.NEXT_PUBLIC_LOGS_URL = logsUrl;
    }
  }, [registryUrl, authUrl, logsUrl]);

  const neuralLog = useNeuralLog();

  return (
    <NeuralLogContext.Provider value={neuralLog}>
      {children}
    </NeuralLogContext.Provider>
  );
}

/**
 * Use NeuralLog context hook
 *
 * @returns NeuralLog context value
 */
export function useNeuralLogContext(): NeuralLogContextValue {
  const context = useContext(NeuralLogContext);

  if (context === undefined) {
    throw new Error('useNeuralLogContext must be used within a NeuralLogProvider');
  }

  return context;
}
