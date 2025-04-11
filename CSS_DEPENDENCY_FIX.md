# Fixing CSS Dependencies in Next.js Docker Container

This guide provides multiple solutions to fix the "Cannot find module 'autoprefixer'" error in Next.js running in a Docker container.

## The Problem

When running Next.js in Docker, you might encounter this error:

```
Error: Cannot find module 'autoprefixer'
Require stack:
- /app/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js
...
```

This happens because Next.js requires certain CSS-related dependencies to be available in the container, even if they're listed in your package.json.

## Solution 1: Rebuild the Container with CSS Fixes

The most reliable solution is to rebuild the container using our CSS-fixed Dockerfile:

```bash
npm run docker:rebuild-css
```

This script:
1. Stops existing containers
2. Removes the existing image
3. Rebuilds with the `Dockerfile.css-fix` that properly installs CSS dependencies
4. Starts the containers

## Solution 2: Fix CSS Dependencies in a Running Container

If you don't want to rebuild the container, you can fix the dependencies in the running container:

```bash
npm run docker:fix-css
```

This script:
1. Installs autoprefixer, postcss, and tailwindcss
2. Creates necessary symlinks
3. Verifies config files exist
4. Checks installations

## Solution 3: Manual Installation

If the above solutions don't work, you can manually install the dependencies:

```bash
docker-compose -f docker-compose.logs.yml exec web sh -c "npm install --no-save autoprefixer postcss tailwindcss"
```

## Verifying the Fix

To verify that the dependencies are properly installed:

```bash
docker-compose -f docker-compose.logs.yml exec web sh -c "npm list autoprefixer postcss tailwindcss"
```

## Understanding the Fix

The `Dockerfile.css-fix` includes these key improvements:

1. **Explicit Installation**: Directly installs CSS dependencies
   ```dockerfile
   RUN npm install --save-dev autoprefixer postcss tailwindcss
   ```

2. **Symlink Creation**: Creates necessary symlinks
   ```dockerfile
   RUN mkdir -p node_modules/.bin && \
       ln -sf ../autoprefixer/bin/autoprefixer node_modules/.bin/autoprefixer
   ```

3. **Config Verification**: Ensures config files exist
   ```dockerfile
   RUN if [ ! -f "postcss.config.js" ]; then \
         echo "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };" > postcss.config.js; \
       fi
   ```

## Preventing Future Issues

To prevent this issue in the future:

1. Always use the `Dockerfile.css-fix` for development
2. Make sure your `postcss.config.js` and `tailwind.config.js` files are properly configured
3. Include CSS dependencies in both `dependencies` and `devDependencies` in package.json

## Troubleshooting

If you still encounter issues:

1. Check if the dependencies are installed:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web sh -c "npm list autoprefixer"
   ```

2. Check if the config files exist:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web sh -c "ls -la postcss.config.js tailwind.config.js"
   ```

3. Try reinstalling node_modules:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web sh -c "rm -rf node_modules && npm install"
   ```

4. Check for permission issues:
   ```bash
   docker-compose -f docker-compose.logs.yml exec web sh -c "ls -la node_modules/.bin"
   ```
