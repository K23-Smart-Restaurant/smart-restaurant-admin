import KitchenService from '../services/KitchenService.js';

const kitchenService = new KitchenService();

/**
 * T401: KitchenController - Handles kitchen display system endpoints
 */
class KitchenController {
    /**
     * T403: GET /api/kitchen/orders - Get all active orders for kitchen
     */
    async getActiveOrders(req, res, next) {
        try {
            const orders = await kitchenService.getActiveOrders();
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
     * T405: PATCH /api/kitchen/orders/:id/status - Update order status
     */
    async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await kitchenService.updateOrderStatus(id, status);

            res.json({
                success: true,
                message: `Order status updated to ${status}`,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * T406: PATCH /api/kitchen/orders/:id/items/:itemId/status - Update order item status
     */
    async updateOrderItemStatus(req, res, next) {
        try {
            const { id: orderId, itemId } = req.params;
            const { itemStatus } = req.body;

            const orderItem = await kitchenService.updateOrderItemStatus(
                orderId,
                itemId,
                itemStatus
            );

            res.json({
                success: true,
                message: `Order item status updated to ${itemStatus}`,
                data: orderItem,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kitchen/orders/history - Get recent order history
     */
    async getOrderHistory(req, res, next) {
        try {
            const orders = await kitchenService.getOrderHistory();
            res.json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default KitchenController;
