import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DateRange } from "../../hooks/useReports";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orders: number }>;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  dateRange,
  onDateRangeChange,
}) => {
  // Calculate total revenue for selected period
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-charcoal mb-2">
            {formatDate(payload[0].payload.date)}
          </p>
          <p className="text-sm text-gray-700">
            Revenue:{" "}
            <span className="font-bold text-green-600">
              {formatCurrency(payload[0].value)}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            Orders:{" "}
            <span className="font-bold text-blue-600">
              {payload[0].payload.orders}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with total and date range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">
            Revenue Over Time
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Revenue:{" "}
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </span>
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => onDateRangeChange("7days")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dateRange === "7days"
                ? "bg-naples text-charcoal shadow"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-antiflash"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => onDateRangeChange("30days")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dateRange === "30days"
                ? "bg-naples text-charcoal shadow"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-antiflash"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => onDateRangeChange("3months")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dateRange === "3months"
                ? "bg-naples text-charcoal shadow"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-antiflash"
            }`}
          >
            3 Months
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#666"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#666"
              style={{ fontSize: "12px" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
