// tests/unit/providers.test.ts
import { DexScreenerProvider } from '../../src/services/providers/dexscreener';
import httpClient from '../../src/lib/httpClient'; 
import { UnifiedToken } from '../../src/interfaces/token.interface';

// Mock the entire httpClient module to control its .get() method
jest.mock('../../src/lib/httpClient', () => ({
    get: jest.fn(),
}));

describe('DexScreenerProvider Unit Tests', () => {
    const provider = new DexScreenerProvider();
    const mockResponse = {
        data: {
            pairs: [{
                baseToken: { address: 'ADDR_A', name: 'Meme Coin A', symbol: 'MCA' },
                priceNative: '0.00000123',
                priceUsd: '0.00456',
                volume: { h24: 1000 },
                liquidity: { native: 500 },
                txns: { h24: { buys: 10, sells: 5 } },
                priceChange: { h1: 10.5, h24: 50.2 },
                fdv: 10000,
                dexId: 'Raydium',
            }]
        }
    };

    it('should correctly normalize DexScreener data', async () => {
        (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const tokens = await provider.fetchAndNormalizeTokens('query');
        
        expect(tokens).toHaveLength(1);
        const token: UnifiedToken = tokens[0];

        // 1. Check normalization and type conversion
        expect(token.token_address).toBe('ADDR_A');
        expect(token.token_ticker).toBe('MCA');
        expect(token.price_usd).toBe(0.00456);
        expect(token.volume_sol_24h).toBe(1000);
        
        // 2. Check derived metrics (transaction count)
        expect(token.transaction_count_24h).toBe(15); // 10 buys + 5 sells
    });

    it('should return empty array on API failure', async () => {
        (httpClient.get as jest.Mock).mockRejectedValue(new Error('API Down'));
        const tokens = await provider.fetchAndNormalizeTokens('query');
        expect(tokens).toEqual([]);
    });
});