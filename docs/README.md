# NeuralLog Web Documentation

Welcome to the NeuralLog Web documentation. This documentation provides detailed information about the NeuralLog web application, which serves as the user interface for the NeuralLog zero-knowledge logging system.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Zero-Knowledge Implementation](#zero-knowledge-implementation)
- [Data Retention](#data-retention)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

NeuralLog Web is a Next.js application that provides a user-friendly interface for viewing and managing logs while maintaining the zero-knowledge architecture. It ensures that all sensitive data is encrypted client-side before being sent to the server, and decrypted client-side when retrieved.

Key features:
- Viewing and searching logs with client-side decryption
- Managing API keys
- Configuring Key Encryption Keys (KEKs)
- Setting data retention policies
- User management and authentication
- Zero-knowledge architecture implementation

## Architecture

The NeuralLog Web application follows a client-side rendering architecture using Next.js. It communicates with the NeuralLog backend services (auth, logs) through secure APIs and implements the zero-knowledge architecture by performing all cryptographic operations client-side.

### Key Components

1. **Next.js Application**: The main web application built with Next.js
2. **TypeScript Client SDK**: The `@neurallog/client-sdk` package that provides client-side encryption and API communication
3. **Auth Service Integration**: Integration with the NeuralLog Auth service for authentication and authorization
4. **Logs Service Integration**: Integration with the NeuralLog Logs service for log management

### Data Flow

1. **Authentication**: The user authenticates with the Auth service
2. **Key Initialization**: The client initializes the key hierarchy using a master secret
3. **Log Retrieval**: The client retrieves encrypted logs from the Logs service
4. **Client-Side Decryption**: The client decrypts the logs using the key hierarchy
5. **Log Search**: The client generates search tokens and sends them to the Logs service
6. **Search Results Decryption**: The client decrypts the search results using the key hierarchy

## Components

The NeuralLog Web application is organized into several key components:

### Crypto Components

- **CryptoProvider**: Provides the cryptographic context for the application
- **MasterSecretInput**: Allows users to input their master secret for key hierarchy initialization
- **ClientCryptoProvider**: Client-side version of the CryptoProvider for use in client components

### Log Components

- **ClientSideLogViewer**: Displays logs with client-side decryption
- **ClientSideLogSearch**: Searches logs with client-side decryption
- **LogSelector**: Allows users to select a log to view or search

### Dashboard Components

- **ZeroKnowledgeDashboard**: Main dashboard component that integrates log viewing and searching
- **RecentLogs**: Displays recent logs on the dashboard

### Services

- **DirectLogsService**: Service for direct communication with the Logs service
- **TokenExchangeService**: Service for exchanging authentication tokens for resource-specific tokens

## Zero-Knowledge Implementation

The NeuralLog Web application implements a zero-knowledge architecture where:

1. **Client-Side Encryption**: All sensitive data is encrypted client-side before being sent to the server
2. **Client-Side Decryption**: All encrypted data is decrypted client-side after being retrieved from the server
3. **Key Hierarchy**: A hierarchical key system is used to derive encryption keys for different purposes
4. **Searchable Encryption**: Search tokens are generated client-side to enable searching encrypted data
5. **No Server-Side Secrets**: The server never has access to encryption keys or plaintext data

### Key Hierarchy

The key hierarchy is implemented as follows:

1. **Master Secret**: The root secret used to derive all other keys
2. **Tenant ID**: Combined with the master secret to create tenant-specific keys
3. **Log Encryption Keys**: Derived from the master secret and tenant ID for each log
4. **Search Keys**: Derived from the master secret and tenant ID for searchable encryption

## Data Retention

NeuralLog implements a comprehensive data retention policy system that allows tenants to control how long their log data is stored. This feature is fully integrated with the zero-knowledge architecture, ensuring that log names remain encrypted and private.

### Key Features

- **Default Tenant Policy**: Set a default retention period for all logs in a tenant
- **Per-Log Policies**: Configure specific retention periods for individual logs
- **Automatic Cleanup**: Expired log entries are automatically deleted based on retention policies
- **Impact Analysis**: Check how many log entries would be affected by a policy change before applying it

### User Interface

The NeuralLog Web application provides a user-friendly interface for managing retention policies in the Settings section:

1. **Default Policy Management**: View and update the default retention policy for all logs
2. **Log-Specific Policy Management**: Set, update, and delete retention policies for specific logs
3. **Impact Analysis**: Check the impact of policy changes before applying them

### Implementation

The data retention system is implemented with these key components:

1. **Client-Side Encryption**: Log names in retention policies are encrypted client-side
2. **Metadata Storage**: Minimal metadata about log entries is stored for retention enforcement
3. **Purge Mechanism**: A scheduled job runs periodically to delete expired log entries

For detailed information about the data retention system, see the [Data Retention](./data-retention.md) documentation.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Access to NeuralLog backend services (auth, logs)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NeuralLog/web.git
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to configure your environment.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure

```
web/
├── public/                # Static assets
├── src/                   # Source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   │   ├── crypto/        # Cryptographic components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── logs/          # Log components
│   │   └── ui/            # UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # React hooks
│   ├── services/          # Service layer
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── docs/                  # Documentation
├── tests/                 # Tests
└── package.json           # Package configuration
```

### Development Workflow

1. Make changes to the source code
2. Run tests to ensure everything works:
   ```bash
   npm test
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to see your changes

### Docker Development

For development with Docker:

1. Use the provided Docker Compose configuration:
   ```bash
   docker-compose -f docker-compose.logs.yml up -d
   ```

2. For hot reloading, use the provided script:
   ```bash
   ./hot-reload.bat
   ```

## Deployment

### Vercel Deployment

The NeuralLog Web application is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy the application

### Docker Deployment

For Docker deployment:

1. Build the Docker image:
   ```bash
   docker build -t neurallog-web .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 neurallog-web
   ```

## Troubleshooting

### Common Issues

#### CSS Issues in Docker

If you encounter CSS issues in Docker, use the provided fix script:

```bash
./fix-css-windows.bat
```

#### Authentication Issues

If you encounter authentication issues:

1. Check that the Auth service is running and accessible
2. Verify that your environment variables are correctly configured
3. Clear your browser's local storage and try again

#### Decryption Issues

If you encounter decryption issues:

1. Verify that you have entered the correct master secret
2. Check that the logs were encrypted with the same key hierarchy
3. Clear your browser's local storage and try again

### Getting Help

If you need help with the NeuralLog Web application, please:

1. Check the documentation
2. Look for similar issues in the GitHub repository
3. Open a new issue if you can't find a solution
