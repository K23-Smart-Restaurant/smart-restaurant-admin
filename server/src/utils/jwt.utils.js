import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-change-in-production';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // Long-lived refresh token

/**
 * Generate JWT access token for authenticated user
 * @param {Object} payload - Token payload with sub, email, role
 * @returns {string} JWT access token
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate refresh token for authenticated user
 * @param {Object} payload - Token payload with sub, email, role
 * @returns {string} JWT refresh token
 */
const signRefreshToken = (payload) => {
  // Add random jti (JWT ID) for uniqueness
  const jti = crypto.randomBytes(32).toString('hex');
  return jwt.sign({ ...payload, jti }, REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verify and decode JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify and decode JWT refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Get expiration date for refresh token
 * @returns {Date} Expiration date
 */
const getRefreshTokenExpiration = () => {
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
  const now = new Date();

  // Parse expiration string (e.g., '7d', '30d', '1h')
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error('Invalid refresh token expiration format');
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 'd': // days
      return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000);
    case 'h': // hours
      return new Date(now.getTime() + numValue * 60 * 60 * 1000);
    case 'm': // minutes
      return new Date(now.getTime() + numValue * 60 * 1000);
    case 's': // seconds
      return new Date(now.getTime() + numValue * 1000);
    default:
      throw new Error('Invalid time unit');
  }
};

export {
  signToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
  getRefreshTokenExpiration
};
