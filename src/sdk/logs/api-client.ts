/**
 * Logs Service API Client
 */

import {
  LogEntry,
  LogNamesResponse,
  LogResponse,
  LogSearchOptions,
  LogSearchResponse,
  AggregateStatisticsResponse,
  LogStatisticsResponse
} from './types';
import { exchangeToken } from '@/services/tokenExchangeService';

/**
 * Logs service API client options
 */
export interface LogsApiClientOptions {
  /**
   * Logs service API URL
   */
  apiUrl: string;

  /**
   * API key for logs service
   */
  apiKey?: string;

  /**
   * Auth0 token for authentication
   */
  auth0Token?: string;

  /**
   * Tenant ID
   */
  tenantId: string;
}

/**
 * Logs service API client
 */
export class LogsApiClient {
  private apiUrl: string;
  private apiKey?: string;
  private auth0Token?: string;
  private tenantId: string;
  private serverToken?: string;

  constructor(options: LogsApiClientOptions) {
    this.apiUrl = options.apiUrl;
    this.apiKey = options.apiKey;
    this.auth0Token = options.auth0Token;
    this.tenantId = options.tenantId;
  }

  /**
   * Set the tenant ID
   */
  public setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  /**
   * Set the API URL
   */
  public setApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl;
  }

  /**
   * Set the Auth0 token
   */
  public setAuth0Token(token: string): void {
    this.auth0Token = token;
    // Clear the server token so it will be refreshed on the next request
    this.serverToken = undefined;
  }

  /**
   * Make an API request to the logs service
   */
  private async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    // IMPORTANT: The logs server does NOT use the /api prefix
    // The correct endpoint is directly at /logs
    const directUrl = `${this.apiUrl}${endpoint}`;
    console.log(`Making API request to: ${directUrl}`);
    return await this.makeRequest<T>(directUrl, method, body);
  }

  /**
   * Make an HTTP request
   */
  private async makeRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
    };

    // If we have an Auth0 token, exchange it for a server token
    if (this.auth0Token && !this.serverToken) {
      try {
        this.serverToken = await exchangeToken(this.auth0Token, this.tenantId);
      } catch (error) {
        console.error('Failed to exchange token:', error);
      }
    }

    // Add authorization header if we have a server token
    if (this.serverToken) {
      headers['Authorization'] = `Bearer ${this.serverToken}`;
    }
    // Fall back to API key if no server token
    else if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      console.log(`Fetching ${method} ${url}`);
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        // Remove CORS settings as they might be causing issues
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Request failed: ${response.status} ${response.statusText}`);
        console.error(`Response body: ${errorText}`);
        throw new Error(`Logs service request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Request succeeded with data:`, data);
      return data;
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get all logs
   */
  public async getLogs(): Promise<LogNamesResponse> {
    return this.apiRequest<LogNamesResponse>('/logs');
  }

  /**
   * Get a log by name
   */
  public async getLogByName(logName: string, limit?: number): Promise<LogResponse> {
    const queryParams = limit ? `?limit=${limit}` : '';
    return this.apiRequest<LogResponse>(`/logs/${logName}${queryParams}`);
  }

  /**
   * Get a log entry by ID
   */
  public async getLogEntryById(logName: string, logId: string): Promise<LogEntry> {
    return this.apiRequest<LogEntry>(`/logs/${logName}/${logId}`);
  }

  /**
   * Overwrite a log (clear and add new entries)
   */
  public async overwriteLog(logName: string, entries: any[]): Promise<void> {
    return this.apiRequest<void>(`/logs/${logName}`, 'POST', entries);
  }

  /**
   * Append to a log
   */
  public async appendToLog(logName: string, entries: any[]): Promise<void> {
    return this.apiRequest<void>(`/logs/${logName}`, 'PATCH', entries);
  }

  /**
   * Update a log entry by ID
   */
  public async updateLogEntryById(logName: string, logId: string, entry: any): Promise<void> {
    return this.apiRequest<void>(`/logs/${logName}/${logId}`, 'POST', entry);
  }

  /**
   * Delete a log entry by ID
   */
  public async deleteLogEntryById(logName: string, logId: string): Promise<void> {
    return this.apiRequest<void>(`/logs/${logName}/${logId}`, 'DELETE');
  }

  /**
   * Clear a log
   */
  public async clearLog(logName: string): Promise<void> {
    return this.apiRequest<void>(`/logs/${logName}`, 'DELETE');
  }

  /**
   * Search logs
   */
  public async searchLogs(options: LogSearchOptions): Promise<LogSearchResponse> {
    // Convert options to query parameters
    const params = new URLSearchParams();

    if (options.query) {
      params.append('query', options.query);
    }

    if (options.logName) {
      params.append('logName', options.logName);
    }

    if (options.startTime) {
      params.append('startTime', options.startTime);
    }

    if (options.endTime) {
      params.append('endTime', options.endTime);
    }

    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    if (options.fieldFilters) {
      for (const [key, value] of Object.entries(options.fieldFilters)) {
        params.append(`field.${key}`, JSON.stringify(value));
      }
    }

    return this.apiRequest<LogSearchResponse>(`/search?${params.toString()}`);
  }

  /**
   * Get aggregate statistics for all logs
   */
  public async getAggregateStatistics(): Promise<AggregateStatisticsResponse> {
    return this.apiRequest<AggregateStatisticsResponse>('/statistics');
  }

  /**
   * Get statistics for a specific log
   */
  public async getLogStatistics(logName: string): Promise<LogStatisticsResponse> {
    return this.apiRequest<LogStatisticsResponse>(`/logs/${logName}/statistics`);
  }
}
