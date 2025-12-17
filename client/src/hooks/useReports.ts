import { useState } from "react";

export type DateRange = "7days" | "30days" | "3months";

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopItem {
  name: string;
  orderCount: number;
  revenue: number;
}

export interface PeakHourData {
  hour: string;
  orders: number;
}

// Generate 90 days of mock revenue data
const generateRevenueData = (): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic revenue with some variation
    const baseRevenue = 400 + Math.random() * 200;
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1.0;

    const revenue = Math.round(baseRevenue * weekendMultiplier);
    const orders = Math.round(revenue / 12); // Average order ~$12

    data.push({
      date: date.toISOString().split("T")[0],
      revenue,
      orders,
    });
  }

  return data;
};

// Mock top items data
const mockTopItems: TopItem[] = [
  { name: "Classic Burger", orderCount: 145, revenue: 1883.55 },
  { name: "Margherita Pizza", orderCount: 128, revenue: 1792.0 },
  { name: "Caesar Salad", orderCount: 98, revenue: 881.02 },
  { name: "Grilled Salmon", orderCount: 87, revenue: 2173.13 },
  { name: "Ribeye Steak", orderCount: 76, revenue: 1519.24 },
  { name: "Chicken Parmesan", orderCount: 71, revenue: 1313.5 },
  { name: "Spaghetti Carbonara", orderCount: 65, revenue: 975.0 },
  { name: "Fish and Chips", orderCount: 58, revenue: 1015.0 },
  { name: "BBQ Ribs", orderCount: 52, revenue: 1170.0 },
  { name: "Vegetable Stir Fry", orderCount: 49, revenue: 661.5 },
];

// Mock peak hours data (24 hours)
const mockPeakHours: PeakHourData[] = [
  { hour: "12 AM", orders: 2 },
  { hour: "1 AM", orders: 1 },
  { hour: "2 AM", orders: 0 },
  { hour: "3 AM", orders: 0 },
  { hour: "4 AM", orders: 0 },
  { hour: "5 AM", orders: 1 },
  { hour: "6 AM", orders: 3 },
  { hour: "7 AM", orders: 8 },
  { hour: "8 AM", orders: 12 },
  { hour: "9 AM", orders: 15 },
  { hour: "10 AM", orders: 18 },
  { hour: "11 AM", orders: 25 },
  { hour: "12 PM", orders: 42 },
  { hour: "1 PM", orders: 38 },
  { hour: "2 PM", orders: 28 },
  { hour: "3 PM", orders: 18 },
  { hour: "4 PM", orders: 15 },
  { hour: "5 PM", orders: 22 },
  { hour: "6 PM", orders: 35 },
  { hour: "7 PM", orders: 45 },
  { hour: "8 PM", orders: 40 },
  { hour: "9 PM", orders: 28 },
  { hour: "10 PM", orders: 18 },
  { hour: "11 PM", orders: 8 },
];

export const useReports = () => {
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const allRevenueData = generateRevenueData();

  // Get revenue data filtered by date range
  const getRevenueData = (range?: DateRange): RevenueDataPoint[] => {
    const selectedRange = range || dateRange;
    let daysToShow = 30;

    switch (selectedRange) {
      case "7days":
        daysToShow = 7;
        break;
      case "30days":
        daysToShow = 30;
        break;
      case "3months":
        daysToShow = 90;
        break;
    }

    return allRevenueData.slice(-daysToShow);
  };

  // Get top items (with limit)
  const getTopItems = (limit: number = 10): TopItem[] => {
    return mockTopItems.slice(0, limit);
  };

  // Get peak hours data
  const getPeakHours = (): PeakHourData[] => {
    return mockPeakHours;
  };

  // Calculate total revenue for current date range
  const getTotalRevenue = (): number => {
    const data = getRevenueData();
    return data.reduce((sum, item) => sum + item.revenue, 0);
  };

  // Calculate total orders for current date range
  const getTotalOrders = (): number => {
    const data = getRevenueData();
    return data.reduce((sum, item) => sum + item.orders, 0);
  };

  // Calculate average order value
  const getAverageOrderValue = (): number => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  // Get most popular item
  const getMostPopularItem = (): TopItem | null => {
    return mockTopItems[0] || null;
  };

  return {
    revenueData: getRevenueData(),
    topItems: mockTopItems,
    peakHours: mockPeakHours,
    dateRange,
    setDateRange,
    getRevenueData,
    getTopItems,
    getPeakHours,
    getTotalRevenue,
    getTotalOrders,
    getAverageOrderValue,
    getMostPopularItem,
  };
};
