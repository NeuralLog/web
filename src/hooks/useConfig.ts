import { useMemo } from 'react';

/**
 * Configuration from environment variables
 */
interface Config {
  /**
   * Auth service URL
   */
  authUrl: string;
  
  /**
   * Logs service URL
   */
  logsUrl: string;
  
  /**
   * Tenant ID
   */
  tenantId: string;
  
  /**
   * Registry URL
   */
  registryUrl?: string;
}

/**
 * Hook to access configuration from environment variables
 * 
 * @returns Configuration object
 */
export const useConfig = (): Config => {
  return useMemo(() => {
    // Get environment variables
    const authUrl = process.env.REACT_APP_AUTH_URL || 'http://localhost:3000';
    const logsUrl = process.env.REACT_APP_LOGS_URL || 'http://localhost:3030';
    const tenantId = process.env.REACT_APP_TENANT_ID || '';
    const registryUrl = process.env.REACT_APP_REGISTRY_URL;
    
    if (!tenantId) {
      console.warn('REACT_APP_TENANT_ID is not set. Please set it in your environment variables.');
    }
    
    return {
      authUrl,
      logsUrl,
      tenantId,
      registryUrl
    };
  }, []);
};
