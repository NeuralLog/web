/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

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

    return config;
  },
};

module.exports = nextConfig;
