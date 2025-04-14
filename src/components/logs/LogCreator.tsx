/**
 * Log creator component
 */

import React, { useState, useEffect } from 'react';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';

/**
 * Log creator props
 */
interface LogCreatorProps {
  /**
   * Initial log name
   */
  initialLogName?: string;
  
  /**
   * Callback for successful log creation
   */
  onSuccess?: () => void;
}

/**
 * Log creator component
 * 
 * @param props Component props
 * @returns Component JSX
 */
export function LogCreator({ initialLogName, onSuccess }: LogCreatorProps): JSX.Element {
  const { getLogNames, log } = useNeuralLogContext();
  
  const [logNames, setLogNames] = useState<string[]>([]);
  const [selectedLogName, setSelectedLogName] = useState<string>(initialLogName || '');
  const [newLogName, setNewLogName] = useState('');
  const [logData, setLogData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreatingNewLog, setIsCreatingNewLog] = useState(!initialLogName);
  
  // Load log names on mount
  useEffect(() => {
    loadLogNames();
  }, []);
  
  /**
   * Load log names
   */
  const loadLogNames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const names = await getLogNames();
      setLogNames(names);
      
      if (!selectedLogName && names.length > 0 && !isCreatingNewLog) {
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
   * Handle log creation
   */
  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const logName = isCreatingNewLog ? newLogName : selectedLogName;
    
    if (!logName || !logData) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Parse log data
      let parsedData;
      
      try {
        parsedData = JSON.parse(logData);
      } catch (error) {
        // If not valid JSON, use as plain text
        parsedData = { message: logData };
      }
      
      // Add timestamp if not present
      if (!parsedData.timestamp) {
        parsedData.timestamp = new Date().toISOString();
      }
      
      // Create log
      const logId = await log(logName, parsedData);
      
      setSuccess(`Log created successfully with ID: ${logId}`);
      setLogData('');
      
      // If creating a new log, add it to the list and select it
      if (isCreatingNewLog && !logNames.includes(newLogName)) {
        setLogNames([...logNames, newLogName]);
        setSelectedLogName(newLogName);
        setNewLogName('');
        setIsCreatingNewLog(false);
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating log:', error);
      setError('Failed to create log');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Toggle between creating a new log and using an existing one
   */
  const toggleCreateNewLog = () => {
    setIsCreatingNewLog(!isCreatingNewLog);
    
    if (!isCreatingNewLog) {
      setSelectedLogName('');
    } else {
      setNewLogName('');
      if (logNames.length > 0) {
        setSelectedLogName(logNames[0]);
      }
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Create Log</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleCreateLog}>
        {/* Toggle between new and existing log */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="existingLog"
              type="radio"
              checked={!isCreatingNewLog}
              onChange={toggleCreateNewLog}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="existingLog" className="ml-2 block text-sm text-gray-700">
              Use existing log
            </label>
          </div>
          <div className="flex items-center mt-2">
            <input
              id="newLog"
              type="radio"
              checked={isCreatingNewLog}
              onChange={toggleCreateNewLog}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="newLog" className="ml-2 block text-sm text-gray-700">
              Create new log
            </label>
          </div>
        </div>
        
        {/* Log selection */}
        {isCreatingNewLog ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newLogName">
              New Log Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newLogName"
              type="text"
              placeholder="my-new-log"
              value={newLogName}
              onChange={(e) => setNewLogName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logName">
              Log Name
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="logName"
              value={selectedLogName}
              onChange={(e) => setSelectedLogName(e.target.value)}
              required
              disabled={isLoading || logNames.length === 0}
            >
              {logNames.length === 0 ? (
                <option value="">No logs available</option>
              ) : (
                <>
                  <option value="">Select a log</option>
                  {logNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}
        
        {/* Log data */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logData">
            Log Data (JSON or plain text)
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
            id="logData"
            rows={10}
            placeholder={`{\n  "level": "info",\n  "message": "User logged in",\n  "userId": "123"\n}`}
            value={logData}
            onChange={(e) => setLogData(e.target.value)}
            required
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter JSON or plain text. If plain text is entered, it will be wrapped in a message field.
          </p>
        </div>
        
        {/* Submit button */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          disabled={isLoading || (!selectedLogName && !newLogName) || !logData}
        >
          {isLoading ? 'Creating...' : 'Create Log'}
        </button>
      </form>
    </div>
  );
}
