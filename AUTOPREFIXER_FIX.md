# Fixing the Autoprefixer Error in Next.js Docker Container

This guide provides multiple solutions to fix the "Cannot find module 'autoprefixer'" error in Next.js running in a Docker container.

## Node.js Version Requirement

The latest version of npm (11.3.0) requires Node.js 20.17.0 or higher. Our Docker container now uses Node.js 22 to ensure compatibility with the latest npm version.

## Quick Fix (Windows)

For Windows users, we've created batch files that automate the fix:

```
rebuild-container.bat  # Uses the original Node.js 18 setup
rebuild-node22.bat     # Uses Node.js 22 (recommended)
```

Just double-click one of these files and follow the prompts. This will rebuild the container with our entrypoint script that automatically fixes the CSS dependencies on startup. We recommend using `rebuild-node22.bat` as it uses Node.js 22, which is compatible with the latest npm version.

## Solution 1: Clean Rebuild (Recommended)

The most reliable solution is to completely rebuild the container:

```bash
npm run docker:clean-rebuild
```

This script:
1. Stops and removes all containers
2. Removes all related Docker images
3. Cleans the Docker system
4. Rebuilds with the minimal Dockerfile that includes autoprefixer fixes
5. Starts the containers

## Solution 2: Direct Fix

If you don't want to rebuild, you can apply a direct fix to the Next.js code:

```bash
npm run docker:direct-fix
```

This script:
1. Modifies the Next.js require hook to handle the autoprefixer module
2. Creates a mock autoprefixer implementation
3. Allows Next.js to continue without the actual autoprefixer module

After running this, restart the Next.js server:

```bash
docker-compose -f docker-compose.logs.yml restart web
```

## Solution 3: Manual Installation

If the above solutions don't work, you can try manually installing autoprefixer:

```bash
docker-compose -f docker-compose.logs.yml exec web npm install -g autoprefixer postcss tailwindcss
docker-compose -f docker-compose.logs.yml exec web npm install --no-save autoprefixer postcss tailwindcss
```

## Understanding the Issue

The issue occurs because Next.js expects autoprefixer to be available, but it's not properly installed or accessible in the Docker container. This can happen for several reasons:

1. **Node.js Module Resolution**: The way Node.js resolves modules in Docker can be different from local development
2. **Dependency Installation**: npm might not install all dependencies correctly in Docker
3. **File Permissions**: There might be permission issues with the node_modules directory
4. **Symlinks**: Symlinks might not be created correctly in Docker

## The Entrypoint Script Solution

Our solution uses a Docker entrypoint script (`docker-entrypoint.sh`) that runs every time the container starts. This ensures that the CSS dependencies are properly installed and configured, even if the container is restarted.

The entrypoint script:

1. Installs the necessary CSS dependencies (autoprefixer, postcss, tailwindcss)
2. Creates the required symlinks
3. Sets up a mock autoprefixer module if needed
4. Verifies that everything is properly installed

```bash
#!/bin/sh
set -e

# Install CSS dependencies
echo "Installing CSS dependencies..."
npm install --no-save autoprefixer postcss tailwindcss

# Create node_modules/.bin directory if it doesn't exist
echo "Creating node_modules/.bin directory if it doesn't exist..."
mkdir -p node_modules/.bin

# Create symlinks for binaries
echo "Creating symlinks for binaries..."
if [ -f "node_modules/autoprefixer/bin/autoprefixer" ]; then
  ln -sf ../autoprefixer/bin/autoprefixer node_modules/.bin/autoprefixer
fi

# ... more code ...

# Run the original command
exec "$@"
```

## The Dockerfile Solution

Our `Dockerfile.css-fix` addresses these issues by:

1. Installing autoprefixer globally and locally
2. Creating necessary symlinks
3. Running a fix script before starting the application

```dockerfile
FROM node:18-alpine

# Install necessary build tools
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install CSS dependencies globally to ensure they're available
RUN npm install -g autoprefixer postcss tailwindcss

# Copy the rest of the application
COPY . .

# Create a script to fix CSS dependencies at runtime
RUN echo '#!/bin/sh\n\
npm install -g autoprefixer postcss tailwindcss\n\
npm install --no-save autoprefixer postcss tailwindcss\n\
mkdir -p node_modules/.bin\n\
ln -sf $(npm root -g)/autoprefixer/bin/autoprefixer node_modules/.bin/autoprefixer\n\
ln -sf $(npm root -g)/postcss/bin/postcss node_modules/.bin/postcss\n\
ln -sf $(npm root -g)/tailwindcss/lib/cli.js node_modules/.bin/tailwindcss\n\
echo "CSS dependencies fixed!"\n\
' > /usr/local/bin/fix-css-deps && chmod +x /usr/local/bin/fix-css-deps

# Run the fix script before starting the application
CMD ["/bin/sh", "-c", "fix-css-deps && npm run dev"]
```

## The Direct Fix Solution

Our direct fix modifies the Next.js require hook to handle the autoprefixer module:

```javascript
// Modify the file to handle autoprefixer
const modified = content.replace(
  'function getResolve() {',
  `// AUTOPREFIXER FIX
function getResolve() {
  // Handle autoprefixer specially
  const originalResolve = require.resolve;
  require.resolve = function(request, options) {
    if (request === 'autoprefixer') {
      try {
        return originalResolve(request, options);
      } catch (e) {
        console.warn('Autoprefixer not found, using mock implementation');
        return require.resolve('./autoprefixer-mock.js');
      }
    }
    return originalResolve(request, options);
  };`
);
```

This allows Next.js to continue even if autoprefixer is not available.

## Troubleshooting

If you still encounter issues:

1. Check Docker logs:
   ```bash
   npm run docker:logs:logs
   ```

2. Try running the fix script manually:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web fix-css-deps
   ```

3. Check if autoprefixer is installed:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web npm list autoprefixer
   ```

4. Try a completely fresh start:
   ```bash
   docker-compose -f docker-compose.logs.yml down -v
   docker system prune -a
   npm run docker:clean-rebuild
   ```
