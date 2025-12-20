import { z } from 'zod';
import { UserRole } from '../lib/client.js';

/**
 * Password validation schema
 * Requirements: min 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Registration schema for admin app users
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum([UserRole.ADMIN, UserRole.WAITER, UserRole.KITCHEN_STAFF], {
    errorMap: () => ({
      message: 'Role must be ADMIN, WAITER, or KITCHEN_STAFF',
    }),
  }),
  phoneNumber: z.string().optional(),
});

/**
 * Login schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export { registerSchema, loginSchema };
