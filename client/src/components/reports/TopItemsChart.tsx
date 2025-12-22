import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TopItem } from "../../hooks/useReports";

interface TopItemsChartProps {
  data: TopItem[];
}

export const TopItemsChart: React.FC<TopItemsChartProps> = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState<TopItem | null>(null);

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Generate color gradient (green to blue)
  const getBarColor = (index: number) => {
    const colors = [
      "#10b981", // Green (top item)
      "#14b8a6", // Teal
      "#06b6d4", // Cyan
      "#0ea5e9", // Sky blue
      "#3b82f6", // Blue
      "#6366f1", // Indigo
      "#8b5cf6", // Violet
      "#a855f7", // Purple
      "#d946ef", // Fuchsia
      "#ec4899", // Pink
    ];
    return colors[index] || colors[colors.length - 1];
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
          <p className="mb-2 text-sm font-bold text-charcoal">{item.name}</p>
          <p className="text-sm text-gray-700">
            Orders:{" "}
            <span className="font-bold text-blue-600">{item.orderCount}</span>
          </p>
          <p className="text-sm text-gray-700">
            Revenue:{" "}
            <span className="font-bold text-green-600">
              {formatCurrency(item.revenue)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle bar click
  const handleBarClick = (data: any) => {
    setSelectedItem(data);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Top Menu Items</h2>
        <p className="mt-1 text-sm text-gray-600">
          Most ordered items by popularity
        </p>
      </div>

      {/* Selected Item Info */}
      {selectedItem && (
        <div className="p-4 mb-4 border-l-4 rounded bg-naples/20 border-naples">
          <p className="text-sm font-semibold text-charcoal">
            {selectedItem.menuItemName}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {selectedItem.orderCount} orders •{" "}
            {formatCurrency(selectedItem.totalRevenue)} revenue
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#666"
              style={{ fontSize: "12px" }}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="orderCount"
              onClick={handleBarClick}
              cursor="pointer"
              radius={[0, 8, 8, 0]}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Click on a bar to view detailed information
        </p>
      </div>
    </div>
  );
};
