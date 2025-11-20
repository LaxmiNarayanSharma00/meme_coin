
import express, { Request, Response } from 'express';
import tokenRoutes from './routes/token.routes';

const app = express();


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'Meme Coin Aggregator' });
});


app.use('/api/v1', tokenRoutes);


app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err.stack); 
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        status: statusCode,
    });
});

export default app;