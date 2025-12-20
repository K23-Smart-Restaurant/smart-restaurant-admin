import { apiClient } from './api';

export interface RevenueData {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface RevenueReport {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    dailyRevenue: RevenueData[];
}

export interface TopRevenueItem {
    menuItemId: string;
    menuItemName: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
}

export interface OrderAnalytics {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    averagePreparationTime: number;
    peakHours: {
        hour: number;
        orderCount: number;
    }[];
}

export const reportService = {
    // Get revenue report for a date range
    getRevenue: async (startDate: Date, endDate: Date): Promise<RevenueReport> => {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
        const response = await apiClient.get<RevenueReport>(`/reports/revenue?${params.toString()}`);
        return response.data;
    },

    // Get top revenue items
    getTopItems: async (limit: number = 10): Promise<TopRevenueItem[]> => {
        const response = await apiClient.get<TopRevenueItem[]>(`/reports/top-items?limit=${limit}`);
        return response.data;
    },

    // Get order analytics
    getAnalytics: async (): Promise<OrderAnalytics> => {
        const response = await apiClient.get<OrderAnalytics>('/reports/analytics');
        return response.data;
    },
};
