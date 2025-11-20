
export interface UnifiedToken {

    token_address: string;

    token_name: string;
    token_ticker: string;
    protocol: string; 
    

    price_sol: number; 
    price_usd: number; 
    market_cap_sol: number;
    volume_sol_24h: number; 
    liquidity_sol: number;
    transaction_count_24h: number;

    
    price_change_1h: number;
    price_change_24h: number;
    price_change_7d?: number; 
    
    
    source_count: number;
    last_updated: number;
}