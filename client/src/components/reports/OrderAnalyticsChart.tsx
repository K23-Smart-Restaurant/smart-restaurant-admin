import React, { useState, Fragment } from "react";
import { Tab } from "@headlessui/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { RevenueDataPoint, PeakHourData } from "../../hooks/useReports";

interface OrderAnalyticsChartProps {
  ordersPerDay: RevenueDataPoint[];
  peakHours: PeakHourData[];
}

export const OrderAnalyticsChart: React.FC<OrderAnalyticsChartProps> = ({
  ordersPerDay,
  peakHours,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  // Calculate average orders per day
  const avgOrdersPerDay =
    ordersPerDay.length > 0
      ? Math.round(
          ordersPerDay.reduce((sum, item) => sum + item.orders, 0) /
            ordersPerDay.length
        )
      : 0;

  // Calculate average orders per hour
  const avgOrdersPerHour =
    peakHours.length > 0
      ? Math.round(
          peakHours.reduce((sum, item) => sum + item.orders, 0) /
            peakHours.length
        )
      : 0;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Custom tooltip for orders per day
  const OrdersTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-charcoal mb-2">
            {formatDate(payload[0].payload.date)}
          </p>
          <p className="text-sm text-gray-700">
            Orders:{" "}
            <span className="font-bold text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for peak hours
  const PeakHoursTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const isPeak = payload[0].value > avgOrdersPerHour;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-charcoal mb-2">
            {payload[0].payload.hour}
          </p>
          <p className="text-sm text-gray-700">
            Orders:{" "}
            <span
              className={`font-bold ${
                isPeak ? "text-orange-600" : "text-blue-600"
              }`}
            >
              {payload[0].value}
            </span>
          </p>
          {isPeak && (
            <p className="text-xs text-orange-600 mt-1">⭐ Peak Hour</p>
          )}
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { name: "Orders per Day", value: "orders-per-day" },
    { name: "Peak Hours", value: "peak-hours" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Order Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Detailed order patterns and trends
        </p>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-lg bg-antiflash p-1 mb-6">
          {tabs.map((tab) => (
            <Tab key={tab.value} as={Fragment}>
              {({ selected }) => (
                <button
                  className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${
                    selected
                      ? "bg-naples text-charcoal shadow"
                      : "text-gray-600 hover:bg-white hover:text-charcoal"
                  }`}
                >
                  {tab.name}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Orders per Day Chart */}
          <Tab.Panel>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Average Orders per Day:{" "}
                <span className="font-bold text-blue-600">
                  {avgOrdersPerDay}
                </span>
              </p>
            </div>
            <div className="w-full" style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ordersPerDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#666"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip content={<OrdersTooltip />} />
                  <ReferenceLine
                    y={avgOrdersPerDay}
                    stroke="#ff9800"
                    strokeDasharray="5 5"
                    label={{
                      value: "Average",
                      position: "right",
                      fill: "#ff9800",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>

          {/* Peak Hours Chart */}
          <Tab.Panel>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Average Orders per Hour:{" "}
                <span className="font-bold text-blue-600">
                  {avgOrdersPerHour}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Peak hours (above average) are highlighted in orange
              </p>
            </div>
            <div className="w-full" style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakHours}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    stroke="#666"
                    style={{ fontSize: "11px" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip content={<PeakHoursTooltip />} />
                  <ReferenceLine
                    y={avgOrdersPerHour}
                    stroke="#ff9800"
                    strokeDasharray="5 5"
                    label={{
                      value: "Average",
                      position: "right",
                      fill: "#ff9800",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="orders" radius={[8, 8, 0, 0]}>
                    {peakHours.map((entry, index) => (
                      <rect
                        key={`bar-${index}`}
                        fill={
                          entry.orders > avgOrdersPerHour
                            ? "#fb923c"
                            : "#3b82f6"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
