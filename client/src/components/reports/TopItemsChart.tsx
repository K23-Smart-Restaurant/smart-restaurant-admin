import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { TopItem } from '../../hooks/useReports';

// Tooltip props type
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TopItem; value: number }>;
}

// Format currency
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface TopItemsChartProps {
  data: TopItem[];
}

export const TopItemsChart: React.FC<TopItemsChartProps> = ({ data }) => {
  const { t } = useTranslation(['reports']);
  const [selectedItem, setSelectedItem] = useState<TopItem | null>(null);

  // Custom tooltip component that uses translations
  const CustomTooltipWithTranslation: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
          <p className="mb-2 text-sm font-bold text-charcoal">{item.menuItemName}</p>
          <p className="text-sm text-gray-700">
            {t('reports:topItemsChart.ordersLabel')}{' '}
            <span className="font-bold text-blue-600">{item.orderCount}</span>
          </p>
          <p className="text-sm text-gray-700">
            {t('reports:topItemsChart.revenueLabel')}{' '}
            <span className="font-bold text-green-600">{formatCurrency(item.totalRevenue)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Generate color gradient (green to blue)
  const getBarColor = (index: number) => {
    const colors = [
      '#10b981', // Green (top item)
      '#14b8a6', // Teal
      '#06b6d4', // Cyan
      '#0ea5e9', // Sky blue
      '#3b82f6', // Blue
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#a855f7', // Purple
      '#d946ef', // Fuchsia
      '#ec4899', // Pink
    ];
    return colors[index] || colors[colors.length - 1];
  };

  // Handle bar click - fix type by using unknown and type guard
  const handleBarClick = (data: unknown) => {
    // Type guard to check if data has the expected structure
    if (data && typeof data === 'object' && 'menuItemId' in data) {
      setSelectedItem(data as TopItem);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md print:shadow-none print:border print:border-gray-300 print:p-4">
      {/* Header */}
      <div className="mb-6 print:mb-3">
        <h2 className="text-2xl font-bold text-charcoal print:text-xl">
          {t('reports:topItemsChart.title')}
        </h2>
        <p className="mt-1 text-sm text-gray-600 print:text-xs">
          {t('reports:topItemsChart.subtitle')}
        </p>
      </div>

      {/* Selected Item Info */}
      {selectedItem && (
        <div className="p-4 mb-4 border-l-4 rounded bg-naples/20 border-naples print:hidden">
          <p className="text-sm font-semibold text-charcoal">{selectedItem.menuItemName}</p>
          <p className="mt-1 text-xs text-gray-600">
            {selectedItem.orderCount} {t('reports:metrics.orders')} •{' '}
            {formatCurrency(selectedItem.totalRevenue)}{' '}
            {t('reports:revenueChart.revenue').toLowerCase()}
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="w-full print:w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis
              type="category"
              dataKey="menuItemName"
              stroke="#666"
              style={{ fontSize: '12px' }}
              width={110}
            />
            <Tooltip content={<CustomTooltipWithTranslation />} />
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
      <div className="mt-4 text-center print:hidden">
        <p className="text-xs text-gray-500">{t('reports:topItemsChart.clickInfo')}</p>
      </div>
    </div>
  );
};
