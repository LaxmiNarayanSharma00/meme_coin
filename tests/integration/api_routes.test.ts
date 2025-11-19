import request from 'supertest';
import app from '../../src/app'; // We need to export app from src/app.ts
import redisClient from '../../src/config/redis';

// Close Redis after tests to prevent hanging
afterAll(async () => {
    await redisClient.quit();
});

describe('API Routes Integration', () => {
    
    // --- Happy Paths ---

    it('GET /api/v1/tokens should return 200 and valid structure', async () => {
        const res = await request(app).get('/api/v1/tokens');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/tokens with params should work', async () => {
        const res = await request(app).get('/api/v1/tokens?limit=5&sort=price_change_24h');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    // --- Edge Cases ---

    it('GET /api/v1/tokens with invalid limit should fallback to default', async () => {
        // Sending text instead of number for limit
        const res = await request(app).get('/api/v1/tokens?limit=abc');
        expect(res.status).toBe(200);
        // Should default to 20 (or at least not crash)
        expect(res.body.data).toBeDefined();
    });

    it('Unknown route should return 404', async () => {
        const res = await request(app).get('/api/v1/does-not-exist');
        expect(res.status).toBe(404);
    });
});