import prisma from '../lib/prisma.js';

class OrderService {
  async getOrders(filters) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.tableId) {
      where.tableId = filters.tableId;
    }

    const orderBy = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        customer: { select: { id: true, name: true, email: true } },
        waiter: { select: { id: true, name: true } },
        orderItems: {
          include: { menuItem: true },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Add prep time tracking and alerts
    const prepTimeThreshold = parseInt(process.env.PREP_TIME_THRESHOLD_MINUTES) || 30; // Default 30 minutes
    const now = new Date();

    const data = orders.map((order) => {
      const elapsedMinutes = Math.floor((now - order.createdAt) / (1000 * 60));
      const isDelayed =
        ['CONFIRMED', 'PREPARING'].includes(order.status) && elapsedMinutes > prepTimeThreshold;

      return {
        ...order,
        elapsedMinutes,
        isDelayed,
        prepTimeThreshold,
      };
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOrderById(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        customer: { select: { id: true, name: true, email: true } },
        waiter: { select: { id: true, name: true } },
        orderItems: {
          include: { menuItem: true },
        },
      },
    });

    if (!order) return null;

    // Add prep time tracking
    const prepTimeThreshold = parseInt(process.env.PREP_TIME_THRESHOLD_MINUTES) || 30;
    const now = new Date();
    const elapsedMinutes = Math.floor((now - order.createdAt) / (1000 * 60));
    const isDelayed =
      ['CONFIRMED', 'PREPARING'].includes(order.status) && elapsedMinutes > prepTimeThreshold;

    return {
      ...order,
      elapsedMinutes,
      isDelayed,
      prepTimeThreshold,
    };
  }

  async updateOrderStatus(id, status) {
    // Validate status transition
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED'],
      SERVED: ['PAID'],
      PAID: [],
      CANCELLED: [],
    };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    if (!validTransitions[order.status].includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}

export default OrderService;
