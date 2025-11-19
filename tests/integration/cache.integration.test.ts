
import * as dotenv from 'dotenv';
dotenv.config();
// tests/integration/cache.integration.test.ts

import { TokenService } from '../../src/services/token.service';
import { AggregationService } from '../../src/services/aggregation.service';
import { CacheService } from '../../src/services/cache.service';

// 1. Mock the AggregationService to control the 'fresh' data
jest.mock('../../src/services/aggregation.service', () => {
    return {
        AggregationService: jest.fn().mockImplementation(() => {
            return {
                aggregate: jest.fn().mockResolvedValue([
                    // Note: We need enough fields for sorting logic to work without crashing
                    { token_address: 'WIF', volume_sol_24h: 1000, price_change_24h: 10, token_name: 'Wif' }
                ]),
            };
        }),
    };
});

// 2. Spy on CacheService methods to track calls without mocking Redis entirely
const mockCacheGet = jest.spyOn(CacheService.prototype, 'get');
const mockCacheSet = jest.spyOn(CacheService.prototype, 'set');

describe('TokenService Cache Integration Flow', () => {
    let tokenService: TokenService;
    
    beforeEach(() => {
        tokenService = new TokenService();
        jest.clearAllMocks();
    });

    it('should result in a Cache Miss, fetch data, and set cache on first call', async () => {
        // Arrange: Simulate cache miss
        mockCacheGet.mockResolvedValue(null); 

        // Act: Call the NEW method (getTokens) instead of the old one
        const result = await tokenService.getTokens({ query: 'SOL' });

        // Assert
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // Check if the AggregationService's aggregate method was called (cache miss)
        expect(tokenService['aggregationService'].aggregate).toHaveBeenCalledTimes(1); 
        // Check if the fresh data was written to the cache
        expect(mockCacheSet).toHaveBeenCalledTimes(1);
        
        // Check the data structure (Phase 3 returns { data: [...], nextCursor: ... })
        expect(result.data).toHaveLength(1);
        expect(result.data[0].token_address).toBe('WIF');
    });

    it('should result in a Cache Hit on second call and skip fetching', async () => {
        const mockData = [{ token_address: 'WIF', volume_sol_24h: 5000 }];

        // Arrange: Simulate cache hit
        mockCacheGet.mockResolvedValue(mockData as any); 

        // Act
        const result = await tokenService.getTokens({ query: 'SOL' });

        // Assert
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // Check that aggregate was NOT called (cache hit)
        expect(tokenService['aggregationService'].aggregate).not.toHaveBeenCalled(); 
        // Check that cache set was NOT called
        expect(mockCacheSet).not.toHaveBeenCalled(); 
        
        expect(result.data).toEqual(mockData);
    });
});