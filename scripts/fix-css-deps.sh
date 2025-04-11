#!/bin/sh
# Script to fix CSS dependencies in the Docker container

echo "Installing CSS dependencies..."
npm install --no-save autoprefixer postcss tailwindcss

echo "Creating node_modules/.bin directory if it doesn't exist..."
mkdir -p node_modules/.bin

echo "Verifying postcss.config.js..."
if [ ! -f "postcss.config.js" ]; then
  echo "Creating postcss.config.js..."
  cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF
else
  echo "postcss.config.js already exists."
fi

echo "Verifying tailwind.config.js..."
if [ ! -f "tailwind.config.js" ]; then
  echo "Creating tailwind.config.js..."
  npx tailwindcss init
else
  echo "tailwind.config.js already exists."
fi

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

echo "Checking for global installations..."
npm list -g autoprefixer postcss tailwindcss || true

echo "Checking for local installations..."
npm list autoprefixer postcss tailwindcss || true

echo "CSS dependencies fix completed!"
