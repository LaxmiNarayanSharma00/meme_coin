// src/server.ts

import dotenv from 'dotenv';
dotenv.config();

import http from 'http'; // Import native HTTP module
import app from './app';
import { connectRedis } from './config/redis';
import { initSocket } from './sockets/socketServer';
import { DataFetcherJob } from './jobs/dataFetcher.job';

const PORT = process.env.PORT || 3000;

// 1. Create HTTP Server (Wraps Express app)
const server = http.createServer(app);

connectRedis()
    .then(() => {
        console.log('✅ Redis connected successfully.');

        // 2. Initialize Socket.io
        initSocket(server);
        console.log('✅ Socket.io initialized.');

        // 3. Start the Server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);

            // 4. Start Background Job
            const job = new DataFetcherJob();
            job.start();
        });
    })
    .catch((error) => {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    });