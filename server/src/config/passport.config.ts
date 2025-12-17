import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// JWT Strategy Options
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  algorithms: ['HS256'],
};

// JWT Strategy for Admin, Waiter, and Kitchen Staff roles
passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Extract userId from JWT payload
      const userId = jwtPayload.sub || jwtPayload.userId;

      if (!userId) {
        return done(null, false, { message: 'Invalid token payload' });
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      // Check if user exists and is active
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      if (!user.isActive) {
        return done(null, false, { message: 'User account is deactivated' });
      }

      // Check if user has appropriate role for admin app
      const allowedRoles: UserRole[] = [
        UserRole.ADMIN,
        UserRole.WAITER,
        UserRole.KITCHEN_STAFF,
      ];

      if (!allowedRoles.includes(user.role)) {
        return done(null, false, {
          message: 'Insufficient permissions. Admin, Waiter, or Kitchen Staff role required.',
        });
      }

      // Authentication successful
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
