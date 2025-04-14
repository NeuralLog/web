/**
 * Log viewer component
 */

import React, { useState, useEffect } from 'react';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';
import { LogEntry } from '@neurallog/client-sdk';

/**
 * Log viewer props
 */
interface LogViewerProps {
  /**
   * Initial log name
   */
  initialLogName?: string;
}

/**
 * Log viewer component
 * 
 * @param props Component props
 * @returns Component JSX
 */
export function LogViewer({ initialLogName }: LogViewerProps): JSX.Element {
  const { getLogNames, getLogs, searchLogs } = useNeuralLogContext();
  
  const [logNames, setLogNames] = useState<string[]>([]);
  const [selectedLogName, setSelectedLogName] = useState<string | null>(initialLogName || null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(50);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // Load log names on mount
  useEffect(() => {
    loadLogNames();
  }, []);
  
  // Load logs when selected log name changes
  useEffect(() => {
    if (selectedLogName) {
      loadLogs();
    }
  }, [selectedLogName, limit, order]);
  
  /**
   * Load log names
   */
  const loadLogNames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const names = await getLogNames();
      setLogNames(names);
      
      if (!selectedLogName && names.length > 0) {
        setSelectedLogName(names[0]);
      }
    } catch (error) {
      console.error('Error loading log names:', error);
      setError('Failed to load log names');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load logs
   */
  const loadLogs = async () => {
    if (!selectedLogName) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const logEntries = await getLogs(selectedLogName, {
        limit,
        order
      });
      
      setLogs(logEntries);
    } catch (error) {
      console.error('Error loading logs:', error);
      setError('Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle search
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLogName || !searchQuery) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchLogs(selectedLogName, {
        query: searchQuery,
        limit,
        order
      });
      
      setLogs(searchResults);
    } catch (error) {
      console.error('Error searching logs:', error);
      setError('Failed to search logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Format log data
   */
  const formatLogData = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };
  
  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Log Viewer</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Log selection and controls */}
      <div className="flex flex-wrap mb-4 gap-4">
        {/* Log selector */}
        <div className="w-full md:w-auto">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logName">
            Log Name
          </label>
          <select
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
            id="logName"
            value={selectedLogName || ''}
            onChange={(e) => setSelectedLogName(e.target.value)}
            disabled={isLoading || logNames.length === 0}
          >
            {logNames.length === 0 ? (
              <option value="">No logs available</option>
            ) : (
              logNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* Limit selector */}
        <div className="w-full md:w-auto">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="limit">
            Limit
          </label>
          <select
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
        
        {/* Order selector */}
        <div className="w-full md:w-auto">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order">
            Order
          </label>
          <select
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
            id="order"
            value={order}
            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            disabled={isLoading}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        
        {/* Refresh button */}
        <div className="w-full md:w-auto flex items-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={loadLogs}
            disabled={isLoading || !selectedLogName}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-wrap gap-2">
          <div className="flex-grow">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading || !selectedLogName}
            />
          </div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isLoading || !selectedLogName || !searchQuery}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Logs */}
      <div>
        <h3 className="text-xl font-bold mb-4">
          {selectedLogName ? `Logs: ${selectedLogName}` : 'Select a log'}
        </h3>
        
        {isLoading ? (
          <p>Loading logs...</p>
        ) : !selectedLogName ? (
          <p>Select a log to view entries</p>
        ) : logs.length === 0 ? (
          <p>No logs found</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">ID: {log.id}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                  {formatLogData(log.data)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
