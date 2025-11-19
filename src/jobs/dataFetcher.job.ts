// src/jobs/dataFetcher.job.ts

import { AggregationService } from '../services/aggregation.service';
import { CacheService } from '../services/cache.service';
import { getIO } from '../sockets/socketServer';

export class DataFetcherJob {
    private aggregationService: AggregationService;
    private cacheService: CacheService;
    private isRunning: boolean = false;
    private readonly UPDATE_INTERVAL_MS = 15000; // Update every 15 seconds
    private readonly CACHE_KEY = 'trending-tokens:sol';

    constructor() {
        this.aggregationService = new AggregationService();
        this.cacheService = new CacheService();
    }

    /**
     * Starts the polling loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[Job] Background Data Fetcher started.');
        
        this.poll(); // Initial run
    }

    private async poll() {
        try {
            // 1. Fetch fresh data (Bypassing cache to get real live stats)
            console.log('[Job] Fetching fresh updates...');
            const freshTokens = await this.aggregationService.aggregate('SOL');

            // 2. Update the Redis Cache (so REST API serves fresh data immediately)
            // Set TTL slightly longer than interval to ensure availability
            await this.cacheService.set(this.CACHE_KEY, freshTokens, 30);

            // 3. Broadcast to WebSockets
            const io = getIO();
            // We emit the top 20 tokens for the "Discover" page view
            const top20 = freshTokens
                .sort((a, b) => b.volume_sol_24h - a.volume_sol_24h)
                .slice(0, 20);

            io.to('trending-updates').emit('tokens:update', {
                timestamp: Date.now(),
                data: top20
            });

            console.log(`[Job] Broadcasted updates for ${top20.length} tokens.`);

        } catch (error) {
            console.error('[Job Error] Failed to fetch/broadcast updates:', error);
        } finally {
            // Schedule next run
            if (this.isRunning) {
                setTimeout(() => this.poll(), this.UPDATE_INTERVAL_MS);
            }
        }
    }
}