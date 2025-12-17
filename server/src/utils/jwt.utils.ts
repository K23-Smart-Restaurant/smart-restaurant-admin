import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for authenticated user
 */
export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
