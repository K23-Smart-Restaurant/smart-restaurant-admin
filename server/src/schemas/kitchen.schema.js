import { z } from 'zod';

/**
 * Validation schemas for Kitchen API endpoints
 */

// T405: Schema for updating order status (kitchen)
export const updateKitchenOrderStatusSchema = z.object({
    status: z.enum(['PREPARING', 'READY'], {
        errorMap: () => ({ message: 'Status must be either PREPARING or READY' }),
    }),
});

// T406: Schema for updating order item status
export const updateOrderItemStatusSchema = z.object({
    itemStatus: z.enum(['QUEUED', 'COOKING', 'READY'], {
        errorMap: () => ({ message: 'Item status must be QUEUED, COOKING, or READY' }),
    }),
});
