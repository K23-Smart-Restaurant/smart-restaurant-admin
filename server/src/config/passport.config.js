import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../lib/prisma.js';

// JWT Strategy configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  algorithms: ['HS256'],
};

// JWT Strategy callback
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // Check if user exists
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // Check if user has admin, waiter, or kitchen staff role
      const allowedRoles = ['ADMIN', 'WAITER', 'KITCHEN_STAFF'];
      if (!allowedRoles.includes(user.role)) {
        return done(null, false, { message: 'Unauthorized role' });
      }

      // Authentication successful
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export { passport };
