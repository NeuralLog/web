// This file is only imported on the server side
// It provides a Redis client for server-side operations

// We'll use a dynamic import to avoid client-side errors
let Redis: any;

// Mock Redis client for client-side rendering
const mockRedisClient = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  exists: async () => 0,
  // Add other Redis methods as needed
};

// Function to get a Redis client
export async function getRedisClient() {
  // Check if we're running on the server
  if (typeof window === 'undefined') {
    try {
      // Dynamically import Redis only on the server
      Redis = (await import('ioredis')).default;
      
      const redisOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
        db: parseInt(process.env.REDIS_DB || '0'),
      };
      
      return new Redis(redisOptions);
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      // Return mock client if Redis initialization fails
      return mockRedisClient;
    }
  } else {
    // Return mock client for client-side rendering
    return mockRedisClient;
  }
}

// Export a function to create a namespaced Redis client
export async function getNamespacedRedisClient(namespace: string) {
  const client = await getRedisClient();
  
  // Return a proxy that prefixes all keys with the namespace
  return {
    get: async (key: string) => client.get(`${namespace}:${key}`),
    set: async (key: string, value: string, options?: any) => 
      client.set(`${namespace}:${key}`, value, options),
    del: async (key: string) => client.del(`${namespace}:${key}`),
    exists: async (key: string) => client.exists(`${namespace}:${key}`),
    // Add other Redis methods as needed
  };
}
