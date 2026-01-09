import { Router } from 'express';
import WaiterController from '../controllers/WaiterController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    rejectOrderSchema,
    generateBillSchema,
    recordPaymentSchema,
} from '../schemas/waiter.schema.js';

const router = Router();
const waiterController = new WaiterController();

// All waiter routes require WAITER authentication
router.use(authenticate);
router.use(authorize('WAITER', 'ADMIN')); // Admin can also access for monitoring

// Order Management Routes

// T472: GET /api/waiter/orders/pending - Get pending orders
router.get('/orders/pending', (req, res, next) =>
    waiterController.getPendingOrders(req, res, next)
);

// GET /api/waiter/orders/ready - Get orders ready to be served
router.get('/orders/ready', (req, res, next) =>
    waiterController.getReadyOrders(req, res, next)
);

// GET /api/waiter/orders/bill-requested - Get orders that requested bill
router.get('/orders/bill-requested', (req, res, next) =>
    waiterController.getBillRequestedOrders(req, res, next)
);

// T473: POST /api/waiter/orders/:id/accept - Accept a pending order
router.post('/orders/:id/accept', (req, res, next) =>
    waiterController.acceptOrder(req, res, next)
);

// T473: POST /api/waiter/orders/:id/reject - Reject a pending order
router.post(
    '/orders/:id/reject',
    validate(rejectOrderSchema),
    (req, res, next) => waiterController.rejectOrder(req, res, next)
);

// POST /api/waiter/orders/:id/served - Mark order as served
router.post('/orders/:id/served', (req, res, next) =>
    waiterController.markOrderServed(req, res, next)
);

// POST /api/waiter/orders/:id/process-payment - Process cash/card payment
router.post('/orders/:id/process-payment', (req, res, next) =>
    waiterController.processCashPayment(req, res, next)
);

// Table Management Routes

// GET /api/waiter/tables - Get table status overview
router.get('/tables', (req, res, next) =>
    waiterController.getTableStatus(req, res, next)
);

// Bill Management Routes

// T475: POST /api/waiter/bill/generate - Generate bill for an order
router.post(
    '/bill/generate',
    validate(generateBillSchema),
    (req, res, next) => waiterController.generateBill(req, res, next)
);

// GET /api/waiter/bill/:orderId - Get bill for an order
router.get('/bill/:orderId', (req, res, next) =>
    waiterController.getBill(req, res, next)
);

// T476: POST /api/waiter/bill/pay - Record payment for an order
router.post(
    '/bill/pay',
    validate(recordPaymentSchema),
    (req, res, next) => waiterController.recordPayment(req, res, next)
);

export default router;
