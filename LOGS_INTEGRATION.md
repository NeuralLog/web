# NeuralLog Logs Server Integration

This document describes how the NeuralLog web application integrates with the logs server.

## Overview

The NeuralLog web application integrates with the logs server to provide a comprehensive logging solution. The logs server provides a RESTful API for storing and retrieving logs, while the web application provides a user interface for viewing and managing logs.

## Architecture

The integration follows a client-server architecture:

1. **Logs Server**: A Node.js server that provides a RESTful API for log management
2. **Web Application**: A Next.js application that provides a user interface for interacting with the logs server
3. **Logs API Client**: A TypeScript client for interacting with the logs server API
4. **Logs Service**: A service layer that provides business logic for interacting with the logs API

## Components

### Logs API Client

The logs API client (`src/sdk/logs/api-client.ts`) provides a TypeScript interface for interacting with the logs server API. It handles authentication, request formatting, and error handling.

```typescript
// Example usage
const client = new LogsApiClient({
  apiUrl: 'http://localhost:3030',
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id'
});

// Get all logs
const logs = await client.getLogs();
```

### Logs Service

The logs service (`src/services/logsService.ts`) provides a higher-level interface for interacting with the logs API. It handles business logic and provides a more user-friendly interface.

```typescript
// Example usage
const service = new LogsService('your-tenant-id', 'your-api-key');

// Get all log names
const logNames = await service.getLogNames();

// Get log entries
const entries = await service.getLogByName('your-log-name');
```

### Logs Page

The logs page (`src/app/dashboard/logs/page.tsx`) provides a user interface for viewing and managing logs. It uses the logs service to interact with the logs server.

## Docker Compose Integration

The logs server is integrated into the Docker Compose configuration to provide a complete development environment. The `docker-compose.logs.yml` file includes the logs server and its dependencies.

To start the development environment with the logs server:

```bash
npm run docker:logs:up
```

To stop the development environment:

```bash
npm run docker:logs:down
```

## Environment Variables

The following environment variables are used for the logs server integration:

- `NEXT_PUBLIC_LOGS_SERVICE_API_URL`: The URL of the logs server API (default: `http://localhost:3030`)
- `TENANT_ID`: The tenant ID to use for the logs server (default: `default`)

## API Endpoints

The logs server provides the following API endpoints:

- `GET /api/logs`: Get all logs
- `GET /api/logs/:logName`: Get a log by name
- `POST /api/logs/:logName`: Overwrite a log
- `PATCH /api/logs/:logName`: Append to a log
- `DELETE /api/logs/:logName`: Clear a log
- `GET /api/logs/:logName/:logId`: Get a log entry by ID
- `POST /api/logs/:logName/:logId`: Update a log entry by ID
- `DELETE /api/logs/:logName/:logId`: Delete a log entry by ID
- `GET /api/search`: Search logs

## Future Improvements

- Add WebSocket support for real-time log streaming
- Implement log visualization and analytics
- Add support for log retention policies
- Implement log export functionality
