

import { CacheService } from './cache.service';
import { AggregationService } from './aggregation.service';
import { UnifiedToken } from '../interfaces/token.interface';

export interface GetTokensOptions {
    query: string;
    sortBy?: keyof UnifiedToken; 
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string; 
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


    async getTokens(options: GetTokensOptions): Promise<PaginatedResponse> {
        const { query, sortBy = 'volume_sol_24h', sortOrder = 'desc', limit = 20, cursor } = options;


        const allTokens = await this.fetchOrGetCachedTokens(query);

        const sortedTokens = this.sortTokens(allTokens, sortBy, sortOrder);

        return this.paginateTokens(sortedTokens, limit, cursor);
    }


    private async fetchOrGetCachedTokens(query: string): Promise<UnifiedToken[]> {
        const cacheKey = `${this.DISCOVERY_CACHE_KEY}:${query}`;

        
        const cached = await this.cacheService.get(cacheKey);
        if (cached) return cached;


        const fresh = await this.aggregationService.aggregate(query);

        
        if (fresh.length > 0) {
            await this.cacheService.set(cacheKey, fresh);
        }
        return fresh;
    }


    private sortTokens(tokens: UnifiedToken[], key: keyof UnifiedToken, order: 'asc' | 'desc'): UnifiedToken[] {
        return [...tokens].sort((a, b) => {
            const valA = a[key] as number || 0;
            const valB = b[key] as number || 0;
            return order === 'desc' ? valB - valA : valA - valB;
        });
    }


    private paginateTokens(tokens: UnifiedToken[], limit: number, cursor?: string): PaginatedResponse {
        let startIndex = 0;

        if (cursor) {
            try {
                const decoded = Buffer.from(cursor, 'base64').toString('ascii');
                const [indexStr] = decoded.split('_');
                const parsedIndex = parseInt(indexStr, 10);


                if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < tokens.length) {
                    startIndex = parsedIndex + 1;
                }
            } catch {
                startIndex = 0; 
            }
        }


        const pagedData = tokens.slice(startIndex, startIndex + limit);


        let nextCursor: string | null = null;
        if (startIndex + limit < tokens.length) {
            const nextIndex = startIndex + limit - 1;
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