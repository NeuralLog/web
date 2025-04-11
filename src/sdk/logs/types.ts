/**
 * Types for the Logs API
 */

import { AggregateStatistics, LogStatistics } from '@neurallog/shared';

/**
 * Log entry
 */
export interface LogEntry {
  /**
   * Log entry ID
   */
  id: string;

  /**
   * Log entry timestamp
   */
  timestamp: string;

  /**
   * Log entry data
   */
  data: any;
}

/**
 * Log search options
 */
export interface LogSearchOptions {
  /**
   * Search query
   */
  query?: string;

  /**
   * Log name
   */
  logName?: string;

  /**
   * Start time
   */
  startTime?: string;

  /**
   * End time
   */
  endTime?: string;

  /**
   * Field filters
   */
  fieldFilters?: Record<string, any>;

  /**
   * Maximum number of results to return
   */
  limit?: number;
}

/**
 * Log search result
 */
export interface LogSearchResult {
  /**
   * Log name
   */
  logName: string;

  /**
   * Log entry
   */
  entry: LogEntry;
}

/**
 * Log search response
 */
export interface LogSearchResponse {
  /**
   * Search results
   */
  results: LogSearchResult[];

  /**
   * Total number of results
   */
  total: number;
}

/**
 * Log response
 */
export interface LogResponse {
  /**
   * Status
   */
  status: string;

  /**
   * Log name
   */
  name: string;

  /**
   * Log entries
   */
  entries?: LogEntry[];

  /**
   * Logs (alternative field name)
   */
  logs?: LogEntry[];
}

/**
 * Log names response
 */
export interface LogNamesResponse {
  /**
   * Status
   */
  status: string;

  /**
   * Name
   */
  name?: string;

  /**
   * Entries
   */
  entries?: string[];

  /**
   * Logs (alternative field name)
   */
  logs?: string[];
}

/**
 * Aggregate statistics response
 */
export interface AggregateStatisticsResponse extends AggregateStatistics {
  /**
   * Status
   */
  status?: string;
}

/**
 * Log statistics response
 */
export interface LogStatisticsResponse extends LogStatistics {
  /**
   * Status
   */
  status?: string;
}
