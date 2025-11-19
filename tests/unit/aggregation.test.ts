// tests/unit/aggregation.test.ts
import { AggregationService } from '../../src/services/aggregation.service';
import { UnifiedToken } from '../../src/interfaces/token.interface';

// Mock the providers to control what data they return
jest.mock('../../src/services/providers/dexscreener');
jest.mock('../../src/services/providers/jupiter');

describe('AggregationService Unit Tests', () => {
    // Create a simple mock token factory
    const mockToken = (address: string, volume: number, price: number, source: string): UnifiedToken => ({
        token_address: address,
        token_name: `Token ${address}`,
        token_ticker: `TKN${address.slice(-1)}`,
        price_sol: price,
        price_usd: price * 100,
        market_cap_sol: 1000,
        volume_sol_24h: volume,
        liquidity_sol: 500,
        transaction_count_24h: volume / 10,
        price_change_1h: 5,
        price_change_24h: 10,
        protocol: source,
        source_count: 1,
        last_updated: Date.now(),
        price_change_7d: undefined
    });

    it('should correctly merge duplicate tokens by summing volume and averaging price', async () => {
        const tokenA1 = mockToken('ADDR_1', 100, 1.0, 'DexScreener');
        const tokenA2 = mockToken('ADDR_1', 50, 2.0, 'Jupiter');
        const tokenB = mockToken('ADDR_2', 200, 3.0, 'DexScreener');

        // Configure mocks to return specific arrays
        require('../../src/services/providers/dexscreener').DexScreenerProvider.prototype.fetchAndNormalizeTokens.mockResolvedValue([tokenA1, tokenB]);
        require('../../src/services/providers/jupiter').JupiterProvider.prototype.fetchAndNormalizeTokens.mockResolvedValue([tokenA2]);
        
        const service = new AggregationService();
        const mergedTokens = await service.aggregate('query');

        expect(mergedTokens).toHaveLength(2);

        const mergedA = mergedTokens.find(t => t.token_address === 'ADDR_1');

        // Check Summation: Volume should be 100 + 50 = 150
        expect(mergedA?.volume_sol_24h).toBe(150);
        // Check Averaging: Price USD should be (100 + 200) / 2 = 150 (if price was 1 and 2, average is 1.5)
        expect(mergedA?.price_sol).toBe(1.5); // (1.0 + 2.0) / 2
        // Check Source Count
        expect(mergedA?.source_count).toBe(2); 
        
        // Check Token B passed through correctly
        const tokenBResult = mergedTokens.find(t => t.token_address === 'ADDR_2');
        expect(tokenBResult?.volume_sol_24h).toBe(200);
    });
});