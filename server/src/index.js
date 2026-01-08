import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { logger } from './config/winston.config.js';
import socketService from './services/SocketService.js';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = createServer(app);

// T410-T413: Initialize Socket.IO for real-time communication
socketService.initialize(server);
logger.info('🔌 Socket.IO service initialized');

// Start server
server.listen(PORT, HOST, () => {
  logger.info(`✅ Admin server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default server;
