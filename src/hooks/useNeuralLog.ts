/**
 * React hook for using the NeuralLogClient in the web application
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getNeuralLogClient, 
  initializeWithApiKey, 
  initializeWithCredentials, 
  logout as logoutClient,
  isAuthenticated as checkIsAuthenticated,
  tryInitializeWithStoredApiKey
} from '../utils/neurallog-client';
import { LogEntry, LogOptions, SearchOptions } from '@neurallog/client-sdk';

/**
 * NeuralLog hook result
 */
interface UseNeuralLogResult {
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

/**
 * NeuralLog hook
 * 
 * @returns NeuralLog hook result
 */
export function useNeuralLog(): UseNeuralLogResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Try to initialize with stored API key on mount
  useEffect(() => {
    async function initialize() {
      try {
        const success = await tryInitializeWithStoredApiKey();
        setIsAuthenticated(success);
      } catch (error) {
        console.error('Error initializing with stored API key:', error);
        setError('Failed to initialize with stored API key');
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
  }, []);
  
  // Login with username and password
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await initializeWithCredentials(username, password);
      setIsAuthenticated(success);
      
      if (!success) {
        setError('Invalid username or password');
      }
      
      return success;
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Login with API key
  const loginWithApiKey = useCallback(async (apiKey: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await initializeWithApiKey(apiKey);
      setIsAuthenticated(success);
      
      if (!success) {
        setError('Invalid API key');
      }
      
      return success;
    } catch (error) {
      console.error('API key login error:', error);
      setError('An error occurred during API key login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logoutClient();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create API key
  const createApiKey = useCallback(async (name: string, scopes?: string[]): Promise<string> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      return await client.createApiKey(name, scopes);
    } catch (error) {
      console.error('Create API key error:', error);
      setError('An error occurred while creating an API key');
      throw error;
    }
  }, []);
  
  // List API keys
  const listApiKeys = useCallback(async (): Promise<any[]> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      return await client.listApiKeys();
    } catch (error) {
      console.error('List API keys error:', error);
      setError('An error occurred while listing API keys');
      throw error;
    }
  }, []);
  
  // Revoke API key
  const revokeApiKey = useCallback(async (keyId: string): Promise<void> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      await client.revokeApiKey(keyId);
    } catch (error) {
      console.error('Revoke API key error:', error);
      setError('An error occurred while revoking an API key');
      throw error;
    }
  }, []);
  
  // Log data
  const log = useCallback(async (logName: string, data: any): Promise<string> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      return await client.log(logName, data);
    } catch (error) {
      console.error('Log error:', error);
      setError('An error occurred while logging data');
      throw error;
    }
  }, []);
  
  // Get logs
  const getLogs = useCallback(async (logName: string, options?: LogOptions): Promise<LogEntry[]> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      return await client.getLogs(logName, options);
    } catch (error) {
      console.error('Get logs error:', error);
      setError('An error occurred while getting logs');
      throw error;
    }
  }, []);
  
  // Search logs
  const searchLogs = useCallback(async (logName: string, options: SearchOptions): Promise<LogEntry[]> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      return await client.searchLogs(logName, options);
    } catch (error) {
      console.error('Search logs error:', error);
      setError('An error occurred while searching logs');
      throw error;
    }
  }, []);
  
  // Get log names
  const getLogNames = useCallback(async (): Promise<string[]> => {
    setError(null);
    
    try {
      const client = getNeuralLogClient();
      return await client.getLogNames();
    } catch (error) {
      console.error('Get log names error:', error);
      setError('An error occurred while getting log names');
      throw error;
    }
  }, []);
  
  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithApiKey,
    logout,
    createApiKey,
    listApiKeys,
    revokeApiKey,
    log,
    getLogs,
    searchLogs,
    getLogNames
  };
}
