// src/services/providers/dexscreener.ts

import { BaseProvider } from './base.provider';
import { UnifiedToken } from '../../interfaces/token.interface';
import httpClient from '../../lib/httpClient'; // Your robust client

/**
 * Provider for the DexScreener API.
 */
export class DexScreenerProvider extends BaseProvider {
    protected apiUrl = 'https://api.dexscreener.com/latest/dex';
    protected sourceName = 'DexScreener';

    async fetchAndNormalizeTokens(query: string): Promise<UnifiedToken[]> {
        const url = `${this.apiUrl}/search?q=${query}`;

        try {
            const response = await httpClient.get(url);
            const rawPairs = response.data.pairs || [];

            if (rawPairs.length === 0) {
                return [];
            }

            // Map the raw data to the UnifiedToken structure
            return rawPairs.map((pair: any): UnifiedToken => ({
                token_address: pair.baseToken.address,
                token_name: pair.baseToken.name,
                token_ticker: pair.baseToken.symbol,
                protocol: pair.dexId, 
                price_sol: pair.priceNative ? parseFloat(pair.priceNative) : 0, // Using Native (e.g., SOL)
                price_usd: pair.priceUsd ? parseFloat(pair.priceUsd) : 0,
                market_cap_sol: pair.fdv || 0, // DexScreener uses FDV
                volume_sol_24h: pair.volume?.h24 || 0,
                liquidity_sol: pair.liquidity?.native || 0, // Using Native (e.g., SOL)
                transaction_count_24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
                price_change_1h: pair.priceChange?.h1 || 0,
                price_change_24h: pair.priceChange?.h24 || 0,
                source_count: 1,
                last_updated: Date.now(),
            }));

        } catch (error: any) {
            console.error(`[${this.sourceName} Error] Failed to fetch data:`, error.message);
            // Return empty array on failure, the AggregationService handles this
            return [];
        }
    }
}