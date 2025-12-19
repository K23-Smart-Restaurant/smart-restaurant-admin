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
   * @returns {Object} User data with JWT token
   */
  async login(email, password) {
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

    // Generate JWT token
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
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
}

export default AuthService;
