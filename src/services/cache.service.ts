
import redisClient from '../config/redis';
import { UnifiedToken } from '../interfaces/token.interface';


export class CacheService {

    private readonly DEFAULT_TTL_SECONDS = 30; 
    private readonly KEY_PREFIX = 'tokens:';

    /**

     * @param query 
     * @returns 
     */
    private getKey(query: string): string {
        return `${this.KEY_PREFIX}${query.toLowerCase().replace(/\s/g, '-')}`;
    }

    /**

     * @param query 
     * @returns 
     */
    async get(query: string): Promise<UnifiedToken[] | null> {
        const key = this.getKey(query);
        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {

                return JSON.parse(cachedData) as UnifiedToken[];
            }
            return null; 
        } catch (error) {
            console.error(`[Cache Error] Failed to retrieve key ${key}:`, error);
            return null;
        }
    }

    /**

     * @param query 
     * @param tokens 
     * @param ttlSeconds 
     */
    async set(query: string, tokens: UnifiedToken[], ttlSeconds?: number): Promise<void> {
        const key = this.getKey(query);
        const ttl = ttlSeconds || this.DEFAULT_TTL_SECONDS;
        try {

            const dataToCache = JSON.stringify(tokens);

            await redisClient.setex(key, ttl, dataToCache); 
            console.log(`[Cache] Set key ${key} with TTL ${ttl}s`);
        } catch (error) {
            console.error(`[Cache Error] Failed to set key ${key}:`, error);
        }
    }
}