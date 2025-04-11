import { LogsApiClient } from '../api-client';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

describe('LogsApiClient', () => {
  // Test client instance
  let client: LogsApiClient;
  
  // Default client options
  const defaultOptions = {
    apiUrl: 'http://localhost:3030',
    apiKey: 'test-api-key',
    tenantId: 'test-tenant'
  };
  
  // Sample log data
  const sampleLogEntry = {
    id: 'test-id',
    timestamp: '2023-04-10T14:32:00Z',
    data: { message: 'Test log message' }
  };
  
  // Setup before each test
  beforeEach(() => {
    // Reset fetch mocks
    fetchMock.resetMocks();
    
    // Create a new client instance
    client = new LogsApiClient(defaultOptions);
  });
  
  describe('constructor', () => {
    it('should create a client with the provided options', () => {
      expect(client).toBeInstanceOf(LogsApiClient);
    });
  });
  
  describe('setTenantId', () => {
    it('should update the tenant ID', () => {
      // Set a new tenant ID
      client.setTenantId('new-tenant');
      
      // Make a request to verify the tenant ID is used
      fetchMock.mockResponseOnce(JSON.stringify({ logNames: [] }));
      
      return client.getLogs().then(() => {
        // Check that the tenant ID was included in the request headers
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs',
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'new-tenant'
            })
          })
        );
      });
    });
  });
  
  describe('setApiUrl', () => {
    it('should update the API URL', () => {
      // Set a new API URL
      client.setApiUrl('http://new-api-url.com');
      
      // Make a request to verify the API URL is used
      fetchMock.mockResponseOnce(JSON.stringify({ logNames: [] }));
      
      return client.getLogs().then(() => {
        // Check that the new API URL was used
        expect(fetchMock).toHaveBeenCalledWith(
          'http://new-api-url.com/api/logs',
          expect.any(Object)
        );
      });
    });
  });
  
  describe('getLogs', () => {
    it('should fetch all logs', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({ logNames: ['log1', 'log2'] }));
      
      // Call the method
      return client.getLogs().then(response => {
        // Check the response
        expect(response).toEqual({ logNames: ['log1', 'log2'] });
        
        // Check that the correct endpoint was called
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'X-Tenant-ID': 'test-tenant',
              'X-API-Key': 'test-api-key'
            })
          })
        );
      });
    });
    
    it('should handle errors', () => {
      // Mock an error response
      fetchMock.mockRejectOnce(new Error('Network error'));
      
      // Call the method and expect it to reject
      return expect(client.getLogs()).rejects.toThrow('Network error');
    });
    
    it('should handle non-OK responses', () => {
      // Mock a non-OK response
      fetchMock.mockResponseOnce('Not found', { status: 404 });
      
      // Call the method and expect it to reject
      return expect(client.getLogs()).rejects.toThrow('Logs service request failed: 404');
    });
  });
  
  describe('getLogByName', () => {
    it('should fetch a log by name', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({
        logName: 'test-log',
        entries: [sampleLogEntry]
      }));
      
      // Call the method
      return client.getLogByName('test-log').then(response => {
        // Check the response
        expect(response).toEqual({
          logName: 'test-log',
          entries: [sampleLogEntry]
        });
        
        // Check that the correct endpoint was called
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log',
          expect.any(Object)
        );
      });
    });
    
    it('should include limit parameter if provided', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({
        logName: 'test-log',
        entries: [sampleLogEntry]
      }));
      
      // Call the method with a limit
      return client.getLogByName('test-log', 10).then(() => {
        // Check that the limit parameter was included
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log?limit=10',
          expect.any(Object)
        );
      });
    });
  });
  
  describe('getLogEntryById', () => {
    it('should fetch a log entry by ID', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify(sampleLogEntry));
      
      // Call the method
      return client.getLogEntryById('test-log', 'test-id').then(response => {
        // Check the response
        expect(response).toEqual(sampleLogEntry);
        
        // Check that the correct endpoint was called
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log/test-id',
          expect.any(Object)
        );
      });
    });
  });
  
  describe('overwriteLog', () => {
    it('should overwrite a log', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({}));
      
      // Call the method
      const entries = [{ message: 'Test log message' }];
      return client.overwriteLog('test-log', entries).then(() => {
        // Check that the correct endpoint was called with the correct method and body
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(entries)
          })
        );
      });
    });
  });
  
  describe('appendToLog', () => {
    it('should append to a log', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({}));
      
      // Call the method
      const entries = [{ message: 'Test log message' }];
      return client.appendToLog('test-log', entries).then(() => {
        // Check that the correct endpoint was called with the correct method and body
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(entries)
          })
        );
      });
    });
  });
  
  describe('updateLogEntryById', () => {
    it('should update a log entry by ID', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({}));
      
      // Call the method
      const entry = { message: 'Updated log message' };
      return client.updateLogEntryById('test-log', 'test-id', entry).then(() => {
        // Check that the correct endpoint was called with the correct method and body
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log/test-id',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(entry)
          })
        );
      });
    });
  });
  
  describe('deleteLogEntryById', () => {
    it('should delete a log entry by ID', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({}));
      
      // Call the method
      return client.deleteLogEntryById('test-log', 'test-id').then(() => {
        // Check that the correct endpoint was called with the correct method
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log/test-id',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });
  });
  
  describe('clearLog', () => {
    it('should clear a log', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({}));
      
      // Call the method
      return client.clearLog('test-log').then(() => {
        // Check that the correct endpoint was called with the correct method
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/logs/test-log',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });
  });
  
  describe('searchLogs', () => {
    it('should search logs with query parameters', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({
        results: [
          {
            logName: 'test-log',
            entry: sampleLogEntry
          }
        ],
        total: 1
      }));
      
      // Call the method with search options
      const searchOptions = {
        query: 'test',
        logName: 'test-log',
        startTime: '2023-04-10T00:00:00Z',
        endTime: '2023-04-10T23:59:59Z',
        limit: 10,
        fieldFilters: {
          level: 'error'
        }
      };
      
      return client.searchLogs(searchOptions).then(response => {
        // Check the response
        expect(response).toEqual({
          results: [
            {
              logName: 'test-log',
              entry: sampleLogEntry
            }
          ],
          total: 1
        });
        
        // Check that the correct endpoint was called with the correct query parameters
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('http://localhost:3030/api/search?'),
          expect.any(Object)
        );
        
        // Check that all query parameters were included
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('query=test');
        expect(url).toContain('logName=test-log');
        expect(url).toContain('startTime=2023-04-10T00:00:00Z');
        expect(url).toContain('endTime=2023-04-10T23:59:59Z');
        expect(url).toContain('limit=10');
        expect(url).toContain('field.level=%22error%22');
      });
    });
    
    it('should handle empty search options', () => {
      // Mock the response
      fetchMock.mockResponseOnce(JSON.stringify({
        results: [],
        total: 0
      }));
      
      // Call the method with empty search options
      return client.searchLogs({}).then(() => {
        // Check that the correct endpoint was called with no query parameters
        expect(fetchMock).toHaveBeenCalledWith(
          'http://localhost:3030/api/search?',
          expect.any(Object)
        );
      });
    });
  });
});
