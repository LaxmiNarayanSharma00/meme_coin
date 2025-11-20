

import { BaseProvider } from './base.provider';
import { UnifiedToken } from '../../interfaces/token.interface';
import httpClient from '../../lib/httpClient';


export class JupiterProvider extends BaseProvider {

    protected apiUrl = 'https://lite-api.jup.ag/tokens/v2';
    protected sourceName = 'Jupiter';

    /**

     * @param query 
     */
    async fetchAndNormalizeTokens(query: string): Promise<UnifiedToken[]> {
        
        const url = `${this.apiUrl}/search?query=${query}`;

        try {
            const response = await httpClient.get(url);
            const rawTokens = response.data.map((token: any) => ({
                ...token,
                poolId: 'Jupiter',
            })) || [];

            if (rawTokens.length === 0) {
                return [];
            }

            return rawTokens.map((token: any): UnifiedToken => ({
                token_address: token.address,
                token_name: token.name,
                token_ticker: token.symbol,
                protocol: token.poolId, 
                price_sol: token.vsToken ? token.vsToken.SOL || 0 : 0, 
                price_usd: token.price || 0, 


                volume_sol_24h: 0,
                liquidity_sol: 0,
                transaction_count_24h: 0,
                 market_cap_sol: 0, 

                price_change_1h: 0,
                price_change_24h: 0,

                source_count: 1,
                last_updated: Date.now(),
            }));

        } catch (error: any) {
            console.error(`[${this.sourceName} Error] Failed to fetch data:`, error.message);
            return [];
        }
    }
}