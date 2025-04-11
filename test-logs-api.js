// Simple script to test the logs API connection
// For Node.js v18+
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLogsApi() {
  console.log('Testing logs API connection...');

  // Try different URL formats to see which one works
  const urls = [
    'http://logs-server:3030/logs',
    'http://logs-server:3030/api/logs',
    'http://localhost:3030/logs',
    'http://localhost:3030/api/logs',
    'http://172.29.0.4:3030/logs',
    'http://172.29.0.4:3030/api/logs'
  ];

  for (const url of urls) {
    try {
      console.log(`Testing URL: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'default'
        }
      });

      const status = response.status;
      console.log(`Status: ${status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`Success! Data:`, JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log(`Failed with status ${status}: ${text}`);
      }
    } catch (error) {
      console.error(`Error with ${url}:`, error.message);
    }
    console.log('-------------------');
  }
}

testLogsApi().catch(err => {
  console.error('Unhandled error:', err);
});
