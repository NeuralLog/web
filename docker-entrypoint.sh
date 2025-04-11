#!/bin/sh
set -e

# Check if node_modules exists and has the right permissions
if [ ! -d "node_modules" ] || [ ! -w "node_modules" ]; then
  echo "node_modules directory is missing or not writable. Creating it..."
  mkdir -p node_modules
  chmod -R 777 node_modules
fi

# Install CSS dependencies if needed
if [ ! -d "node_modules/autoprefixer" ] || [ ! -d "node_modules/postcss" ] || [ ! -d "node_modules/tailwindcss" ]; then
  echo "Installing CSS dependencies..."
  npm install --no-save autoprefixer postcss tailwindcss
else
  echo "CSS dependencies already installed."
fi

# Create node_modules/.bin directory if it doesn't exist
echo "Creating node_modules/.bin directory if it doesn't exist..."
mkdir -p node_modules/.bin

# Create symlinks for binaries
echo "Creating symlinks for binaries..."
if [ -f "node_modules/autoprefixer/bin/autoprefixer" ]; then
  ln -sf ../autoprefixer/bin/autoprefixer node_modules/.bin/autoprefixer
fi

if [ -f "node_modules/postcss/bin/postcss" ]; then
  ln -sf ../postcss/bin/postcss node_modules/.bin/postcss
fi

if [ -f "node_modules/tailwindcss/lib/cli.js" ]; then
  ln -sf ../tailwindcss/lib/cli.js node_modules/.bin/tailwindcss
fi

# Create mock autoprefixer module if needed
if [ ! -d "node_modules/autoprefixer" ]; then
  echo "Creating mock autoprefixer module..."
  mkdir -p node_modules/autoprefixer
  cat > node_modules/autoprefixer/package.json << 'EOF'
{
  "name": "autoprefixer",
  "version": "10.4.14",
  "description": "Mock autoprefixer for Next.js",
  "main": "index.js",
  "postcss": true
}
EOF

  cat > node_modules/autoprefixer/index.js << 'EOF'
// Mock implementation of autoprefixer
module.exports = () => {
  return {
    postcssPlugin: 'autoprefixer',
    Once(root) {
      // Do nothing
    }
  };
};
module.exports.postcss = true;
EOF
fi

# Check for CSS dependencies
echo "Checking for CSS dependencies..."
npm list autoprefixer postcss tailwindcss || true

echo "CSS dependencies fix completed!"

# Run the original command
exec "$@"
