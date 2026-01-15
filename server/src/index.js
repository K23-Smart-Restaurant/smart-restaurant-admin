import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { logger } from './config/winston.config.js';
import socketService from './services/SocketService.js';
import { connectRedis, disconnectRedis } from './config/redis.config.js';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = createServer(app);

// T410-T413: Initialize Socket.IO for real-time communication
socketService.initialize(server);
logger.info('🔌 Socket.IO service initialized');

// Initialize Redis subscription for cross-app communication
const initRedis = async () => {
  try {
    await connectRedis((channel, data) => {
      // Route Redis messages to SocketService for broadcasting
      socketService.handleRedisMessage(channel, data);
    });
    logger.info('📡 Redis subscription initialized for cross-app events');
  } catch (error) {
    logger.warn(`Redis not available (optional): ${error.message}`);
  }
};

// Start server
server.listen(PORT, HOST, async () => {
  logger.info(`✅ Admin server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://${HOST}:${PORT}/health`);

  // Initialize Redis after server starts
  await initRedis();
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);

  // Disconnect Redis
  await disconnectRedis();

  server.close(() => {
    logger.info('HTTP server closed');
    throw new Error('Shutting down');
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
