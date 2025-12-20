import passport from 'passport';
import { UserRole } from '../lib/client.js';

/**
 * Authentication middleware - requires valid JWT token
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: err.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Unauthorized - Invalid or missing token',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that can access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden - ${allowedRoles.join(', ')} role required`,
      });
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
const adminOnly = authorize(UserRole.ADMIN);

/**
 * Waiter-only middleware
 */
const waiterOnly = authorize(UserRole.WAITER);

/**
 * Kitchen staff-only middleware
 */
const kitchenOnly = authorize(UserRole.KITCHEN_STAFF);

/**
 * Admin or Waiter middleware
 */
const adminOrWaiter = authorize(UserRole.ADMIN, UserRole.WAITER);

export {
  authenticate,
  authorize,
  adminOnly,
  waiterOnly,
  kitchenOnly,
  adminOrWaiter,
};
