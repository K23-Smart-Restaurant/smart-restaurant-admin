import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DateRange } from '../../hooks/useReports';

// Type for revenue data point
type RevenueDataPoint = { date: string; revenue: number; orders: number };

// Tooltip props type
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RevenueDataPoint; value: number }>;
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format currency
const formatCurrency = (value: number) => {
  return `$${value.toLocaleString()}`;
};

// Custom tooltip component (defined outside to avoid recreation on each render)
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-charcoal mb-2">
          {formatDate(data.date)}
        </p>
        <p className="text-sm text-gray-700">
          Revenue:{' '}
          <span className="font-bold text-green-600">{formatCurrency(payload[0].value)}</span>
        </p>
        <p className="text-sm text-gray-700">
          Orders: <span className="font-bold text-blue-600">{data.orders}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface RevenueChartProps {
  data: RevenueDataPoint[];
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border print:border-gray-300 print:p-4">
      {/* Header with total and date range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:mb-3">
        <div>
          <h2 className="text-2xl font-bold text-charcoal print:text-xl">Revenue Over Time</h2>
          <p className="text-sm text-gray-600 mt-1 print:text-xs">
            Total Revenue:{' '}
            <span className="text-2xl font-bold text-green-600 print:text-lg">
              {formatCurrency(totalRevenue)}
            </span>
          </p>
        </div>

        {/* Date Range Selector - Hide on Print */}
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => onDateRangeChange('7days')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dateRange === '7days'
                ? 'bg-naples text-charcoal shadow'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-antiflash'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => onDateRangeChange('30days')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dateRange === '30days'
                ? 'bg-naples text-charcoal shadow'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-antiflash'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => onDateRangeChange('3months')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dateRange === '3months'
                ? 'bg-naples text-charcoal shadow'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-antiflash'
            }`}
          >
            3 Months
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full print:w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis tickFormatter={formatCurrency} stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
