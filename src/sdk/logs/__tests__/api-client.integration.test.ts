import { LogsApiClient } from '../api-client';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Create a mock server
const server = setupServer();

describe('LogsApiClient Integration', () => {
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
  
  // Setup before all tests
  beforeAll(() => {
    // Start the mock server
    server.listen();
  });
  
  // Setup before each test
  beforeEach(() => {
    // Reset the mock server handlers
    server.resetHandlers();
    
    // Create a new client instance
    client = new LogsApiClient(defaultOptions);
  });
  
  // Cleanup after all tests
  afterAll(() => {
    // Close the mock server
    server.close();
  });
  
  describe('getLogs', () => {
    it('should fetch all logs', async () => {
      // Setup the mock server handler
      server.use(
        rest.get('http://localhost:3030/api/logs', (req, res, ctx) => {
          // Check request headers
          expect(req.headers.get('x-tenant-id')).toBe('test-tenant');
          expect(req.headers.get('x-api-key')).toBe('test-api-key');
          
          // Return a mock response
          return res(
            ctx.status(200),
            ctx.json({ logNames: ['log1', 'log2'] })
          );
        })
      );
      
      // Call the method
      const response = await client.getLogs();
      
      // Check the response
      expect(response).toEqual({ logNames: ['log1', 'log2'] });
    });
    
    it('should handle server errors', async () => {
      // Setup the mock server handler to return an error
      server.use(
        rest.get('http://localhost:3030/api/logs', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.text('Internal Server Error')
          );
        })
      );
      
      // Call the method and expect it to reject
      await expect(client.getLogs()).rejects.toThrow('Logs service request failed: 500');
    });
  });
  
  describe('getLogByName', () => {
    it('should fetch a log by name', async () => {
      // Setup the mock server handler
      server.use(
        rest.get('http://localhost:3030/api/logs/test-log', (req, res, ctx) => {
          // Return a mock response
          return res(
            ctx.status(200),
            ctx.json({
              logName: 'test-log',
              entries: [sampleLogEntry]
            })
          );
        })
      );
      
      // Call the method
      const response = await client.getLogByName('test-log');
      
      // Check the response
      expect(response).toEqual({
        logName: 'test-log',
        entries: [sampleLogEntry]
      });
    });
    
    it('should include limit parameter if provided', async () => {
      // Setup the mock server handler
      server.use(
        rest.get('http://localhost:3030/api/logs/test-log', (req, res, ctx) => {
          // Check query parameters
          expect(req.url.searchParams.get('limit')).toBe('10');
          
          // Return a mock response
          return res(
            ctx.status(200),
            ctx.json({
              logName: 'test-log',
              entries: [sampleLogEntry]
            })
          );
        })
      );
      
      // Call the method with a limit
      await client.getLogByName('test-log', 10);
    });
  });
  
  describe('overwriteLog', () => {
    it('should overwrite a log', async () => {
      // Setup the mock server handler
      server.use(
        rest.post('http://localhost:3030/api/logs/test-log', async (req, res, ctx) => {
          // Check request body
          const body = await req.json();
          expect(body).toEqual([{ message: 'Test log message' }]);
          
          // Return a mock response
          return res(
            ctx.status(200),
            ctx.json({})
          );
        })
      );
      
      // Call the method
      const entries = [{ message: 'Test log message' }];
      await client.overwriteLog('test-log', entries);
    });
  });
  
  describe('appendToLog', () => {
    it('should append to a log', async () => {
      // Setup the mock server handler
      server.use(
        rest.patch('http://localhost:3030/api/logs/test-log', async (req, res, ctx) => {
          // Check request body
          const body = await req.json();
          expect(body).toEqual([{ message: 'Test log message' }]);
          
          // Return a mock response
          return res(
            ctx.status(200),
            ctx.json({})
          );
        })
      );
      
      // Call the method
      const entries = [{ message: 'Test log message' }];
      await client.appendToLog('test-log', entries);
    });
  });
  
  describe('searchLogs', () => {
    it('should search logs with query parameters', async () => {
      // Setup the mock server handler
      server.use(
        rest.get('http://localhost:3030/api/search', (req, res, ctx) => {
          // Check query parameters
          expect(req.url.searchParams.get('query')).toBe('test');
          expect(req.url.searchParams.get('logName')).toBe('test-log');
          expect(req.url.searchParams.get('startTime')).toBe('2023-04-10T00:00:00Z');
          expect(req.url.searchParams.get('endTime')).toBe('2023-04-10T23:59:59Z');
          expect(req.url.searchParams.get('limit')).toBe('10');
          expect(req.url.searchParams.get('field.level')).toBe('"error"');
          
          // Return a mock response
          return res(
            ctx.status(200),
            ctx.json({
              results: [
                {
                  logName: 'test-log',
                  entry: sampleLogEntry
                }
              ],
              total: 1
            })
          );
        })
      );
      
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
      
      const response = await client.searchLogs(searchOptions);
      
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
    });
  });
});
