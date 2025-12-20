import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();
const authController = new AuthController();

// Rate limiters for authentication endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes (used in development only)
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100  , // 100 requests per 15 minutes (used in development only)
  message: {
    success: false,
    message: 'Too many registration attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

// Protected routes
router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
