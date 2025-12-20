import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { UserRole } from '../lib/client.js';

class StaffService {
  /**
   * Create a new waiter account
   * @param {Object} data - Waiter creation data
   * @returns {Object} Created waiter user data
   */
  async createWaiter(data) {
    const { email, password, name, phoneNumber } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password with bcrypt (12 rounds minimum)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create waiter user
    const waiter = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: UserRole.WAITER,
        phoneNumber,
      },
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

    return waiter;
  }

  /**
   * Create a new kitchen staff account
   * @param {Object} data - Kitchen staff creation data
   * @returns {Object} Created kitchen staff user data
   */
  async createKitchenStaff(data) {
    const { email, password, name, phoneNumber } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password with bcrypt (12 rounds minimum)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create kitchen staff user
    const kitchenStaff = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: UserRole.KITCHEN_STAFF,
        phoneNumber,
      },
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

    return kitchenStaff;
  }

  /**
   * Get all staff members with optional role filter
   * @param {Object} filters - Filter options (role, search)
   * @returns {Array} List of staff users
   */
  async getStaff(filters = {}) {
    const { role, search } = filters;

    const where = {
      role: {
        in: role
          ? [role]
          : [UserRole.ADMIN, UserRole.WAITER, UserRole.KITCHEN_STAFF],
      },
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return staff;
  }

  /**
   * Update staff member information
   * @param {string} userId - User ID
   * @param {Object} data - Update data
   * @returns {Object} Updated user data
   */
  async updateStaff(userId, data) {
    const { name, phoneNumber, email } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('Staff member not found');
    }

    // Check if user has admin-related role
    const allowedRoles = [UserRole.ADMIN, UserRole.WAITER, UserRole.KITCHEN_STAFF];
    if (!allowedRoles.includes(existingUser.role)) {
      throw new Error('Can only update staff accounts');
    }

    // If email is being updated, check for uniqueness
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(email && { email }),
      },
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

    return updatedUser;
  }

  /**
   * Deactivate (delete) a staff member
   * @param {string} userId - User ID to deactivate
   * @returns {Object} Success message
   */
  async deactivateStaff(userId) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('Staff member not found');
    }

    // Check if user has admin-related role
    const allowedRoles = [UserRole.ADMIN, UserRole.WAITER, UserRole.KITCHEN_STAFF];
    if (!allowedRoles.includes(existingUser.role)) {
      throw new Error('Can only deactivate staff accounts');
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Staff member deactivated successfully',
    };
  }
}

export default StaffService;
