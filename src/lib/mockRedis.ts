// Mock Redis client for client-side rendering
export class MockRedisClient {
  private storage: Record<string, string> = {};

  async get(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async set(key: string, value: string, options?: any): Promise<string> {
    this.storage[key] = value;
    return 'OK';
  }

  async del(key: string): Promise<number> {
    if (this.storage[key]) {
      delete this.storage[key];
      return 1;
    }
    return 0;
  }

  async exists(key: string): Promise<number> {
    return this.storage[key] ? 1 : 0;
  }

  // Add other Redis methods as needed
}

// Export a function to create a namespaced Redis client
export function getNamespacedRedisClient(namespace: string) {
  const client = new MockRedisClient();
  
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
