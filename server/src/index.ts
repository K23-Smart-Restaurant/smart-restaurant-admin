import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import { logger } from './config/winston.config';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  logger.info(`✅ Admin server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
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
