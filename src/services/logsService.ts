/**
 * Logs Service
 *
 * This service provides methods for interacting with the logs API.
 */

// import { LogsApiClient } from '@/sdk/logs/api-client'; // Module not found, using direct fetch instead
// import { LogEntry, LogSearchOptions } from '@/sdk/logs/types'; // Module not found
// Define types locally if needed, or assume fetch returns correct structure
type LogEntry = any; // Placeholder type
type LogSearchOptions = any; // Placeholder type
import { getAuthToken, exchangeTokenForResource } from './tokenExchangeService';

// Default logs API URL - use our Next.js API routes
const DEFAULT_LOGS_API_URL = '/api';

// Direct logs server URL for resource token access
const LOGS_SERVER_URL = process.env.NEXT_PUBLIC_LOGS_SERVER_URL || 'http://localhost:3030';

/**
 * Logs service
 */
export class LogsService {
  // private client: LogsApiClient; // Removed client usage
  private tenantId: string;
  private apiUrl: string;

  /**
   * Constructor
   *
   * @param tenantId Tenant ID
   * @param apiKey API key
   * @param apiUrl API URL
   * @param auth0Token Auth0 token
   */
  constructor(tenantId: string, apiKey?: string, apiUrl: string = DEFAULT_LOGS_API_URL, auth0Token?: string) {
    this.tenantId = tenantId;
    this.apiUrl = apiUrl;
    // this.client = new LogsApiClient({ // Removed client usage
    //   apiUrl,
    //   apiKey,
    //   auth0Token,
    //   tenantId
    // });
  }

  /**
   * Set the tenant ID
   *
   * @param tenantId Tenant ID
   */
  public setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
    // this.client.setTenantId(tenantId); // Removed client usage
  }

  /**
   * Set the Auth0 token
   *
   * @param token Auth0 token
   */
  public setAuth0Token(token: string): void {
    // this.client.setAuth0Token(token); // Removed client usage
  }

  /**
   * Get all log names
   *
   * @returns Array of log names
   */
  public async getLogNames(): Promise<string[]> {
    try {
      // First try using the API route (which will use the HTTP-only cookie)
      try {
        const response = await fetch('/api/logs', {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': this.tenantId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.logs && Array.isArray(data.logs)) {
            return data.logs;
          }
        }
      } catch (directError) {
        console.warn('API route fetch failed, trying resource token:', directError);
      }

      // If API route fails, try using a resource token to access the logs server directly
      try {
        // Get the auth token from the cookie
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

        if (response.ok) {
          const data = await response.json();
          if (data.logs && Array.isArray(data.logs)) {
            return data.logs;
          }
        }
      } catch (tokenError) {
        console.error('Resource token fetch failed:', tokenError);
      }

      // If all methods fail, return empty array
      console.error('All fetch methods failed for logs');
      return [];
    } catch (error) {
      console.error('Error getting log names:', error);
      return [];
    }
  }

  /**
   * Get a log by name
   *
   * @param logName Log name
   * @param limit Maximum number of entries to return
   * @returns Log entries
   */
  public async getLogByName(logName: string, limit?: number): Promise<LogEntry[]> {
    try {
      // First try using the API route (which will use the HTTP-only cookie)
      try {
        const queryParams = limit ? `?limit=${limit}` : '';
        const response = await fetch(`/api/logs/${logName}${queryParams}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': this.tenantId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.entries && Array.isArray(data.entries)) {
            return data.entries;
          }
        }
      } catch (directError) {
        console.warn(`API route fetch failed for log ${logName}, trying resource token:`, directError);
      }

      // If API route fails, try using a resource token to access the logs server directly
      try {
        // Get the auth token from the cookie
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

        if (response.ok) {
          const data = await response.json();
          if (data.entries && Array.isArray(data.entries)) {
            return data.entries;
          }
        }
      } catch (tokenError) {
        console.error(`Resource token fetch failed for log ${logName}:`, tokenError);
      }

      // If all methods fail, return empty array
      console.error(`All fetch methods failed for log ${logName}`);
      return [];
    } catch (error) {
      console.error(`Error getting log entries for ${logName}:`, error);
      return [];
    }
  }

  /**
   * Get a log entry by ID
   *
   * @param logName Log name
   * @param logId Log entry ID
   * @returns Log entry
   */
  public async getLogEntryById(logName: string, logId: string): Promise<LogEntry> {
    // TODO: Implement direct fetch for getLogEntryById
    console.warn('getLogEntryById not implemented with direct fetch');
    return {} as LogEntry; // Placeholder
  }

  /**
   * Create a new log or overwrite an existing log
   *
   * @param logName Log name
   * @param entries Log entries
   */
  public async createOrOverwriteLog(logName: string, entries: any[]): Promise<void> {
    // TODO: Implement direct fetch for createOrOverwriteLog (likely POST or PUT /api/logs/{logName})
    console.warn('createOrOverwriteLog not implemented with direct fetch');
    return Promise.resolve(); // Placeholder
  }

  /**
   * Append entries to a log
   *
   * @param logName Log name
   * @param entries Log entries
   */
  public async appendToLog(logName: string, entries: any[]): Promise<void> {
    // TODO: Implement direct fetch for appendToLog (likely POST /api/logs/{logName}/append or PATCH)
    console.warn('appendToLog not implemented with direct fetch');
    return Promise.resolve(); // Placeholder
  }

  /**
   * Update a log entry
   *
   * @param logName Log name
   * @param logId Log entry ID
   * @param entry Updated log entry
   */
  public async updateLogEntry(logName: string, logId: string, entry: any): Promise<void> {
    // TODO: Implement direct fetch for updateLogEntry (likely PUT or PATCH /api/logs/{logName}/{logId})
    console.warn('updateLogEntry not implemented with direct fetch');
    return Promise.resolve(); // Placeholder
  }

  /**
   * Delete a log entry
   *
   * @param logName Log name
   * @param logId Log entry ID
   */
  public async deleteLogEntry(logName: string, logId: string): Promise<void> {
    // TODO: Implement direct fetch for deleteLogEntry (likely DELETE /api/logs/{logName}/{logId})
    console.warn('deleteLogEntry not implemented with direct fetch');
    return Promise.resolve(); // Placeholder
  }

  /**
   * Clear a log
   *
   * @param logName Log name
   */
  public async clearLog(logName: string): Promise<void> {
    // TODO: Implement direct fetch for clearLog (likely DELETE /api/logs/{logName})
    console.warn('clearLog not implemented with direct fetch');
    return Promise.resolve(); // Placeholder
  }

  /**
   * Search logs
   *
   * @param options Search options
   * @returns Search results
   */
  public async searchLogs(options: LogSearchOptions): Promise<LogEntry[]> {
    // TODO: Implement direct fetch for searchLogs (likely GET /api/search with options in query/body)
    console.warn('searchLogs not implemented with direct fetch');
    return []; // Placeholder
  }




}
