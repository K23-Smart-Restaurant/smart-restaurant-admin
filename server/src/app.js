import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { passport } from "./config/passport.config.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { logger } from "./config/winston.config.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.RENDER_ADMIN_URL,
  process.env.VERCEL_ADMIN_URL,
  process.env.CLIENT_URL,
  process.env.CUSTOMER_APP_URL,
  // Development URLs
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
].filter(Boolean); // Remove undefined/null values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Allow file:// protocol for local development (opening HTML files directly)
    if (origin.startsWith("file://")) {
      console.log(`[CORS] Allowing file:// origin: ${origin}`);
      return callback(null, true);
    }

    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    console.warn(`[CORS] Allowed origins: ${allowedOrigins.join(", ")}`);
    return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"], // Headers exposed to the client
  maxAge: 86400, // Cache preflight response for 24 hours (in seconds)
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly for all routes
app.options("*", cors(corsOptions));

// Body parsing middleware
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// initialize Passport
app.use(passport.initialize());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
import authRoutes from "./routes/auth.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import tableRoutes from "./routes/table.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reportRoutes from "./routes/report.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import menuItemRoutes from "./routes/menuItem.routes.js";
import publicMenuRoutes from "./routes/publicMenu.routes.js";

// Register routes
// H1: Public Menu API - No authentication required (for guests browsing via QR)
app.use("/api/menu", publicMenuRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);

// Additional routes will be added here
// Example: app.use('/api/auth', authRoutes);
// Example: app.use('/api/staff', authenticate, staffRoutes);
// Example: app.use('/api/categories', authenticate, categoryRoutes);
// Example: app.use('/api/menu-items', authenticate, menuItemRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
