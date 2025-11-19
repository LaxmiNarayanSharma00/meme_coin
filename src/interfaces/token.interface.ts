// src/interfaces/token.interface.ts

/**
 * The standard structure for a token across the entire service.
 * All external API data must be mapped to this format.
 */
export interface UnifiedToken {
    // Unique identifier for merging and display
    token_address: string;
    
    // Core details
    token_name: string;
    token_ticker: string;
    protocol: string; // e.g., "Raydium CLMM", "Jupiter", etc.
    
    // Price and Market Metrics
    price_sol: number; // Price quoted in SOL (Base currency for display)
    price_usd: number; // Price quoted in USD (for convenience)
    market_cap_sol: number;
    volume_sol_24h: number; // Volume over the last 24 hours
    liquidity_sol: number;
    transaction_count_24h: number;

    // Change Metrics
    price_change_1h: number; // Percentage change (e.g., 120.61)
    price_change_24h: number;
    price_change_7d?: number; // Optional, as not all sources provide it
    
    // Source tracking (optional, but useful for debugging/priority)
    source_count: number; // How many APIs contributed to this merged data
    last_updated: number; // Unix timestamp for freshness tracking
}