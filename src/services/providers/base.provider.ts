// src/services/providers/base.provider.ts

import { UnifiedToken } from '../../interfaces/token.interface';

/**
 * Defines the contract for any external data provider.
 * All providers must implement a fetchAndNormalizeTokens method.
 */
export abstract class BaseProvider {
    protected abstract apiUrl: string;
    protected abstract sourceName: string;

    /**
     * Fetches token data and transforms it into the UnifiedToken format.
     * @param query The search term or token addresses required by the API.
     */
    abstract fetchAndNormalizeTokens(query: string): Promise<UnifiedToken[]>;
}