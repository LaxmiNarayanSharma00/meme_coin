
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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