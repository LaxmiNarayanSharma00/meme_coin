// src/services/providers/jupiter.ts

import { BaseProvider } from './base.provider';
import { UnifiedToken } from '../../interfaces/token.interface';
import httpClient from '../../lib/httpClient';

/**
 * Provider for the Jupiter Price API (v2 search).
 * Note: Jupiter's API is primarily for price lookup, so some metrics like volume/liquidity 
 * might be approximated or unavailable (set to 0) compared to DexScreener.
 */
export class JupiterProvider extends BaseProvider {
    // Note: The Jupiter Price API search endpoint is different from the main DEX endpoint
    protected apiUrl = 'https://lite-api.jup.ag/tokens/v2';
    protected sourceName = 'Jupiter';

    /**
     * Searches for a token and retrieves its price data.
     * Jupiter search is simpler; we look for a ticker symbol.
     * @param query The ticker symbol (e.g., 'SOL', 'WIF', 'PIPE').
     */
    async fetchAndNormalizeTokens(query: string): Promise<UnifiedToken[]> {
        // Query the search endpoint using the token symbol
        const url = `${this.apiUrl}/search?query=${query}`;

        try {
            const response = await httpClient.get(url);
            const rawTokens = response.data.map((token: any) => ({
                ...token,
                // Add a placeholder for a "pool/protocol" identifier
                poolId: 'Jupiter',
            })) || [];

            if (rawTokens.length === 0) {
                return [];
            }

            // Map the raw data to the UnifiedToken structure
            return rawTokens.map((token: any): UnifiedToken => ({
                token_address: token.address,
                token_name: token.name,
                token_ticker: token.symbol,
                protocol: token.poolId, // Using the custom added identifier
                price_sol: token.vsToken ? token.vsToken.SOL || 0 : 0, // Assuming price relative to SOL/Native
                price_usd: token.price || 0, // Jupiter often provides USD price directly

                // Volume, liquidity, and transaction counts are often missing from simple price APIs
                volume_sol_24h: 0,
                liquidity_sol: 0,
                transaction_count_24h: 0,
                 market_cap_sol: 0, 
                // Change metrics are often not in the search results, using placeholders
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