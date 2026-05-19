const { createClient } = require('redis');

let redisClient;
let redisConnectPromise;

const getRedisUrl = () => process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const getRedisClient = async () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: getRedisUrl(),
      socket: {
        connectTimeout: 1000,
        reconnectStrategy: () => false
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });
  }

  if (!redisClient.isOpen) {
    if (!redisConnectPromise) {
      redisConnectPromise = redisClient.connect().finally(() => {
        redisConnectPromise = null;
      });
    }

    await redisConnectPromise;
  }

  return redisClient;
};

const safeRedisGet = async (key) => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }
    return await client.get(key);
  } catch (err) {
    console.error('Redis GET failed:', err.message);
    return null;
  }
};

const safeRedisSet = async (key, value, ttlSeconds) => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return;
    }
    await client.set(key, value, { EX: ttlSeconds });
  } catch (err) {
    console.error('Redis SET failed:', err.message);
  }
};

const safeRedisDel = async (key) => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return;
    }
    await client.del(key);
  } catch (err) {
    console.error('Redis DEL failed:', err.message);
  }
};

module.exports = {
  getRedisClient,
  safeRedisGet,
  safeRedisSet,
  safeRedisDel
};