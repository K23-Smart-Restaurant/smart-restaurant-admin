import prisma from "../lib/prisma.js";
import socketService from "./SocketService.js";
import { publishEvent, REDIS_CHANNELS } from "../config/redis.config.js";

/**
 * KitchenService - Handles kitchen display system operations
 * T402-T406: Kitchen order management and status updates
 */
class KitchenService {
  /**
   * T402: Get active orders for kitchen display (CONFIRMED, PREPARING, READY)
   * @returns {Promise<Array>} Active orders with items and modifiers
   */
  async getActiveOrders() {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PREPARING", "READY"],
        },
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
          },
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                preparationTime: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest orders first (FIFO)
      },
    });

    // Add elapsed time calculation for each order
    const now = new Date();
    return orders.map((order) => {
      const elapsedMinutes = Math.floor((now - order.createdAt) / (1000 * 60));

      // Determine urgency level based on elapsed time
      let urgency = "normal";
      if (elapsedMinutes > 45) {
        urgency = "critical"; // Red
      } else if (elapsedMinutes > 30) {
        urgency = "warning"; // Yellow
      } else {
        urgency = "normal"; // Green
      }

      return {
        ...order,
        elapsedMinutes,
        urgency,
        guestName: order.guestName || order.customer?.name || "Guest",
      };
    });
  }

  /**
   * T404: Update order status with validation
   * Valid transitions: CONFIRMED -> PREPARING -> READY
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // T404: Validate status transition for kitchen
    const validTransitions = {
      CONFIRMED: ["PREPARING"],
      PREPARING: ["READY"],
      READY: ["SERVED"], // Waiter can mark as served
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${order.status} -> ${newStatus}`
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
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
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // If status is PREPARING, update all order items to COOKING
    if (newStatus === "PREPARING") {
      await prisma.orderItem.updateMany({
        where: { orderId },
        data: { itemStatus: "COOKING" },
      });
      // T411: Emit socket event for order preparing
      socketService.emitOrderPreparing(updatedOrder);
      // Publish to Redis for customer app
      publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
        order: updatedOrder,
        orderId: orderId,
        newStatus: "PREPARING",
      });
    }

    // If status is READY, update all order items to READY
    if (newStatus === "READY") {
      await prisma.orderItem.updateMany({
        where: { orderId },
        data: { itemStatus: "READY" },
      });
      // T412: Emit socket event for order ready (notify waiters)
      socketService.emitOrderReady(updatedOrder);
      // Publish to Redis for customer app
      publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
        order: updatedOrder,
        orderId: orderId,
        newStatus: "READY",
      });
    }

    return updatedOrder;
  }

  /**
   * T406: Update individual order item status
   * @param {string} orderId - Order ID
   * @param {string} itemId - Order item ID
   * @param {string} itemStatus - New item status (QUEUED, COOKING, READY)
   * @returns {Promise<Object>} Updated order item
   */
  async updateOrderItemStatus(orderId, itemId, itemStatus) {
    // Validate order item exists and belongs to order
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId: orderId,
      },
      include: {
        order: {
          include: {
            table: true,
          },
        },
        menuItem: true,
      },
    });

    if (!orderItem) {
      throw new Error("Order item not found or does not belong to this order");
    }

    // Validate item status
    const validItemStatuses = ["QUEUED", "COOKING", "READY"];
    if (!validItemStatuses.includes(itemStatus)) {
      throw new Error(`Invalid item status: ${itemStatus}`);
    }

    // Update item status
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        itemStatus,
      },
      include: {
        menuItem: true,
      },
    });

    // Publish orderItemStatusUpdated to Redis for customer app
    publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
      orderId,
      order: orderItem.order,
      itemId,
      itemStatus,
      menuItemName: orderItem.menuItem?.name,
      type: "ORDER_ITEM_STATUS_UPDATED",
    });

    // Check if all items are ready, if so, update order status to READY
    const allItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const allReady = allItems.every((item) => item.itemStatus === "READY");
    if (allReady) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "READY" },
        include: {
          table: true,
          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
      });

      // Emit order:ready to waiter room and publish to Redis
      socketService.emitOrderReady(updatedOrder);
      publishEvent(REDIS_CHANNELS.ORDER_STATUS_UPDATED, {
        order: updatedOrder,
        orderId: orderId,
        newStatus: "READY",
      });
    }

    return updatedItem;
  }

  /**
   * Get order history (last 10 completed orders) for kitchen recall
   * @returns {Promise<Array>} Recently completed orders
   */
  async getOrderHistory() {
    return await prisma.order.findMany({
      where: {
        status: {
          in: ["SERVED", "COMPLETED"],
        },
      },
      include: {
        table: {
          select: {
            tableNumber: true,
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
        updatedAt: "desc",
      },
      take: 10,
    });
  }
}

export default KitchenService;
