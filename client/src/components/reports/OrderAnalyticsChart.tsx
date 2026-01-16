import React, { useState, Fragment, useMemo } from 'react';
import { Tab } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
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
} from 'recharts';

// Type definitions for chart data
type OrdersPerDayData = { date: string; orders: number };
type PeakHourData = { hour: string; orders: number };

// Tooltip prop types for Recharts
interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: OrdersPerDayData | PeakHourData; value: number }>;
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface OrderAnalyticsChartProps {
  ordersPerDay: OrdersPerDayData[];
  peakHours: PeakHourData[];
}

export const OrderAnalyticsChart: React.FC<OrderAnalyticsChartProps> = ({
  ordersPerDay,
  peakHours,
}) => {
  const { t } = useTranslation(['reports']);
  const [selectedTab, setSelectedTab] = useState(0);

  // Custom tooltip for orders per day with translations
  const OrdersTooltipWithTranslation = useMemo(
    () =>
      function OrdersTooltip({ active, payload }: TooltipProps) {
        if (active && payload && payload.length) {
          const data = payload[0].payload as OrdersPerDayData;
          return (
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
              <p className="text-sm font-semibold text-charcoal mb-2">{formatDate(data.date)}</p>
              <p className="text-sm text-gray-700">
                {t('reports:orderAnalyticsChart.ordersPerDay.orders')}{' '}
                <span className="font-bold text-blue-600">{payload[0].value}</span>
              </p>
            </div>
          );
        }
        return null;
      },
    [t]
  );

  // Custom tooltip for peak hours with translations
  const PeakHoursTooltipWithTranslation = useMemo(
    () =>
      function PeakHoursTooltip({
        active,
        payload,
        avgOrdersPerHour,
      }: TooltipProps & { avgOrdersPerHour: number }) {
        if (active && payload && payload.length) {
          const data = payload[0].payload as PeakHourData;
          const isPeak = (payload[0].value as number) > avgOrdersPerHour;
          return (
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
              <p className="text-sm font-semibold text-charcoal mb-2">{data.hour}</p>
              <p className="text-sm text-gray-700">
                {t('reports:orderAnalyticsChart.peakHours.orders')}{' '}
                <span className={`font-bold ${isPeak ? 'text-orange-600' : 'text-blue-600'}`}>
                  {payload[0].value}
                </span>
              </p>
              {isPeak && (
                <p className="text-xs text-orange-600 mt-1">
                  ⭐ {t('reports:orderAnalyticsChart.peakHours.peakHour')}
                </p>
              )}
            </div>
          );
        }
        return null;
      },
    [t]
  );

  // Ensure arrays are valid
  const validOrdersPerDay = Array.isArray(ordersPerDay) ? ordersPerDay : [];
  const validPeakHours = Array.isArray(peakHours) ? peakHours : [];

  // Calculate average orders per day
  const avgOrdersPerDay =
    validOrdersPerDay.length > 0
      ? Math.round(
          validOrdersPerDay.reduce((sum, item) => sum + item.orders, 0) / validOrdersPerDay.length
        )
      : 0;

  // Calculate average orders per hour
  const avgOrdersPerHour =
    validPeakHours.length > 0
      ? Math.round(
          validPeakHours.reduce((sum, item) => sum + item.orders, 0) / validPeakHours.length
        )
      : 0;

  const tabs = [
    { name: t('reports:orderAnalyticsChart.tabs.ordersPerDay'), value: 'orders-per-day' },
    { name: t('reports:orderAnalyticsChart.tabs.peakHours'), value: 'peak-hours' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border print:border-gray-300 print:p-4">
      {/* Header */}
      <div className="mb-6 print:mb-3">
        <h2 className="text-2xl font-bold text-charcoal print:text-xl">
          {t('reports:orderAnalyticsChart.title')}
        </h2>
        <p className="text-sm text-gray-600 mt-1 print:text-xs">
          {t('reports:orderAnalyticsChart.subtitle')}
        </p>
      </div>

      {/* Tabs - Hide on Print */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-lg bg-antiflash p-1 mb-6 print:hidden">
          {tabs.map((tab) => (
            <Tab key={tab.value} as={Fragment}>
              {({ selected }) => (
                <button
                  className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${
                    selected
                      ? 'bg-naples text-charcoal shadow'
                      : 'text-gray-600 hover:bg-white hover:text-charcoal'
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
          <Tab.Panel className="print:block">
            <div className="mb-4 print:mb-2">
              <p className="text-sm text-gray-600 print:text-xs">
                {t('reports:orderAnalyticsChart.ordersPerDay.avgLabel')}{' '}
                <span className="font-bold text-blue-600">{avgOrdersPerDay}</span>
              </p>
            </div>
            <div className="w-full print:w-full" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={validOrdersPerDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip content={OrdersTooltipWithTranslation} />
                  <ReferenceLine
                    y={avgOrdersPerDay}
                    stroke="#ff9800"
                    strokeDasharray="5 5"
                    label={{
                      value: t('reports:orderAnalyticsChart.ordersPerDay.avgReference'),
                      position: 'right',
                      fill: '#ff9800',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>

          {/* Peak Hours Chart */}
          <Tab.Panel className="print:hidden">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t('reports:orderAnalyticsChart.peakHours.avgLabel')}{' '}
                <span className="font-bold text-blue-600">{avgOrdersPerHour}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('reports:orderAnalyticsChart.peakHours.note')}
              </p>
            </div>
            <div className="w-full" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={validPeakHours} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    stroke="#666"
                    style={{ fontSize: '11px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip
                    content={(props) => (
                      <PeakHoursTooltipWithTranslation
                        {...props}
                        avgOrdersPerHour={avgOrdersPerHour}
                      />
                    )}
                  />
                  <ReferenceLine
                    y={avgOrdersPerHour}
                    stroke="#ff9800"
                    strokeDasharray="5 5"
                    label={{
                      value: t('reports:orderAnalyticsChart.peakHours.avgReference'),
                      position: 'right',
                      fill: '#ff9800',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="orders" radius={[8, 8, 0, 0]}>
                    {validPeakHours.map((entry, index) => (
                      <rect
                        key={`bar-${index}`}
                        fill={entry.orders > avgOrdersPerHour ? '#fb923c' : '#3b82f6'}
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
