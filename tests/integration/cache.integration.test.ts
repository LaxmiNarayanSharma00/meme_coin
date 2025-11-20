
import * as dotenv from 'dotenv';
dotenv.config();


import { TokenService } from '../../src/services/token.service';
import { AggregationService } from '../../src/services/aggregation.service';
import { CacheService } from '../../src/services/cache.service';


jest.mock('../../src/services/aggregation.service', () => {
    return {
        AggregationService: jest.fn().mockImplementation(() => {
            return {
                aggregate: jest.fn().mockResolvedValue([

                    { token_address: 'WIF', volume_sol_24h: 1000, price_change_24h: 10, token_name: 'Wif' }
                ]),
            };
        }),
    };
});


const mockCacheGet = jest.spyOn(CacheService.prototype, 'get');
const mockCacheSet = jest.spyOn(CacheService.prototype, 'set');

describe('TokenService Cache Integration Flow', () => {
    let tokenService: TokenService;
    
    beforeEach(() => {
        tokenService = new TokenService();
        jest.clearAllMocks();
    });

    it('should result in a Cache Miss, fetch data, and set cache on first call', async () => {

        mockCacheGet.mockResolvedValue(null); 


        const result = await tokenService.getTokens({ query: 'SOL' });

        
        expect(mockCacheGet).toHaveBeenCalledTimes(1);

        expect(tokenService['aggregationService'].aggregate).toHaveBeenCalledTimes(1); 

        expect(mockCacheSet).toHaveBeenCalledTimes(1);
        

        expect(result.data).toHaveLength(1);
        expect(result.data[0].token_address).toBe('WIF');
    });

    it('should result in a Cache Hit on second call and skip fetching', async () => {
        const mockData = [{ token_address: 'WIF', volume_sol_24h: 5000 }];


        mockCacheGet.mockResolvedValue(mockData as any); 


        const result = await tokenService.getTokens({ query: 'SOL' });


        expect(mockCacheGet).toHaveBeenCalledTimes(1);

        expect(tokenService['aggregationService'].aggregate).not.toHaveBeenCalled(); 

        expect(mockCacheSet).not.toHaveBeenCalled(); 
        
        expect(result.data).toEqual(mockData);
    });
});