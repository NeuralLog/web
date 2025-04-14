#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Run Next.js dev server with the correct source directory
const nextDev = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
  },
  cwd: path.resolve(__dirname),
});

// Handle process exit
nextDev.on('close', (code) => {
  process.exit(code);
});

// Handle process errors
nextDev.on('error', (err) => {
  console.error('Failed to start Next.js dev server:', err);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
});
