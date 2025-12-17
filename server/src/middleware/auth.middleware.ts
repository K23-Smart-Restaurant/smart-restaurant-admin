import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.config';
import { UserRole } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      isActive: boolean;
    }
  }
}

/**
 * Authentication middleware - requires valid JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: Express.User, info: any) => {
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
 * @param allowedRoles - Array of roles that can access the route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
export const adminOnly = authorize(UserRole.ADMIN);

/**
 * Waiter-only middleware
 */
export const waiterOnly = authorize(UserRole.WAITER);

/**
 * Kitchen staff-only middleware
 */
export const kitchenOnly = authorize(UserRole.KITCHEN_STAFF);

/**
 * Admin or Waiter middleware
 */
export const adminOrWaiter = authorize(UserRole.ADMIN, UserRole.WAITER);
