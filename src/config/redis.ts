// src/config/redis.ts
import Redis from 'ioredis';

// Create a new Redis instance. ioredis automatically handles connection pooling and reconnection.
// It will look for the REDIS_URL in the environment variables.
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Export an async function to confirm connection
export const connectRedis = async () => {
    return new Promise<void>((resolve, reject) => {
        redisClient.on('error', (err) => {
            console.error('Redis Error:', err);
            reject(err);
        });

        redisClient.on('ready', () => {
            resolve();
        });
    });
};

export default redisClient;