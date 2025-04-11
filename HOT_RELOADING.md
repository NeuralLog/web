# Hot Reloading in Docker for Next.js Development

This document explains how to use hot reloading with Docker for Next.js development in the NeuralLog project.

## What is Hot Reloading?

Hot reloading allows you to see changes to your code immediately in the browser without having to manually restart the development server. When you save a file, the changes are automatically applied, making development much faster and more efficient.

## Setup for Hot Reloading

We've configured the project to support hot reloading in Docker with the following components:

1. **Dockerfile.dev.hot**: A specialized Dockerfile for development that's optimized for hot reloading
2. **docker-compose.logs.yml**: Updated to use volume mounts that sync your local files with the container
3. **docker-entrypoint.sh**: Modified to handle CSS dependencies more intelligently
4. **next.config.js**: Configured with webpack polling to detect file changes in Docker

## How to Use Hot Reloading

### Starting with Hot Reloading

Run the provided batch file to set up hot reloading:

```bash
hot-reload.bat
```

This script will:
1. Stop any running containers
2. Build and start the web container with hot reloading enabled
3. Set up the necessary volume mounts

### Making Changes

Once the container is running with hot reloading:

1. Edit any source file in your local editor
2. Save the file
3. The changes will be automatically detected and applied
4. Refresh your browser to see the changes (in many cases, this will happen automatically)

### Viewing Logs

To see the logs and watch for any errors:

```bash
docker-compose -f docker-compose.logs.yml logs -f web
```

### Stopping the Container

When you're done developing:

```bash
docker-compose -f docker-compose.logs.yml down
```

## Troubleshooting

### Changes Not Reflecting

If your changes aren't being reflected:

1. Check the logs for any errors:
   ```bash
   docker-compose -f docker-compose.logs.yml logs -f web
   ```

2. Make sure the file you're editing is being properly mounted:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web ls -la /app/path/to/your/file
   ```

3. Try restarting just the web container:
   ```bash
   docker-compose -f docker-compose.logs.yml restart web
   ```

### CSS/Styling Issues

If you're having issues with CSS or styling:

1. Make sure the CSS dependencies are properly installed:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web npm list autoprefixer postcss tailwindcss
   ```

2. Run the CSS fix script manually:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web sh /usr/local/bin/docker-entrypoint.sh
   ```

## How It Works

### Volume Mounts

The key to hot reloading is the volume mounts in docker-compose.logs.yml:

```yaml
volumes:
  - ./:/app
  - /app/node_modules
```

This mounts your local directory to `/app` in the container, but keeps the container's `node_modules` directory separate.

### Webpack Polling

In Docker, the normal file watching mechanism doesn't work well, so we use polling instead:

```javascript
webpackDevMiddleware: (config) => {
  config.watchOptions = {
    poll: 1000, // Check for changes every second
    aggregateTimeout: 300, // Delay before rebuilding
    ignored: ['node_modules/**'],
  };
  return config;
}
```

This tells webpack to check for file changes every second, which enables hot reloading in Docker.
