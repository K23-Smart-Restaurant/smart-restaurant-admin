const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('./config/passport.config');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { logger } = require('./config/winston.config');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.CUSTOMER_APP_URL || 'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes will be added here
// Example: app.use('/api/auth', authRoutes);
// Example: app.use('/api/staff', authenticate, staffRoutes);
// Example: app.use('/api/categories', authenticate, categoryRoutes);
// Example: app.use('/api/menu-items', authenticate, menuItemRoutes);
// Example: app.use('/api/tables', authenticate, tableRoutes);
// Example: app.use('/api/orders', authenticate, orderRoutes);
// Example: app.use('/api/reports', authenticate, adminOnly, reportRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
