import { Router } from 'express';
import KitchenController from '../controllers/KitchenController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateKitchenOrderStatusSchema,
  updateOrderItemStatusSchema,
} from '../schemas/kitchen.schema.js';

const router = Router();
const kitchenController = new KitchenController();

// T403: All kitchen routes require KITCHEN_STAFF authentication
router.use(authenticate);
router.use(authorize('KITCHEN_STAFF', 'ADMIN')); // Admin can also access for monitoring

// T403: GET /api/kitchen/orders - Get active orders (CONFIRMED, PREPARING, READY)
router.get('/orders', (req, res, next) => kitchenController.getActiveOrders(req, res, next));

// GET /api/kitchen/orders/history - Get recent order history
router.get('/orders/history', (req, res, next) =>
  kitchenController.getOrderHistory(req, res, next)
);

// T405: PATCH /api/kitchen/orders/:id/status - Update order status
router.patch('/orders/:id/status', validate(updateKitchenOrderStatusSchema), (req, res, next) =>
  kitchenController.updateOrderStatus(req, res, next)
);

// T406: PATCH /api/kitchen/orders/:id/items/:itemId/status - Update item status
router.patch(
  '/orders/:id/items/:itemId/status',
  validate(updateOrderItemStatusSchema),
  (req, res, next) => kitchenController.updateOrderItemStatus(req, res, next)
);

export default router;
