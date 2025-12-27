import { format as _format, createLogger, transports as _transports } from 'winston';
import { existsSync, mkdirSync } from 'fs';

// Define log format
const logFormat = _format.combine(
  _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  _format.errors({ stack: true }),
  _format.splat(),
  _format.json()
);

// Create console format for development
const consoleFormat = _format.combine(
  _format.colorize(),
  _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  _format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = './logs';
if (!existsSync(logsDir)) {
  mkdirSync(logsDir);
}

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport
    new _transports.Console({
      format: consoleFormat,
    }),
    // File transport for errors
    new _transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new _transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new _transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new _transports.File({ filename: 'logs/rejections.log' }),
  ],
});



export { logger };
