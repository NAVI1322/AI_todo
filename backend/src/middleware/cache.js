import { getCache, setCache } from '../config/redis.js';

export const cacheMiddleware = (expireTime = 3600) => {
  return async (req, res, next) => {
    try {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Generate cache key from URL and user ID (if authenticated)
      const userId = req.user?._id || 'anonymous';
      const cacheKey = `${userId}${req.originalUrl}`;
      console.log('\n=== Cache Operation Start ===');
      console.log('Cache Key:', cacheKey);

      // Try to get data from cache
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log('✅ Cache HIT');
        console.log('Cached Value:', JSON.stringify(cachedData, null, 2));
        console.log('=== Cache Operation End ===\n');
        return res.json(cachedData);
      }
      
      console.log('❌ Cache MISS - Will fetch from database');
      console.log('=== Cache Operation End ===\n');

      // Store original res.json function
      const originalJson = res.json;

      // Override res.json to cache the response before sending
      res.json = function(data) {
        // Cache the response data
        setCache(cacheKey, data, expireTime)
          .then(() => {
            console.log('\n=== Cache Save Operation ===');
            console.log('Saved to cache:', cacheKey);
            console.log('Saved value:', JSON.stringify(data, null, 2));
            console.log('=== Cache Save Operation End ===\n');
          })
          .catch(err => console.error('Cache set error:', err));
        
        // Call original res.json with data
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache Middleware Error:', error);
      // Continue without caching in case of error
      next();
    }
  };
}; 