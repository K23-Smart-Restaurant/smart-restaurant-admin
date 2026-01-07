import WaiterService from '../services/WaiterService.js';
import BillService from '../services/BillService.js';

const waiterService = new WaiterService();
const billService = new BillService();

/**
 * T471: WaiterController - Handles waiter operations
 */
class WaiterController {
    /**
     * T472: GET /api/waiter/orders/pending - Get all pending orders
     */
    async getPendingOrders(req, res, next) {
        try {
            const orders = await waiterService.getPendingOrders();
            res.json({
                success: true,
                data: orders,
                count: orders.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/waiter/orders/ready - Get orders ready to be served
     */
    async getReadyOrders(req, res, next) {
        try {
            const orders = await waiterService.getReadyOrders();
            res.json({
                success: true,
                data: orders,
                count: orders.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/waiter/orders/bill-requested - Get orders that requested bill
     */
    async getBillRequestedOrders(req, res, next) {
        try {
            const orders = await waiterService.getBillRequestedOrders();
            res.json({
                success: true,
                data: orders,
                count: orders.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * T473: POST /api/waiter/orders/:id/accept - Accept a pending order
     */
    async acceptOrder(req, res, next) {
        try {
            const { id } = req.params;
            const waiterId = req.user.id; // From authentication middleware

            const order = await waiterService.acceptOrder(id, waiterId);

            res.json({
                success: true,
                message: 'Order accepted and sent to kitchen',
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * T473: POST /api/waiter/orders/:id/reject - Reject a pending order
     */
    async rejectOrder(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const order = await waiterService.rejectOrder(id, reason);

            res.json({
                success: true,
                message: 'Order rejected',
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/waiter/orders/:id/served - Mark order as served
     */
    async markOrderServed(req, res, next) {
        try {
            const { id } = req.params;
            const order = await waiterService.markOrderServed(id);

            res.json({
                success: true,
                message: 'Order marked as served',
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/waiter/tables - Get table status overview
     */
    async getTableStatus(req, res, next) {
        try {
            const tables = await waiterService.getTableStatus();
            res.json({
                success: true,
                data: tables,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * T475: POST /api/waiter/bill/generate - Generate bill for an order
     */
    async generateBill(req, res, next) {
        try {
            const { orderId, discount } = req.body;

            const bill = await billService.generateBill(orderId, discount || 0);

            res.json({
                success: true,
                message: 'Bill generated successfully',
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/waiter/bill/:orderId - Get bill for an order
     */
    async getBill(req, res, next) {
        try {
            const { orderId } = req.params;
            const bill = await billService.getBill(orderId);

            res.json({
                success: true,
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * T476: POST /api/waiter/bill/pay - Record payment for an order
     */
    async recordPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, amount } = req.body;

            const result = await billService.recordPayment(
                orderId,
                paymentMethod,
                amount
            );

            res.json({
                success: true,
                message: 'Payment recorded successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default WaiterController;
