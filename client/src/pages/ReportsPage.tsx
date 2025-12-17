import React from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Award,
  Download,
  Printer,
} from "lucide-react";
import { useReports } from "../hooks/useReports";
import { RevenueChart } from "../components/reports/RevenueChart";
import { TopItemsChart } from "../components/reports/TopItemsChart";
import { OrderAnalyticsChart } from "../components/reports/OrderAnalyticsChart";

const ReportsPage: React.FC = () => {
  const {
    revenueData,
    topItems,
    peakHours,
    dateRange,
    setDateRange,
    getTotalRevenue,
    getTotalOrders,
    getAverageOrderValue,
    getMostPopularItem,
  } = useReports();

  // Calculate summary stats
  const totalRevenue = getTotalRevenue();
  const totalOrders = getTotalOrders();
  const avgOrderValue = getAverageOrderValue();
  const mostPopularItem = getMostPopularItem();

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handle export PDF (mock)
  const handleExportPDF = () => {
    alert(
      "PDF export functionality would be implemented here. This would generate a comprehensive report with all charts and data."
    );
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your restaurant performance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-naples hover:bg-arylide text-charcoal rounded-md font-medium transition-all shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white hover:bg-antiflash text-charcoal border border-gray-300 rounded-md font-medium transition-all shadow-md"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange === "7days"
                  ? "Last 7 Days"
                  : dateRange === "30days"
                  ? "Last 30 Days"
                  : "Last 3 Months"}
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange === "7days"
                  ? "Last 7 Days"
                  : dateRange === "30days"
                  ? "Last 30 Days"
                  : "Last 3 Months"}
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Order Value
              </p>
              <p className="text-xs text-gray-500 mt-1">Per transaction</p>
              <p className="text-3xl font-bold text-charcoal mt-2">
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Most Popular Item */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Most Popular Item
              </p>
              <p className="text-xs text-gray-500 mt-1">Best seller</p>
              <p className="text-xl font-bold text-charcoal mt-2 line-clamp-2">
                {mostPopularItem?.name || "N/A"}
              </p>
              {mostPopularItem && (
                <p className="text-xs text-gray-600 mt-1">
                  {mostPopularItem.orderCount} orders
                </p>
              )}
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="mb-8">
        <RevenueChart
          data={revenueData}
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
          }}
        />
      </div>

      {/* Charts Row - 50/50 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Items Chart */}
        <TopItemsChart data={topItems} />

        {/* Order Analytics Chart */}
        <OrderAnalyticsChart ordersPerDay={revenueData} peakHours={peakHours} />
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .shadow-md {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
