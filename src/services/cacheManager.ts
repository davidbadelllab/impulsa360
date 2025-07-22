import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

await client.connect();

export const cacheManager = {
  get: async <T>(key: string): Promise<T | null> => {
    const data = await client.get(key);
    return data ? JSON.parse(data) as T : null;
  },

  set: async (key: string, value: any, ttl?: number): Promise<void> => {
    await client.set(key, JSON.stringify(value));
    if (ttl) {
      await client.expire(key, ttl);
    }
  },

  del: async (key: string): Promise<void> => {
    await client.del(key);
  },

  disconnect: async (): Promise<void> => {
    await client.disconnect();
  }
};
