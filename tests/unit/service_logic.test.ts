import { TokenService } from '../../src/services/token.service';
import { UnifiedToken } from '../../src/interfaces/token.interface';


jest.mock('../../src/services/cache.service');
jest.mock('../../src/services/aggregation.service');

describe('TokenService Logic (Sorting & Pagination)', () => {
    let service: TokenService;
    let mockTokens: UnifiedToken[];

    beforeEach(() => {
        service = new TokenService();

        mockTokens = [
            { token_name: 'A', volume_sol_24h: 100, price_change_24h: 10, token_address: 'addr1' } as any,
            { token_name: 'B', volume_sol_24h: 300, price_change_24h: -5, token_address: 'addr2' } as any,
            { token_name: 'C', volume_sol_24h: 200, price_change_24h: 50, token_address: 'addr3' } as any,
        ];

        (service as any).fetchOrGetCachedTokens = jest.fn().mockResolvedValue(mockTokens);
    });



    it('should sort tokens by volume descending (default)', async () => {
        const result = await service.getTokens({ query: 'SOL' });
        expect(result.data[0].token_name).toBe('B'); 
        expect(result.data[1].token_name).toBe('C'); 
        expect(result.data[2].token_name).toBe('A'); 
    });

    it('should sort tokens by price change ascending', async () => {
        const result = await service.getTokens({ query: 'SOL', sortBy: 'price_change_24h', sortOrder: 'asc' });
        expect(result.data[0].token_name).toBe('B'); 
        expect(result.data[1].token_name).toBe('A'); 
        expect(result.data[2].token_name).toBe('C'); 
    });

    it('should paginate correctly (limit 1)', async () => {
        const result = await service.getTokens({ query: 'SOL', limit: 1 });
        expect(result.data.length).toBe(1);
        expect(result.nextCursor).not.toBeNull(); 
    });



    it('should handle invalid cursor gracefully (reset to start)', async () => {
        const result = await service.getTokens({ query: 'SOL', cursor: 'INVALID_BASE64_STRING' });
        expect(result.data.length).toBe(3); 
    });

    it('should handle end of list (no next cursor)', async () => {
        
        const result = await service.getTokens({ query: 'SOL', limit: 5 });
        expect(result.nextCursor).toBeNull(); 
    });
});