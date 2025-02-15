import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  legacyMode: false
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

await redisClient.connect();

// Helper functions for caching
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('Redis Parse Error:', parseError);
      return data; // Return raw data if parsing fails
    }
  } catch (error) {
    console.error('Redis Get Error:', error);
    return null;
  }
};

export const setCache = async (key, value, expireTime = 3600) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.set(key, stringValue);
    if (expireTime > 0) {
      await redisClient.expire(key, expireTime);
    }
    console.log(`Cached: ${key}`); // Debug log
    return true;
  } catch (error) {
    console.error('Redis Set Error:', error);
    return false;
  }
};

export const deleteCache = async (key) => {
  try {
    const result = await redisClient.del(key);
    console.log(`Deleted: ${key}, Result: ${result}`); // Debug log
    return result > 0;
  } catch (error) {
    console.error('Redis Delete Error:', error);
    return false;
  }
};

export const clearCache = async () => {
  try {
    await redisClient.flushAll();
    console.log('Cache cleared'); // Debug log
    return true;
  } catch (error) {
    console.error('Redis Clear Error:', error);
    return false;
  }
};

export default redisClient; 