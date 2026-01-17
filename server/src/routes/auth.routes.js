import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();
const authController = new AuthController();

// Multer config for avatar upload
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
}).single('avatar');

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
  max: 100, // 100 requests per 15 minutes (used in development only)
  message: {
    success: false,
    message: 'Too many registration attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', registerLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', loginLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// Refresh token endpoint
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

// Logout endpoint
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));
router.patch('/me', authenticate, (req, res, next) => authController.updateMe(req, res, next));
router.post('/me/avatar', authenticate, handleUploadError(avatarUpload), (req, res, next) =>
  authController.uploadAvatar(req, res, next)
);

export default router;
