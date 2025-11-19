// src/app.ts
import express, { Request, Response } from 'express';
import tokenRoutes from './routes/token.routes';

const app = express();

// Middleware: Standard way to enable CORS for frontend access
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Basic Health Check endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'Meme Coin Aggregator' });
});

// Register Token Routes (will be built in Phase 3)
app.use('/api/v1', tokenRoutes);

// Global Error Handler (CRITICAL for production stability)
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err.stack); // Log the error stack to the console
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        status: statusCode,
    });
});

export default app;