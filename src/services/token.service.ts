// src/services/token.service.ts

import { CacheService } from './cache.service';
import { AggregationService } from './aggregation.service';
import { UnifiedToken } from '../interfaces/token.interface';

export interface GetTokensOptions {
    query: string;
    sortBy?: keyof UnifiedToken; // e.g., 'volume_sol_24h', 'market_cap_sol'
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string; // encoded string for pagination
}

export interface PaginatedResponse {
    data: UnifiedToken[];
    nextCursor: string | null;
}

export class TokenService {
    private cacheService: CacheService;
    private aggregationService: AggregationService;
    private readonly DISCOVERY_CACHE_KEY = 'trending-tokens';

    constructor() {
        this.cacheService = new CacheService();
        this.aggregationService = new AggregationService();
    }

    /**
     * Core method: Fetches, Sorts, and Paginates tokens.
     */
    async getTokens(options: GetTokensOptions): Promise<PaginatedResponse> {
        const { query, sortBy = 'volume_sol_24h', sortOrder = 'desc', limit = 20, cursor } = options;

        // 1. Get ALL data (Cache First -> Then API)
        // Note: We fetch the full list because we need to sort the whole dataset to paginate correctly.
        const allTokens = await this.fetchOrGetCachedTokens(query);

        // 2. Apply Sorting
        const sortedTokens = this.sortTokens(allTokens, sortBy, sortOrder);

        // 3. Apply Cursor-Based Pagination
        return this.paginateTokens(sortedTokens, limit, cursor);
    }

    /**
     * Helper: Cache Look-aside Pattern
     */
    private async fetchOrGetCachedTokens(query: string): Promise<UnifiedToken[]> {
        const cacheKey = `${this.DISCOVERY_CACHE_KEY}:${query}`;
        
        // Try Cache
        const cached = await this.cacheService.get(cacheKey);
        if (cached) return cached;

        // Cache Miss: Fetch & Aggregate
        const fresh = await this.aggregationService.aggregate(query);
        
        // Write to Cache (TTL 30s)
        if (fresh.length > 0) {
            await this.cacheService.set(cacheKey, fresh);
        }
        return fresh;
    }

    /**
     * Helper: In-Memory Sorting
     */
    private sortTokens(tokens: UnifiedToken[], key: keyof UnifiedToken, order: 'asc' | 'desc'): UnifiedToken[] {
        return [...tokens].sort((a, b) => {
            const valA = a[key] as number || 0;
            const valB = b[key] as number || 0;
            return order === 'desc' ? valB - valA : valA - valB;
        });
    }

    /**
     * Helper: Cursor Pagination Logic
     * Cursor Format: "index_tokenAddress" (Simple pointer approach for cached lists)
     */
    private paginateTokens(tokens: UnifiedToken[], limit: number, cursor?: string): PaginatedResponse {
        let startIndex = 0;

        if (cursor) {
            // Decode cursor. Example: "20_TokenAddressXYZ"
            try {
                const decoded = Buffer.from(cursor, 'base64').toString('ascii');
                const [indexStr, ] = decoded.split('_');
                startIndex = parseInt(indexStr, 10) + 1; // Start after the last item
            } catch (e) {
                // Invalid cursor, start from 0
                startIndex = 0;
            }
        }

        // Slice the data
        const pagedData = tokens.slice(startIndex, startIndex + limit);
        
        // Generate next cursor
        let nextCursor: string | null = null;
        if (startIndex + limit < tokens.length) {
            const nextIndex = startIndex + limit - 1;
            // We create a cursor pointing to the last item sent
            const lastItem = pagedData[pagedData.length - 1];
            const rawCursor = `${nextIndex}_${lastItem.token_address}`;
            nextCursor = Buffer.from(rawCursor).toString('base64');
        }

        return {
            data: pagedData,
            nextCursor
        };
    }
}