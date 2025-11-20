import request from 'supertest';
import app from '../../src/app'; 
import redisClient from '../../src/config/redis';


afterAll(async () => {
    await redisClient.quit();
});

describe('API Routes Integration', () => {
    


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



    it('GET /api/v1/tokens with invalid limit should fallback to default', async () => {
        
        const res = await request(app).get('/api/v1/tokens?limit=abc');
        expect(res.status).toBe(200);

        expect(res.body.data).toBeDefined();
    });

    it('Unknown route should return 404', async () => {
        const res = await request(app).get('/api/v1/does-not-exist');
        expect(res.status).toBe(404);
    });
});