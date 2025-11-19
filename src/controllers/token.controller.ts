// src/controllers/token.controller.ts

import { Request, Response } from 'express';
import { TokenService } from '../services/token.service';
import { UnifiedToken } from '../interfaces/token.interface';

const tokenService = new TokenService();

export class TokenController {
    
    /**
     * Handler for GET /api/v1/tokens
     */
    async getTokens(req: Request, res: Response) {
        try {
            // 1. Extract Query Parameters
            const query = (req.query.query as string) || 'SOL'; // Default search
            const limit = parseInt(req.query.limit as string) || 20;
            const cursor = req.query.cursor as string;
            
            // Sorting params
            const sort = (req.query.sort as keyof UnifiedToken) || 'volume_sol_24h';
            const order = (req.query.order as 'asc' | 'desc') || 'desc';

            // 2. Call Service
            const result = await tokenService.getTokens({
                query,
                sortBy: sort,
                sortOrder: order,
                limit,
                cursor
            });

            // 3. Send Response
            res.status(200).json({
                success: true,
                count: result.data.length,
                nextCursor: result.nextCursor,
                data: result.data
            });

        } catch (error: any) {
            console.error('[TokenController] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve tokens',
                error: error.message
            });
        }
    }
}