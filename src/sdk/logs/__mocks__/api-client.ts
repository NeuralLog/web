/**
 * Mock implementation of the LogsApiClient for testing
 */

import { LogsApiClientOptions } from '../api-client';
import { LogEntry, LogNamesResponse, LogResponse, LogSearchOptions, LogSearchResponse } from '../types';

// Sample log data
const sampleLogEntry: LogEntry = {
  id: 'mock-id',
  timestamp: new Date().toISOString(),
  data: { message: 'Mock log message' }
};

// Mock log data store
const mockLogs: Record<string, LogEntry[]> = {
  'mock-log': [sampleLogEntry]
};

/**
 * Mock LogsApiClient implementation
 */
export class LogsApiClient {
  private apiUrl: string;
  private apiKey?: string;
  private tenantId: string;
  
  constructor(options: LogsApiClientOptions) {
    this.apiUrl = options.apiUrl;
    this.apiKey = options.apiKey;
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
   * Get all logs
   */
  public async getLogs(): Promise<LogNamesResponse> {
    return {
      logNames: Object.keys(mockLogs)
    };
  }
  
  /**
   * Get a log by name
   */
  public async getLogByName(logName: string, limit?: number): Promise<LogResponse> {
    const entries = mockLogs[logName] || [];
    return {
      logName,
      entries: limit ? entries.slice(0, limit) : entries
    };
  }
  
  /**
   * Get a log entry by ID
   */
  public async getLogEntryById(logName: string, logId: string): Promise<LogEntry> {
    const entries = mockLogs[logName] || [];
    const entry = entries.find(e => e.id === logId);
    
    if (!entry) {
      throw new Error(`Log entry not found: ${logName}/${logId}`);
    }
    
    return entry;
  }
  
  /**
   * Overwrite a log (clear and add new entries)
   */
  public async overwriteLog(logName: string, entries: any[]): Promise<void> {
    mockLogs[logName] = entries.map((data, index) => ({
      id: `mock-id-${index}`,
      timestamp: new Date().toISOString(),
      data
    }));
  }
  
  /**
   * Append to a log
   */
  public async appendToLog(logName: string, entries: any[]): Promise<void> {
    if (!mockLogs[logName]) {
      mockLogs[logName] = [];
    }
    
    const newEntries = entries.map((data, index) => ({
      id: `mock-id-${mockLogs[logName].length + index}`,
      timestamp: new Date().toISOString(),
      data
    }));
    
    mockLogs[logName] = [...mockLogs[logName], ...newEntries];
  }
  
  /**
   * Update a log entry by ID
   */
  public async updateLogEntryById(logName: string, logId: string, entry: any): Promise<void> {
    if (!mockLogs[logName]) {
      throw new Error(`Log not found: ${logName}`);
    }
    
    const index = mockLogs[logName].findIndex(e => e.id === logId);
    
    if (index === -1) {
      throw new Error(`Log entry not found: ${logName}/${logId}`);
    }
    
    mockLogs[logName][index] = {
      ...mockLogs[logName][index],
      data: entry
    };
  }
  
  /**
   * Delete a log entry by ID
   */
  public async deleteLogEntryById(logName: string, logId: string): Promise<void> {
    if (!mockLogs[logName]) {
      return;
    }
    
    mockLogs[logName] = mockLogs[logName].filter(e => e.id !== logId);
  }
  
  /**
   * Clear a log
   */
  public async clearLog(logName: string): Promise<void> {
    mockLogs[logName] = [];
  }
  
  /**
   * Search logs
   */
  public async searchLogs(options: LogSearchOptions): Promise<LogSearchResponse> {
    const results: { logName: string; entry: LogEntry }[] = [];
    
    // Filter logs by name if provided
    const logNames = options.logName ? [options.logName] : Object.keys(mockLogs);
    
    // Search in each log
    for (const logName of logNames) {
      const entries = mockLogs[logName] || [];
      
      // Filter entries by time range if provided
      let filteredEntries = entries;
      
      if (options.startTime || options.endTime) {
        filteredEntries = filteredEntries.filter(entry => {
          const timestamp = new Date(entry.timestamp).getTime();
          
          if (options.startTime && timestamp < new Date(options.startTime).getTime()) {
            return false;
          }
          
          if (options.endTime && timestamp > new Date(options.endTime).getTime()) {
            return false;
          }
          
          return true;
        });
      }
      
      // Filter entries by query if provided
      if (options.query) {
        const query = options.query.toLowerCase();
        filteredEntries = filteredEntries.filter(entry => {
          return JSON.stringify(entry.data).toLowerCase().includes(query);
        });
      }
      
      // Filter entries by field filters if provided
      if (options.fieldFilters) {
        filteredEntries = filteredEntries.filter(entry => {
          for (const [key, value] of Object.entries(options.fieldFilters || {})) {
            if (entry.data[key] !== value) {
              return false;
            }
          }
          return true;
        });
      }
      
      // Add filtered entries to results
      for (const entry of filteredEntries) {
        results.push({
          logName,
          entry
        });
      }
    }
    
    // Apply limit if provided
    const limitedResults = options.limit ? results.slice(0, options.limit) : results;
    
    return {
      results: limitedResults,
      total: results.length
    };
  }
}
