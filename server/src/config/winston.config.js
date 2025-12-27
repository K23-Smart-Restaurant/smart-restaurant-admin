import { format as _format, createLogger, transports as _transports } from 'winston';
import { existsSync, mkdirSync } from 'fs';

// Check if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;

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

// Create logs directory if it doesn't exist (only in non-serverless environments)
const logsDir = './logs';
if (!isServerless && !existsSync(logsDir)) {
  mkdirSync(logsDir);
}

// Build transports array
const logTransports = [
  // Console transport (always enabled)
  new _transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports only in non-serverless environments
if (!isServerless) {
  logTransports.push(
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
    })
  );
}

// Create logger instance
const loggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: logTransports,
};

// Add file-based exception/rejection handlers only in non-serverless environments
if (!isServerless) {
  loggerOptions.exceptionHandlers = [
    new _transports.File({ filename: 'logs/exceptions.log' }),
  ];
  loggerOptions.rejectionHandlers = [
    new _transports.File({ filename: 'logs/rejections.log' }),
  ];
}

const logger = createLogger(loggerOptions);



export { logger };
