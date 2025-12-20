import prisma from '../lib/prisma.js';

class ReportService {
    async getRevenueReport(startDate, endDate) {
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: "PAID",
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
        });

        const totalRevenue = orders.reduce(
            (sum, order) => sum + Number(order.totalAmount),
            0
        );

        return {
            totalRevenue,
            totalOrders: orders.length,
            averageOrderValue: totalRevenue / orders.length || 0,
            startDate,
            endDate,
        };
    }

    async getTopRevenueItems(limit = 10) {
        const items = await prisma.orderItem.groupBy({
            by: ["menuItemId"],
            _sum: {
                subtotal: true,
                quantity: true,
            },
            orderBy: {
                _sum: {
                    subtotal: "desc",
                },
            },
            take: limit,
        });

        // Fetch menu item details
        const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
                const menuItem = await prisma.menuItem.findUnique({
                    where: { id: item.menuItemId },
                    select: { id: true, name: true, category: true },
                });

                return {
                    ...menuItem,
                    revenue: Number(item._sum.subtotal || 0),
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
            const date = order.createdAt.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Peak hours
        const ordersByHour = orders.reduce((acc, order) => {
            const hour = order.createdAt.getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        return {
            ordersPerDay: ordersByDate,
            peakHours: ordersByHour,
        };
    }
}

export default ReportService;
