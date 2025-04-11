/**
 * Logs Service
 *
 * This service provides methods for interacting with the logs API.
 */

import { LogsApiClient } from '@/sdk/logs/api-client';
import { LogEntry, LogSearchOptions } from '@/sdk/logs/types';
import { AggregateStatistics, LogStatistics } from '@neurallog/shared';
import { useAuthenticatedFetch } from '@/utils/api';

// Default logs API URL - use our Next.js API routes
const DEFAULT_LOGS_API_URL = '/api';

/**
 * Logs service
 */
export class LogsService {
  private client: LogsApiClient;
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
    this.client = new LogsApiClient({
      apiUrl,
      apiKey,
      auth0Token,
      tenantId
    });
  }

  /**
   * Set the tenant ID
   *
   * @param tenantId Tenant ID
   */
  public setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
    this.client.setTenantId(tenantId);
  }

  /**
   * Set the Auth0 token
   *
   * @param token Auth0 token
   */
  public setAuth0Token(token: string): void {
    this.client.setAuth0Token(token);
  }

  /**
   * Get all log names
   *
   * @returns Array of log names
   */
  public async getLogNames(): Promise<string[]> {
    try {
      // Try direct fetch first for better performance
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
        console.warn('Direct fetch failed, falling back to client:', directError);
      }

      // Fall back to client if direct fetch fails
      const response = await this.client.getLogs();
      console.log('LogsService: Log names response:', response);
      // The actual response format is { status: 'success', logs: [] }
      if (response.logs) {
        return response.logs;
      } else if (response.entries) {
        return response.entries;
      }
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
      // Try direct fetch first for better performance
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
        console.warn(`Direct fetch failed for log ${logName}, falling back to client:`, directError);
      }

      // Fall back to client if direct fetch fails
      const response = await this.client.getLogByName(logName, limit);
      console.log(`LogsService: Log entries response for ${logName}:`, response);
      // The actual response format is { status: 'success', name: 'logname', entries: [] }
      if (response.entries) {
        return response.entries;
      } else if (response.logs) {
        return response.logs;
      }
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
    return this.client.getLogEntryById(logName, logId);
  }

  /**
   * Create a new log or overwrite an existing log
   *
   * @param logName Log name
   * @param entries Log entries
   */
  public async createOrOverwriteLog(logName: string, entries: any[]): Promise<void> {
    return this.client.overwriteLog(logName, entries);
  }

  /**
   * Append entries to a log
   *
   * @param logName Log name
   * @param entries Log entries
   */
  public async appendToLog(logName: string, entries: any[]): Promise<void> {
    return this.client.appendToLog(logName, entries);
  }

  /**
   * Update a log entry
   *
   * @param logName Log name
   * @param logId Log entry ID
   * @param entry Updated log entry
   */
  public async updateLogEntry(logName: string, logId: string, entry: any): Promise<void> {
    return this.client.updateLogEntryById(logName, logId, entry);
  }

  /**
   * Delete a log entry
   *
   * @param logName Log name
   * @param logId Log entry ID
   */
  public async deleteLogEntry(logName: string, logId: string): Promise<void> {
    return this.client.deleteLogEntryById(logName, logId);
  }

  /**
   * Clear a log
   *
   * @param logName Log name
   */
  public async clearLog(logName: string): Promise<void> {
    return this.client.clearLog(logName);
  }

  /**
   * Search logs
   *
   * @param options Search options
   * @returns Search results
   */
  public async searchLogs(options: LogSearchOptions): Promise<LogEntry[]> {
    const response = await this.client.searchLogs(options);
    return response.results.map(result => result.entry);
  }

  /**
   * Get aggregate statistics for all logs
   *
   * @returns Aggregate statistics
   */
  public async getAggregateStatistics(): Promise<AggregateStatistics> {
    try {
      // Try direct fetch first for better performance
      try {
        const response = await fetch('/api/statistics', {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': this.tenantId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data as AggregateStatistics;
        }
      } catch (directError) {
        console.warn('Direct fetch failed for statistics, falling back to client:', directError);
      }

      // Fall back to client if direct fetch fails
      const response = await this.client.getAggregateStatistics();
      return response;
    } catch (error) {
      console.error('Error getting aggregate statistics:', error);
      return {
        totalLogs: 0,
        totalEntries: 0,
        logStats: []
      };
    }
  }

  /**
   * Get statistics for a specific log
   *
   * @param logName Log name
   * @returns Log statistics
   */
  public async getLogStatistics(logName: string): Promise<LogStatistics | null> {
    try {
      // Try direct fetch first for better performance
      try {
        const response = await fetch(`/api/logs/${logName}/statistics`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': this.tenantId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data as LogStatistics;
        }
      } catch (directError) {
        console.warn(`Direct fetch failed for log statistics ${logName}, falling back to client:`, directError);
      }

      // Fall back to client if direct fetch fails
      const response = await this.client.getLogStatistics(logName);
      return response;
    } catch (error) {
      console.error(`Error getting log statistics for ${logName}:`, error);
      return null;
    }
  }
}
