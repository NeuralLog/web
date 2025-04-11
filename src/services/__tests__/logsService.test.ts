import { LogsService } from '../logsService';
import { LogsApiClient } from '@/sdk/logs/api-client';

// Mock the LogsApiClient
jest.mock('@/sdk/logs/api-client');

describe('LogsService', () => {
  // Test service instance
  let service: LogsService;
  
  // Mocked client instance
  let mockClient: jest.Mocked<LogsApiClient>;
  
  // Sample log data
  const sampleLogEntry = {
    id: 'test-id',
    timestamp: '2023-04-10T14:32:00Z',
    data: { message: 'Test log message' }
  };
  
  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a mock client instance
    mockClient = new LogsApiClient({
      apiUrl: 'http://localhost:3030',
      apiKey: 'test-api-key',
      tenantId: 'test-tenant'
    }) as jest.Mocked<LogsApiClient>;
    
    // Replace the constructor with a mock that returns our mock client
    (LogsApiClient as jest.Mock).mockImplementation(() => mockClient);
    
    // Create a new service instance
    service = new LogsService('test-tenant', 'test-api-key', 'http://localhost:3030');
  });
  
  describe('constructor', () => {
    it('should create a service with the provided options', () => {
      expect(service).toBeInstanceOf(LogsService);
      expect(LogsApiClient).toHaveBeenCalledWith({
        apiUrl: 'http://localhost:3030',
        apiKey: 'test-api-key',
        tenantId: 'test-tenant'
      });
    });
    
    it('should use default API URL if not provided', () => {
      // Create a service without an API URL
      service = new LogsService('test-tenant', 'test-api-key');
      
      // Check that the default API URL was used
      expect(LogsApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          apiUrl: expect.any(String)
        })
      );
    });
  });
  
  describe('setTenantId', () => {
    it('should update the tenant ID on the client', () => {
      // Setup the mock
      mockClient.setTenantId = jest.fn();
      
      // Call the method
      service.setTenantId('new-tenant');
      
      // Check that the client method was called
      expect(mockClient.setTenantId).toHaveBeenCalledWith('new-tenant');
    });
  });
  
  describe('getLogNames', () => {
    it('should return log names from the client', async () => {
      // Setup the mock
      mockClient.getLogs = jest.fn().mockResolvedValue({
        logNames: ['log1', 'log2']
      });
      
      // Call the method
      const result = await service.getLogNames();
      
      // Check the result
      expect(result).toEqual(['log1', 'log2']);
      expect(mockClient.getLogs).toHaveBeenCalled();
    });
  });
  
  describe('getLogByName', () => {
    it('should return log entries from the client', async () => {
      // Setup the mock
      mockClient.getLogByName = jest.fn().mockResolvedValue({
        logName: 'test-log',
        entries: [sampleLogEntry]
      });
      
      // Call the method
      const result = await service.getLogByName('test-log');
      
      // Check the result
      expect(result).toEqual([sampleLogEntry]);
      expect(mockClient.getLogByName).toHaveBeenCalledWith('test-log', undefined);
    });
    
    it('should pass limit parameter to the client', async () => {
      // Setup the mock
      mockClient.getLogByName = jest.fn().mockResolvedValue({
        logName: 'test-log',
        entries: [sampleLogEntry]
      });
      
      // Call the method with a limit
      await service.getLogByName('test-log', 10);
      
      // Check that the limit was passed to the client
      expect(mockClient.getLogByName).toHaveBeenCalledWith('test-log', 10);
    });
  });
  
  describe('getLogEntryById', () => {
    it('should return a log entry from the client', async () => {
      // Setup the mock
      mockClient.getLogEntryById = jest.fn().mockResolvedValue(sampleLogEntry);
      
      // Call the method
      const result = await service.getLogEntryById('test-log', 'test-id');
      
      // Check the result
      expect(result).toEqual(sampleLogEntry);
      expect(mockClient.getLogEntryById).toHaveBeenCalledWith('test-log', 'test-id');
    });
  });
  
  describe('createOrOverwriteLog', () => {
    it('should call overwriteLog on the client', async () => {
      // Setup the mock
      mockClient.overwriteLog = jest.fn().mockResolvedValue(undefined);
      
      // Call the method
      const entries = [{ message: 'Test log message' }];
      await service.createOrOverwriteLog('test-log', entries);
      
      // Check that the client method was called
      expect(mockClient.overwriteLog).toHaveBeenCalledWith('test-log', entries);
    });
  });
  
  describe('appendToLog', () => {
    it('should call appendToLog on the client', async () => {
      // Setup the mock
      mockClient.appendToLog = jest.fn().mockResolvedValue(undefined);
      
      // Call the method
      const entries = [{ message: 'Test log message' }];
      await service.appendToLog('test-log', entries);
      
      // Check that the client method was called
      expect(mockClient.appendToLog).toHaveBeenCalledWith('test-log', entries);
    });
  });
  
  describe('updateLogEntry', () => {
    it('should call updateLogEntryById on the client', async () => {
      // Setup the mock
      mockClient.updateLogEntryById = jest.fn().mockResolvedValue(undefined);
      
      // Call the method
      const entry = { message: 'Updated log message' };
      await service.updateLogEntry('test-log', 'test-id', entry);
      
      // Check that the client method was called
      expect(mockClient.updateLogEntryById).toHaveBeenCalledWith('test-log', 'test-id', entry);
    });
  });
  
  describe('deleteLogEntry', () => {
    it('should call deleteLogEntryById on the client', async () => {
      // Setup the mock
      mockClient.deleteLogEntryById = jest.fn().mockResolvedValue(undefined);
      
      // Call the method
      await service.deleteLogEntry('test-log', 'test-id');
      
      // Check that the client method was called
      expect(mockClient.deleteLogEntryById).toHaveBeenCalledWith('test-log', 'test-id');
    });
  });
  
  describe('clearLog', () => {
    it('should call clearLog on the client', async () => {
      // Setup the mock
      mockClient.clearLog = jest.fn().mockResolvedValue(undefined);
      
      // Call the method
      await service.clearLog('test-log');
      
      // Check that the client method was called
      expect(mockClient.clearLog).toHaveBeenCalledWith('test-log');
    });
  });
  
  describe('searchLogs', () => {
    it('should transform search results from the client', async () => {
      // Setup the mock
      mockClient.searchLogs = jest.fn().mockResolvedValue({
        results: [
          {
            logName: 'test-log',
            entry: sampleLogEntry
          }
        ],
        total: 1
      });
      
      // Call the method
      const searchOptions = { query: 'test' };
      const result = await service.searchLogs(searchOptions);
      
      // Check the result
      expect(result).toEqual([sampleLogEntry]);
      expect(mockClient.searchLogs).toHaveBeenCalledWith(searchOptions);
    });
    
    it('should handle empty search results', async () => {
      // Setup the mock
      mockClient.searchLogs = jest.fn().mockResolvedValue({
        results: [],
        total: 0
      });
      
      // Call the method
      const result = await service.searchLogs({});
      
      // Check the result
      expect(result).toEqual([]);
    });
  });
});
