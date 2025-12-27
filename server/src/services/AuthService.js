import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { signToken } from '../utils/jwt.utils.js';
import { UserRole } from '../lib/client.js';

class AuthService {
  /**
   * Register a new user with admin-specific role checks
   * @param {Object} data - User registration data
   * @returns {Object} User data with JWT token
   */
  async register(data) {
    const { email, password, name, role, phoneNumber } = data;

    // Check allowed roles for admin app
    const allowedRoles = [UserRole.ADMIN, UserRole.WAITER, UserRole.KITCHEN_STAFF];
    if (!allowedRoles.includes(role)) {
      throw new Error(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password with bcrypt (12 rounds minimum)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        phoneNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to generate refresh token
   * @returns {Object} User data with JWT token and optional refresh token
   */
  async login(email, password, rememberMe = false) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has admin-specific role
    const allowedRoles = [UserRole.ADMIN, UserRole.WAITER, UserRole.KITCHEN_STAFF];
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Unauthorized role');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT access token
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    const result = {
      user: userWithoutPassword,
      token,
    };

    // Generate refresh token if "Remember me" is enabled
    if (rememberMe) {
      const { signRefreshToken, getRefreshTokenExpiration } = await import('../utils/jwt.utils.js');

      const refreshToken = signRefreshToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: getRefreshTokenExpiration(),
        },
      });

      result.refreshToken = refreshToken;
    }

    console.log(result);

    return result;
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshAccessToken(refreshToken) {
    const { verifyRefreshToken } = await import('../utils/jwt.utils.js');

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    if (storedToken.expiresAt < new Date()) {
      // Remove expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token expired');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
    };
  }

  /**
   * Logout user and invalidate refresh token
   * @param {string} refreshToken - Refresh token to invalidate
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      return; // No refresh token to invalidate
    }

    try {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    } catch (error) {
      // Ignore errors during logout
      console.error('Error during logout:', error);
    }
  }
}

export default AuthService;
