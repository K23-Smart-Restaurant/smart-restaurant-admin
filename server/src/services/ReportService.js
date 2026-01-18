import prisma from '../lib/prisma.js';

class ReportService {
  async getRevenueReport(startDate, endDate) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
        paymentStatus: 'PAID',
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Group orders by date
    const ordersByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0 };
      }
      acc[date].revenue += Number(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {});

    // Convert to array and sort by date
    const dailyData = Object.entries(ordersByDate)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fill in missing dates with zero values
    const filledData = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = dailyData.find((d) => d.date === dateStr);

      filledData.push({
        date: dateStr,
        revenue: existing ? existing.revenue : 0,
        orders: existing ? existing.orders : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: totalRevenue / orders.length || 0,
      dailyRevenue: filledData,
      startDate,
      endDate,
    };
  }

  async getTopRevenueItems(limit = 10) {
    const items = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: {
        subtotal: true,
        quantity: true,
      },
      orderBy: {
        _sum: {
          subtotal: 'desc',
        },
      },
      take: limit,
    });

    // Fetch menu item details
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { id: true, name: true, categoryId: true, category: { select: { name: true } } },
        });

        return {
          menuItemId: menuItem?.id || item.menuItemId,
          menuItemName: menuItem?.name || 'Unknown',
          categoryName: menuItem?.category?.name || 'Unknown',
          totalRevenue: Number(item._sum.subtotal || 0),
          orderCount: Number(item._sum.quantity || 0),
        };
      })
    );

    return itemsWithDetails;
  }

  async getOrderAnalytics() {
    // Orders per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date
    const ordersByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by date
    const ordersPerDayArray = Object.entries(ordersByDate)
      .map(([date, orders]) => ({
        date,
        orders,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Peak hours
    const ordersByHour = orders.reduce((acc, order) => {
      const hour = order.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Convert to array with all 24 hours
    const peakHoursArray = [];
    for (let i = 0; i < 24; i++) {
      const hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
      peakHoursArray.push({
        hour: hourStr,
        orders: ordersByHour[i] || 0,
      });
    }

    return {
      ordersPerDay: ordersPerDayArray,
      peakHours: peakHoursArray,
    };
  }
}

export default ReportService;
