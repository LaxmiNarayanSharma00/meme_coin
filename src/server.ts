

import dotenv from 'dotenv';
dotenv.config();

import http from 'http'; 
import app from './app';
import { connectRedis } from './config/redis';
import { initSocket } from './sockets/socketServer';
import { DataFetcherJob } from './jobs/dataFetcher.job';

const PORT = process.env.PORT || 3000;


const server = http.createServer(app);

connectRedis()
    .then(() => {
        console.log('✅ Redis connected successfully.');


        initSocket(server);
        console.log('✅ Socket.io initialized.');


        server.listen(PORT, () => {
            // console.log(`🚀 Server running on http://localhost:${PORT}`);


            const job = new DataFetcherJob();
            job.start();
        });
    })
    .catch((error) => {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    });