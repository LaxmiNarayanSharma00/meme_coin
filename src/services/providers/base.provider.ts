

import { UnifiedToken } from '../../interfaces/token.interface';

export abstract class BaseProvider {
    protected abstract apiUrl: string;
    protected abstract sourceName: string;

    /**
     * 
     * @param query 
     */
    abstract fetchAndNormalizeTokens(query: string): Promise<UnifiedToken[]>;
}