# Docker Dependencies for Next.js

This document explains how to handle dependencies for Next.js in Docker containers, particularly for CSS-related dependencies like autoprefixer and postcss.

## Common Issues

When running Next.js in Docker, you might encounter the following error:

```
Error: Cannot find module 'autoprefixer'
```

This happens because Next.js requires certain CSS-related dependencies to be available, even if they're listed in your package.json.

## Solution

We've implemented several solutions to fix this issue:

### 1. Updated Dockerfile.dev

The `Dockerfile.dev.new` file includes explicit installation of the required dependencies:

```dockerfile
FROM node:18-alpine

# Install necessary build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@latest
RUN npm ci

# Explicitly install CSS-related dependencies
RUN npm install --save-dev autoprefixer postcss tailwindcss

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode with webpack
CMD ["npm", "run", "dev"]
```

### 2. Fix Dependencies Script

We've created a script to fix dependencies in an existing container:

```javascript
// scripts/fix-dependencies.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Install CSS-related dependencies
execSync('npm install --save-dev autoprefixer postcss tailwindcss', { stdio: 'inherit' });
```

You can run this script with:

```bash
npm run docker:fix-deps
```

## How to Fix the Issue

If you encounter the "Cannot find module 'autoprefixer'" error, you have two options:

### Option 1: Rebuild the Container

1. Stop the container:
   ```bash
   npm run docker:logs:down
   ```

2. Start the container with the new Dockerfile:
   ```bash
   npm run docker:logs:up
   ```

### Option 2: Fix Dependencies in the Running Container

1. Run the fix dependencies script:
   ```bash
   npm run docker:fix-deps
   ```

2. Restart the Next.js server inside the container:
   ```bash
   docker-compose exec web npm run dev
   ```

## Preventing the Issue

To prevent this issue in the future:

1. Always use the `Dockerfile.dev.new` for development
2. Make sure your `postcss.config.js` and `tailwind.config.js` files are properly configured
3. Explicitly install CSS-related dependencies in your Dockerfile

## Required Dependencies

The following dependencies are required for Next.js CSS processing:

- autoprefixer
- postcss
- tailwindcss

Make sure these are installed both in your local environment and in the Docker container.
