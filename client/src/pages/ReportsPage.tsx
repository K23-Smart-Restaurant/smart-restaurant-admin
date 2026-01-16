import React, { useState, useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Award, Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReports, type DateRange } from '../hooks/useReports';
import { RevenueChart } from '../components/reports/RevenueChart';
import { TopItemsChart } from '../components/reports/TopItemsChart';
import { OrderAnalyticsChart } from '../components/reports/OrderAnalyticsChart';
import { PageLoading, StatsSkeleton } from '../components/common/LoadingSpinner';
import { useToastContext } from '../contexts/ToastContext';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation(['reports']);
  const { showSuccess } = useToastContext();
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const { useRevenue, useTopItems, useAnalytics } = useReports();

  // Calculate date range - memoized to prevent infinite re-renders
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    if (dateRange === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (dateRange === '3months') {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    return { startDate, endDate };
  }, [dateRange]); // Only recalculate when dateRange changes

  // Fetch data using the hooks
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenue({ startDate, endDate });
  const { data: topItemsData, isLoading: isLoadingTopItems } = useTopItems(10);
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useAnalytics();

  // Calculate summary stats - MUST be before conditional return
  // Use daily revenue data from API
  const revenueChartData = useMemo(() => {
    if (!revenueData?.dailyRevenue) return [];

    // Map to match chart format
    return revenueData.dailyRevenue.map((item) => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orderCount,
    }));
  }, [revenueData]);

  const totalRevenue = revenueData?.totalRevenue || 0;
  const totalOrders = revenueData?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const topItems = topItemsData || [];
  const mostPopularItem = topItems[0] || null;

  // Transform analytics data to match chart expected format
  const ordersPerDayArray = Array.isArray(analyticsData?.ordersPerDay)
    ? analyticsData.ordersPerDay
    : [];
  const peakHoursArray = Array.isArray(analyticsData?.peakHours) ? analyticsData.peakHours : [];

  // Show loading state AFTER all hooks have been called
  if (isLoadingRevenue || isLoadingTopItems || isLoadingAnalytics) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">{t('reports:title')}</h1>
          <p className="text-gray-600 mt-1">{t('reports:subtitle')}</p>
        </div>
        <StatsSkeleton count={4} />
        <PageLoading message={t('reports:loading.message')} />
      </div>
    );
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

  // Handle export PDF (mock)
  const handleExportPDF = () => {
    showSuccess(t('reports:actions.exportInitiated'), t('reports:actions.exportMessage'));
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Print-only Header */}
      <div className="hidden print:block print-header mb-6">
        <div className="text-center border-b-2 border-charcoal pb-4 mb-6">
          <h1 className="text-4xl font-bold text-charcoal mb-2">{t('reports:print.header')}</h1>
          <p className="text-lg text-gray-600">
            {dateRange === '7days'
              ? t('reports:filters.7days')
              : dateRange === '30days'
                ? t('reports:filters.30days')
                : t('reports:filters.3months')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('reports:print.generatedOn')}{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Screen-only Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">{t('reports:title')}</h1>
          <p className="text-gray-600 mt-1">{t('reports:subtitle')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 no-print">
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-naples hover:bg-arylide text-charcoal rounded-md font-medium transition-all shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('reports:actions.downloadPDF')}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white hover:bg-antiflash text-charcoal border border-gray-300 rounded-md font-medium transition-all shadow-md"
          >
            <Printer className="w-4 h-4 mr-2" />
            {t('reports:actions.print')}
          </button>
        </div>
      </div>

      {/* Print Section Title */}
      <div className="hidden print:block mb-4">
        <h2 className="text-2xl font-bold text-charcoal border-b border-gray-300 pb-2">
          {t('reports:print.sections.kpi')}
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-2 print:gap-4 print:mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border print:border-gray-300 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 print:text-xs">
                {t('reports:metrics.totalRevenue')}
              </p>
              <p className="text-xs text-gray-500 mt-1 print:hidden">
                {dateRange === '7days'
                  ? t('reports:filters.7days')
                  : dateRange === '30days'
                    ? t('reports:filters.30days')
                    : t('reports:filters.3months')}
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2 print:text-2xl print:mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full print:hidden">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border print:border-gray-300 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 print:text-xs">
                {t('reports:metrics.totalOrders')}
              </p>
              <p className="text-xs text-gray-500 mt-1 print:hidden">
                {dateRange === '7days'
                  ? t('reports:filters.7days')
                  : dateRange === '30days'
                    ? t('reports:filters.30days')
                    : t('reports:filters.3months')}
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2 print:text-2xl print:mt-1">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full print:hidden">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border print:border-gray-300 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 print:text-xs">
                {t('reports:metrics.averageOrderValue')}
              </p>
              <p className="text-xs text-gray-500 mt-1 print:text-[10px]">
                {t('reports:metrics.perTransaction')}
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2 print:text-2xl print:mt-1">
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full print:hidden">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Most Popular Item */}
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border print:border-gray-300 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 print:text-xs">
                {t('reports:metrics.mostPopularItem')}
              </p>
              <p className="text-xs text-gray-500 mt-1 print:text-[10px]">
                {t('reports:metrics.bestSeller')}
              </p>
              <p className="text-xl font-bold text-charcoal mt-2 line-clamp-2 print:text-lg print:mt-1">
                {mostPopularItem?.menuItemName || t('reports:metrics.notAvailable')}
              </p>
              {mostPopularItem && (
                <p className="text-xs text-gray-600 mt-1 print:text-[10px]">
                  {mostPopularItem.orderCount} {t('reports:metrics.orders')}
                </p>
              )}
            </div>
            <div className="bg-yellow-100 p-3 rounded-full print:hidden">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Print Section Title */}
      <div className="hidden print:block mb-4 print:page-break-before">
        <h2 className="text-2xl font-bold text-charcoal border-b border-gray-300 pb-2">
          {t('reports:print.sections.revenueTrends')}
        </h2>
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="mb-8 print:mb-6">
        <RevenueChart
          data={revenueChartData}
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
          }}
        />
      </div>

      {/* Print Section Title - Top Items */}
      <div className="hidden print:block mb-4 print:page-break-before">
        <h2 className="text-2xl font-bold text-charcoal border-b border-gray-300 pb-2">
          {t('reports:print.sections.topItems')}
        </h2>
      </div>

      {/* Top Items Chart - Shows alone on print, in grid on screen */}
      <div className="mb-8 print:mb-6 print:block lg:hidden">
        <TopItemsChart data={topItems} />
      </div>

      {/* Print Section Title - Order Analytics */}
      <div className="hidden print:block mb-4 print:page-break-before">
        <h2 className="text-2xl font-bold text-charcoal border-b border-gray-300 pb-2">
          {t('reports:print.sections.orderAnalytics')}
        </h2>
      </div>

      {/* Order Analytics Chart - Shows alone on print, in grid on screen */}
      <div className="mb-8 print:mb-0 print:block lg:hidden">
        <OrderAnalyticsChart ordersPerDay={ordersPerDayArray} peakHours={peakHoursArray} />
      </div>

      {/* Screen-only: Charts Row - 50/50 Split (hidden on print) */}
      <div className="hidden lg:grid grid-cols-2 gap-6 mb-8 print:hidden">
        {/* Top Items Chart */}
        <TopItemsChart data={topItems} />

        {/* Order Analytics Chart */}
        <OrderAnalyticsChart ordersPerDay={ordersPerDayArray} peakHours={peakHoursArray} />
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          /* Remove browser header/footer */
          @page {
            margin: 0.5in;
            size: letter landscape;
          }

          /* Hide non-print elements */
          .no-print,
          nav,
          header,
          footer,
          .print\\:hidden {
            display: none !important;
          }

          /* Body and root styles */
          html, body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
            background: white;
          }

          /* Main container */
          #root, [data-testid="main-content"] {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Remove shadows, adjust borders */
          .shadow-md,
          .shadow-lg,
          .shadow-xl {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }

          /* Ensure backgrounds are printed */
          .bg-green-100,
          .bg-blue-100,
          .bg-purple-100,
          .bg-yellow-100,
          .bg-white {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Page breaks */
          .print\\:page-break-before {
            page-break-before: always;
          }

          /* Avoid breaking inside charts */
          .bg-white {
            page-break-inside: avoid;
          }

          /* Reduce padding on chart cards for better fit */
          .rounded-lg.shadow-md {
            padding: 16pt !important;
          }

          /* Constrain chart heights to fit on page */
          .recharts-responsive-container {
            max-height: 500px !important;
          }

          /* Ensure chart containers don't overflow */
          div[style*="height: 400px"] {
            height: 400px !important;
            max-height: 500px !important;
          }

          div[style*="height: 350px"] {
            height: 350px !important;
            max-height: 450px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
