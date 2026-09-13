import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';
import { startNotificationWorker } from './queues/notification.worker.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create HTTP server & bind Socket.io
    const server = http.createServer(app);
    initSocket(server);

    // 3. Start BullMQ worker to process background notification jobs
    startNotificationWorker();

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`[Server] Server is running on http://localhost:${PORT}`);
      console.log(`[Socket.io] Real-time WebSocket listening on port ${PORT}`);
      console.log('[BullMQ] Notification worker listening for jobs');
    });

    // Graceful shutdown handling
    const shutdown = (signal: string) => {
      console.log(`[Server] Received ${signal}. Closing server gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { startServer };
export default startServer;
