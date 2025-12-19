import OrderService from '../services/OrderService.js';

const orderService = new OrderService();

class OrderController {
    async getAll(req, res, next) {
        try {
            const filters = {
                status: req.query.status,
                tableId: req.query.tableId,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const orders = await orderService.getOrders(filters);
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const order = await orderService.getOrderById(req.params.id);
            res.json(order);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const order = await orderService.updateOrderStatus(
                req.params.id,
                req.body.status
            );
            res.json(order);
        } catch (error) {
            next(error);
        }
    }
}

export default OrderController;
