# Webpack and Turbopack Configuration

This document explains how to configure and use Webpack and Turbopack in the NeuralLog web application.

## Overview

Next.js supports both Webpack and Turbopack as bundlers. Webpack is the default bundler and is more stable, while Turbopack is a newer, faster alternative that's still in development.

## Configuration

The application is configured to use Webpack by default, but you can opt-in to use Turbopack if desired.

### next.config.js

The `next.config.js` file includes configuration for both Webpack and Turbopack:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure webpack when not using Turbopack
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        path: false,
        'node:async_hooks': false,
      };
    }
    return config;
  },
  // Configure experimental features
  experimental: {
    // Disable Turbopack by default
    turbo: process.env.NEXT_TURBO === 'true',
  },
};

module.exports = nextConfig;
```

## Usage

### Development with Webpack (Default)

To start the development server with Webpack:

```bash
npm run dev
```

### Development with Turbopack

To start the development server with Turbopack:

```bash
npm run dev:turbo
```

## Docker Compose

The Docker Compose configuration is set to use Webpack by default. This is controlled by the `NEXT_TURBO` environment variable:

```yaml
environment:
  - NODE_ENV=development
  - NEXT_PUBLIC_AUTH_SERVICE_API_URL=http://localhost:3040
  - NEXT_PUBLIC_AUTH_SERVICE_API_KEY=dev-api-key
  - NEXT_PUBLIC_LOGS_SERVICE_API_URL=http://localhost:3030
  - REDIS_HOST=redis
  - REDIS_PORT=6379
  - REDIS_PASSWORD=
  - REDIS_DB=0
  - TENANT_ID=default
  - NEXT_TURBO=false
```

## Troubleshooting

### Webpack and Turbopack Conflicts

If you encounter errors related to Webpack and Turbopack conflicts, make sure:

1. The `NEXT_TURBO` environment variable is set correctly
2. You're using the appropriate npm script (`dev` for Webpack, `dev:turbo` for Turbopack)
3. The `next.config.js` file has the correct configuration

### Runtime Errors

If you encounter runtime errors when using Turbopack, try switching to Webpack as it's more stable:

```bash
npm run dev
```

### Docker Issues

If you encounter issues when running the application in Docker, make sure the `NEXT_TURBO` environment variable is set to `false` in your Docker Compose file.
