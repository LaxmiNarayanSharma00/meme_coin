// src/services/aggregation.service.ts

import { UnifiedToken } from '../interfaces/token.interface';
import { DexScreenerProvider } from './providers/dexscreener';
import { JupiterProvider } from './providers/jupiter'; // (Uncomment when created)

export class AggregationService {
    private providers = [
        new DexScreenerProvider(),
        new JupiterProvider(), // (Uncomment when created)
    ];

    /**
     * Fetches data from all providers, normalizes it, and merges into a single array.
     * @param query The search query (e.g., 'PIPE' or an address).
     */
    async aggregate(query: string): Promise<UnifiedToken[]> {
        // 1. Fetch data from all providers concurrently
        const results = await Promise.all(
            this.providers.map(provider => provider.fetchAndNormalizeTokens(query))
        );

        // Flatten the array of arrays (e.g., [[t1, t2], [t3]]) into a single array ([t1, t2, t3])
        const allTokens = results.flat();

        // 2. Merge Logic: Use a Map for O(1) merging based on token_address
        const tokenMap = new Map<string, UnifiedToken>();

        for (const token of allTokens) {
            if (!token.token_address) continue;
            const existingToken = tokenMap.get(token.token_address);

            if (!existingToken) {
                // If it's a new token, just add it to the map
                tokenMap.set(token.token_address, token);
            } else {
                // If the token already exists, merge the data.
                // Priority Strategy: Use the token with the highest liquidity, or simply average/sum key metrics.
                
                // Merge Logic Example (Averaging price, summing volume, prioritizing higher liquidity):
                const mergedToken: UnifiedToken = {
                    ...existingToken, // Start with the existing entry
                    // Merge fields: Take the highest liquidity to define the primary protocol/pool
                    liquidity_sol: Math.max(existingToken.liquidity_sol, token.liquidity_sol),
                    
                    // Sum metrics (since they come from different sources/pools)
                    volume_sol_24h: existingToken.volume_sol_24h + token.volume_sol_24h,
                    transaction_count_24h: existingToken.transaction_count_24h + token.transaction_count_24h,

                    // Simple Averaging (Be careful with prices, a weighted average is often better)
                    price_usd: (existingToken.price_usd + token.price_usd) / 2,
                    price_sol: (existingToken.price_sol + token.price_sol) / 2,
                    
                    // Track source count
                    source_count: existingToken.source_count + 1,
                    last_updated: Date.now(),
                };

                tokenMap.set(token.token_address, mergedToken);
            }
        }

        // 3. Convert Map values back to a single array
        return Array.from(tokenMap.values());
    }
}