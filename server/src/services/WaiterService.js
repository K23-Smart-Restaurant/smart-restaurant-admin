import prisma from '../lib/prisma.js';
import socketService from './SocketService.js';

/**
 * WaiterService - Handles waiter operations
 * T472-T473: Order acceptance/rejection and table management
 */
class WaiterService {
    /**
     * T472: Get pending orders (awaiting waiter confirmation)
     * @returns {Promise<Array>} Pending orders
     */
    async getPendingOrders() {
        const orders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                        location: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                orderItems: {
                    include: {
                        menuItem: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc', // Oldest first
            },
        });

        return orders.map((order) => ({
            ...order,
            guestName: order.guestName || order.customer?.name || 'Guest',
            totalAmount: Number(order.totalAmount),
        }));
    }

    /**
     * Get orders that are ready to be served
     * @returns {Promise<Array>} Orders with status READY
     */
    async getReadyOrders() {
        const orders = await prisma.order.findMany({
            where: {
                status: 'READY',
            },
            include: {
                table: {
                    select: {
                        tableNumber: true,
                        location: true,
                    },
                },
                orderItems: {
                    include: {
                        menuItem: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'asc',
            },
        });

        return orders.map((order) => ({
            ...order,
            guestName: order.guestName || 'Guest',
        }));
    }

    /**
     * Get orders that have requested bill
     * @returns {Promise<Array>} Orders with billRequested = true
     */
    async getBillRequestedOrders() {
        const orders = await prisma.order.findMany({
            where: {
                billRequested: true,
                status: {
                    notIn: ['COMPLETED', 'CANCELLED'],
                },
            },
            include: {
                table: {
                    select: {
                        tableNumber: true,
                        location: true,
                    },
                },
            },
            orderBy: {
                billRequestedAt: 'asc',
            },
        });

        return orders;
    }

    /**
     * T473: Accept order (move from PENDING to CONFIRMED)
     * @param {string} orderId - Order ID
     * @param {string} waiterId - Waiter user ID
     * @returns {Promise<Object>} Updated order
     */
    async acceptOrder(orderId, waiterId) {
        // Validate order exists and is pending
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'PENDING') {
            throw new Error(`Cannot accept order with status: ${order.status}`);
        }

        // Update order status to CONFIRMED and assign waiter
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                waiterId,
                updatedAt: new Date(),
            },
            include: {
                table: {
                    select: {
                        tableNumber: true,
                        location: true,
                    },
                },
                waiter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        // Update table status to OCCUPIED
        await prisma.table.update({
            where: { id: order.tableId },
            data: {
                status: 'OCCUPIED',
            },
        });

        // T411: Emit socket event for order confirmed (notify kitchen)
        socketService.emitOrderConfirmed(updatedOrder);

        return updatedOrder;
    }

    /**
     * T473: Reject order (move from PENDING to CANCELLED)
     * @param {string} orderId - Order ID
     * @param {string} reason - Rejection reason
     * @returns {Promise<Object>} Updated order
     */
    async rejectOrder(orderId, reason) {
        // Validate order exists and is pending
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'PENDING') {
            throw new Error(`Cannot reject order with status: ${order.status}`);
        }

        // Update order status to CANCELLED
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED',
                notes: reason || 'Rejected by waiter',
                updatedAt: new Date(),
            },
            include: {
                table: {
                    select: {
                        tableNumber: true,
                    },
                },
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        // Emit socket event for order cancelled
        socketService.emitOrderCancelled(updatedOrder);

        return updatedOrder;
    }

    /**
     * Mark order as SERVED
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Updated order
     */
    async markOrderServed(orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'READY') {
            throw new Error('Only READY orders can be marked as SERVED');
        }

        return await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'SERVED',
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Get table status overview for waiter dashboard
     * @returns {Promise<Array>} Tables with current status
     */
    async getTableStatus() {
        const tables = await prisma.table.findMany({
            where: {
                isActive: true,
            },
            include: {
                orders: {
                    where: {
                        status: {
                            notIn: ['COMPLETED', 'CANCELLED'],
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1, // Get most recent active order
                },
            },
            orderBy: {
                tableNumber: 'asc',
            },
        });

        return tables.map((table) => {
            const activeOrder = table.orders[0];
            return {
                id: table.id,
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                location: table.location,
                status: table.status,
                activeOrder: activeOrder ? {
                    id: activeOrder.id,
                    orderNumber: activeOrder.orderNumber,
                    status: activeOrder.status,
                    guestName: activeOrder.guestName || 'Guest',
                    totalAmount: Number(activeOrder.totalAmount),
                    billRequested: activeOrder.billRequested,
                } : null,
            };
        });
    }
}

export default WaiterService;
