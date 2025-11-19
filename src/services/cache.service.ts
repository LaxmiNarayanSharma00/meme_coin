// src/services/cache.service.ts

import redisClient from '../config/redis';
import { UnifiedToken } from '../interfaces/token.interface';

/**
 * Manages caching logic for tokens in Redis.
 * This abstracts the raw Redis commands (SET, GET) from the business logic.
 */
export class CacheService {
    // Configurable TTL (Time-To-Live) for data freshness
    private readonly DEFAULT_TTL_SECONDS = 30; // Core Requirement: default 30s
    private readonly KEY_PREFIX = 'tokens:';

    /**
     * Generates a unique key for the cache entry based on the query.
     * @param query The key (e.g., 'trending', 'sol-search', etc.)
     * @returns The full Redis key.
     */
    private getKey(query: string): string {
        return `${this.KEY_PREFIX}${query.toLowerCase().replace(/\s/g, '-')}`;
    }

    /**
     * Retrieves cached tokens.
     * @param query The identifier for the cache entry.
     * @returns An array of UnifiedToken or null if not found/expired.
     */
    async get(query: string): Promise<UnifiedToken[] | null> {
        const key = this.getKey(query);
        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                // Parse the JSON string back into a JavaScript object
                return JSON.parse(cachedData) as UnifiedToken[];
            }
            return null; // Cache miss
        } catch (error) {
            console.error(`[Cache Error] Failed to retrieve key ${key}:`, error);
            return null;
        }
    }

    /**
     * Stores the token data in the cache with a set TTL.
     * @param query The identifier for the cache entry.
     * @param tokens The array of tokens to cache.
     * @param ttlSeconds Optional custom TTL.
     */
    async set(query: string, tokens: UnifiedToken[], ttlSeconds?: number): Promise<void> {
        const key = this.getKey(query);
        const ttl = ttlSeconds || this.DEFAULT_TTL_SECONDS;
        try {
            // Stringify the object to store it as a string in Redis
            const dataToCache = JSON.stringify(tokens);
            // SETEX command: SET with Expiration time in seconds
            await redisClient.setex(key, ttl, dataToCache); 
            console.log(`[Cache] Set key ${key} with TTL ${ttl}s`);
        } catch (error) {
            console.error(`[Cache Error] Failed to set key ${key}:`, error);
        }
    }
}