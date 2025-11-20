

import { UnifiedToken } from '../interfaces/token.interface';
import { DexScreenerProvider } from './providers/dexscreener';
import { JupiterProvider } from './providers/jupiter'; 

export class AggregationService {
    private providers = [
        new DexScreenerProvider(),
        new JupiterProvider(), 
    ];

    /**

     * @param query 
     */
    async aggregate(query: string): Promise<UnifiedToken[]> {

        const results = await Promise.all(
            this.providers.map(provider => provider.fetchAndNormalizeTokens(query))
        );


        const allTokens = results.flat();


        const tokenMap = new Map<string, UnifiedToken>();

        for (const token of allTokens) {
            if (!token.token_address) continue;
            
            const existingToken = tokenMap.get(token.token_address);

            if (!existingToken) {

                tokenMap.set(token.token_address, token);
            } else {

                const mergedToken: UnifiedToken = {
                    ...existingToken, 

                    liquidity_sol: Math.max(existingToken.liquidity_sol, token.liquidity_sol),
                    

                    volume_sol_24h: existingToken.volume_sol_24h + token.volume_sol_24h,
                    transaction_count_24h: existingToken.transaction_count_24h + token.transaction_count_24h,


                    price_usd: (existingToken.price_usd + token.price_usd) / 2,
                    price_sol: (existingToken.price_sol + token.price_sol) / 2,
                    
                    
                    source_count: existingToken.source_count + 1,
                    last_updated: Date.now(),
                };

                tokenMap.set(token.token_address, mergedToken);
            }
        }


        return Array.from(tokenMap.values());
    }
}