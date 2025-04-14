import { exchangeTokenForResource, getAuthToken } from './tokenExchangeService';

// Direct logs server URL
const LOGS_SERVER_URL = process.env.NEXT_PUBLIC_LOGS_SERVER_URL || 'http://localhost:3030';

export class DirectLogsService {
  private tenantId: string;

  constructor(tenantId: string = 'default') {
    this.tenantId = tenantId;
  }

  /**
   * Get all log names directly from the logs server
   */
  public async getLogNames(): Promise<string[]> {
    try {
      // Get the auth token
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      // Exchange the auth token for a resource-specific token
      const resourceToken = await exchangeTokenForResource(
        authToken,
        'logs:all',
        this.tenantId
      );
      
      // Use the resource token to access the logs server directly
      const response = await fetch(`${LOGS_SERVER_URL}/logs`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
          'Authorization': `Bearer ${resourceToken}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get logs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.logs && Array.isArray(data.logs)) {
        return data.logs;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting log names:', error);
      throw error;
    }
  }

  /**
   * Get log entries directly from the logs server
   */
  public async getLogEntries(logName: string, limit?: number): Promise<any[]> {
    try {
      // Get the auth token
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      // Exchange the auth token for a resource-specific token
      const resourceToken = await exchangeTokenForResource(
        authToken,
        `log:${logName}`,
        this.tenantId
      );
      
      // Use the resource token to access the logs server directly
      const queryParams = limit ? `?limit=${limit}` : '';
      const response = await fetch(`${LOGS_SERVER_URL}/logs/${logName}${queryParams}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
          'Authorization': `Bearer ${resourceToken}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get log entries: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.entries && Array.isArray(data.entries)) {
        return data.entries;
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting log entries for ${logName}:`, error);
      throw error;
    }
  }

  /**
   * Search logs directly from the logs server
   */
  public async searchLogs(logName: string, query: string, limit?: number): Promise<any[]> {
    try {
      // Get the auth token
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      // Exchange the auth token for a resource-specific token
      const resourceToken = await exchangeTokenForResource(
        authToken,
        `log:${logName}:search`,
        this.tenantId
      );
      
      // Use the resource token to access the logs server directly
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('query', query);
      if (limit) queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${LOGS_SERVER_URL}/logs/${logName}/search?${queryParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
          'Authorization': `Bearer ${resourceToken}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search logs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      }
      
      return [];
    } catch (error) {
      console.error(`Error searching logs for ${logName}:`, error);
      throw error;
    }
  }
}
