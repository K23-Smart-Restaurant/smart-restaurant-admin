import prisma from '../lib/prisma.js';
import socketService from './SocketService.js';
import { publishEvent, REDIS_CHANNELS } from '../config/redis.config.js';

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
        status: 'BILL_REQUESTED',
        paymentStatus: 'PENDING',
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
    // Publish to Redis for customer app
    publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
      order: updatedOrder,
      orderId,
      newStatus: 'CONFIRMED',
    });

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
    // Publish to Redis for customer app
    publishEvent(REDIS_CHANNELS.ORDER_CANCELLED, {
      order: updatedOrder,
      orderId,
      newStatus: 'CANCELLED',
    });

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

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SERVED',
        updatedAt: new Date(),
      },
      include: {
        table: { select: { id: true, tableNumber: true } },
      },
    });

    // Publish to Redis for customer app
    publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
      order: updatedOrder,
      orderId,
      newStatus: 'SERVED',
    });

    return updatedOrder;
  }

  /**
   * Process cash/card payment at restaurant
   * @param {string} orderId - Order ID
   * @param {string} waiterId - Waiter user ID
   * @param {string} paymentMethod - Payment method ('CASH' or 'CARD')
   * @param {number} amountPaid - Amount paid by customer
   * @returns {Promise<Object>} Updated order
   */
  async processCashPayment(orderId, waiterId, paymentMethod = 'CASH', amountPaid) {
    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate bill has been requested
    if (!order.billRequested) {
      throw new Error('Bill must be requested before payment can be processed');
    }

    // Validate order is not already paid
    if (order.paymentStatus === 'PAID') {
      throw new Error('Order has already been paid');
    }

    // Validate amount
    if (amountPaid < order.totalAmount) {
      throw new Error(
        `Insufficient payment. Expected: $${order.totalAmount}, Received: $${amountPaid}`
      );
    }

    // Update order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order status to COMPLETED and mark as PAID
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'COMPLETED',
          paidAt: new Date(),
          waiterId,
          updatedAt: new Date(),
        },
        include: {
          table: {
            select: {
              id: true,
              tableNumber: true,
              location: true,
            },
          },
          orderItems: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
          waiter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId,
          amount: amountPaid,
          currency: 'USD',
          status: 'SUCCESS',
          paymentMethod, // 'CASH' or 'CARD'
          stripePaymentIntentId: `manual_${orderId}_${Date.now()}`, // Unique ID for manual payments
          completedAt: new Date(),
          metadata: {
            processedBy: waiterId,
            paymentType: 'RESTAURANT',
            amountPaid,
            change: amountPaid - order.totalAmount,
          },
        },
      });

      // Update table status to AVAILABLE
      await tx.table.update({
        where: { id: order.tableId },
        data: {
          status: 'AVAILABLE',
        },
      });

      return updatedOrder;
    });

    // Emit socket event for payment completed
    socketService.emitPaymentCompleted(result);
    // Publish to Redis for customer app
    publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
      order: result,
      orderId,
      newStatus: 'COMPLETED',
      paymentStatus: 'PAID',
    });

    return result;
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
        activeOrder: activeOrder
          ? {
              id: activeOrder.id,
              orderNumber: activeOrder.orderNumber,
              status: activeOrder.status,
              guestName: activeOrder.guestName || 'Guest',
              totalAmount: Number(activeOrder.totalAmount),
              billRequested: activeOrder.billRequested,
            }
          : null,
      };
    });
  }
}

export default WaiterService;
