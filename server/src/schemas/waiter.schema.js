import { z } from 'zod';

/**
 * Validation schemas for Waiter API endpoints
 */

// T473: Schema for rejecting order
export const rejectOrderSchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});

// T475: Schema for generating bill
export const generateBillSchema = z.object({
  orderId: z.string().uuid({
    message: 'Order ID must be a valid UUID',
  }),
  discount: z.number().min(0).optional(),
});

// T476: Schema for recording payment
export const recordPaymentSchema = z.object({
  orderId: z.string().uuid({
    message: 'Order ID must be a valid UUID',
  }),
  paymentMethod: z.enum(['CASH', 'CARD', 'E_WALLET'], {
    errorMap: () => ({ message: 'Payment method must be CASH, CARD, or E_WALLET' }),
  }),
});
