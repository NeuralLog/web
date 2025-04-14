const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output directory for the build
  distDir: '.next',
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Specify the source directory
  experimental: {
    appDir: true,
  },

  // Disable ESLint during builds to focus on compilation errors first
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds to focus on compilation errors first
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure webpack to handle Node.js modules
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

    // Required for hot reloading in Docker
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
      ignored: ['node_modules/**'],
    };

    // Add @ alias for src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };


    return config;
  },
};

module.exports = nextConfig;
