import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  DollarSignIcon,
  LayoutGridIcon,
  UsersIcon,
  TrendingUpIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { PageLoading, StatsSkeleton } from '../components/common/LoadingSpinner';
import { useOrders } from '../hooks/useOrders';
import { useTables } from '../hooks/useTables';
import { useStaff } from '../hooks/useStaff';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage: React.FC = () => {
  // Fetch real data
  const { orders, isLoading: ordersLoading } = useOrders();
  const { tables, statistics: tableStats, isLoading: tablesLoading } = useTables();
  const { staff, isLoading: staffLoading } = useStaff();

  // Calculate dashboard stats
  const dashboardData = useMemo(() => {
    // Total orders count
    const totalOrders = Array.isArray(orders) ? orders.length : 0;

    // Today's orders and revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = Array.isArray(orders) ? orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    }) : [];

    const todayRevenue = todayOrders.reduce((sum, order) => {
      return sum + Number(order.totalAmount || 0);
    }, 0);

    // Table stats
    const totalTables = tableStats?.total || (Array.isArray(tables) ? tables.length : 0);
    const activeTables = tableStats?.occupied || (Array.isArray(tables) ? tables.filter(t => t.status === 'OCCUPIED').length : 0);

    // Staff stats - count active staff only
    const totalStaff = Array.isArray(staff) ? staff.filter(s => s.role !== 'ADMIN' && s.isActive !== false).length : 0;
    const staffOnline = totalStaff; // Assuming all active staff are "online" for now

    return {
      totalOrders,
      todayRevenue,
      activeTables,
      totalTables,
      staffOnline,
      totalStaff,
    };
  }, [orders, tables, tableStats, staff]);

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id.substring(0, 8).toUpperCase(),
        table: order.table?.tableNumber ? `Table ${order.table.tableNumber}` : 'N/A',
        items: order.orderItems?.length || 0,
        amount: Number(order.totalAmount || 0),
        status: order.status,
        time: formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }),
      }));
  }, [orders]);

  const activeTablePercentage = dashboardData.totalTables > 0
    ? (dashboardData.activeTables / dashboardData.totalTables) * 100
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 'bg-naples/20 text-charcoal border border-naples/50';
      case 'PREPARING':
        return 'bg-gray-100 text-charcoal border border-gray-200';
      case 'READY':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'DELIVERED':
      case 'PAID':
        return 'bg-charcoal text-white';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (ordersLoading || tablesLoading || staffLoading) {
    return (
      <div>
        <div className="mb-8 animate-fade-in-down">
          <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-gradient-primary via-gradient-secondary to-gradient-accent bg-clip-text">Dashboard</h1>
          <p className="font-medium text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <StatsSkeleton count={4} />
        <PageLoading message="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8 animate-fade-in-down">
        <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-gradient-primary via-gradient-secondary to-gradient-accent bg-clip-text">Dashboard</h1>
        <p className="font-medium text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Summary cards grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders Card */}
        <div className="relative p-6 overflow-hidden transition-all duration-300 transform bg-gradient-to-br from-naples via-naples to-arylide rounded-2xl shadow-elevation-2 hover:shadow-glow-yellow-lg hover:scale-105 card-hover animate-fade-in-up group" style={{ animationDelay: '0ms' }}>
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-shine group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 transition-transform duration-300 shadow-inner bg-white/30 backdrop-blur-sm rounded-xl group-hover:scale-110">
                <ShoppingCartIcon className="w-6 h-6 text-charcoal" />
              </div>
              <div className="flex items-center px-3 py-1 text-sm font-semibold rounded-full text-charcoal bg-white/20 backdrop-blur-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                Live
              </div>
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-charcoal/80">Total Orders</h3>
            <p className="mt-2 text-4xl font-bold text-charcoal">{dashboardData.totalOrders}</p>
          </div>
        </div>

        {/* Today's Revenue Card */}
        <div className="relative p-6 overflow-hidden transition-all duration-300 transform bg-gradient-to-br from-naples via-naples to-arylide rounded-2xl shadow-elevation-2 hover:shadow-glow-yellow-lg hover:scale-105 card-hover animate-fade-in-up group" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-shine group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 transition-transform duration-300 shadow-inner bg-white/30 backdrop-blur-sm rounded-xl group-hover:scale-110">
                <DollarSignIcon className="w-6 h-6 text-charcoal" />
              </div>
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-charcoal/80">Today's Revenue</h3>
            <p className="mt-2 text-4xl font-bold text-charcoal">
              ${dashboardData.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Active Tables Card */}
        <div className="relative p-6 overflow-hidden transition-all duration-300 transform bg-gradient-to-br from-naples via-naples to-arylide rounded-2xl shadow-elevation-2 hover:shadow-glow-yellow-lg hover:scale-105 card-hover animate-fade-in-up group" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-shine group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 transition-transform duration-300 shadow-inner bg-white/30 backdrop-blur-sm rounded-xl group-hover:scale-110">
                <LayoutGridIcon className="w-6 h-6 text-charcoal" />
              </div>
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-charcoal/80">Active Tables</h3>
            <p className="mt-2 text-4xl font-bold text-charcoal">
              {dashboardData.activeTables}/{dashboardData.totalTables}
            </p>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-charcoal h-2.5 rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${activeTablePercentage}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs font-semibold text-charcoal/80">{activeTablePercentage.toFixed(0)}% occupied</p>
            </div>
          </div>
        </div>

        {/* Staff Online Card */}
        <div className="relative p-6 overflow-hidden transition-all duration-300 transform bg-gradient-to-br from-naples via-naples to-arylide rounded-2xl shadow-elevation-2 hover:shadow-glow-yellow-lg hover:scale-105 card-hover animate-fade-in-up group" style={{ animationDelay: '300ms' }}>
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-shine group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 transition-transform duration-300 shadow-inner bg-white/30 backdrop-blur-sm rounded-xl group-hover:scale-110">
                <UsersIcon className="w-6 h-6 text-charcoal" />
              </div>
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-charcoal/80">Staff Online</h3>
            <p className="mt-2 text-4xl font-bold text-charcoal">
              {dashboardData.staffOnline}/{dashboardData.totalStaff}
            </p>
            {/* Status indicators */}
            <div className="flex items-center mt-4 space-x-2">
              {Array.from({ length: Math.min(dashboardData.totalStaff, 8) }).map((_, index) => (
                <div
                  key={index}
                  className={`w-7 h-7 rounded-full transition-all duration-300 ${index < dashboardData.staffOnline
                    ? 'bg-charcoal shadow-md transform scale-110'
                    : 'bg-charcoal/30'
                    }`}
                ></div>
              ))}
              {dashboardData.totalStaff > 8 && (
                <span className="text-xs font-semibold text-charcoal/80">+{dashboardData.totalStaff - 8}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="mb-4 text-2xl font-bold text-charcoal">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/menu">
            <Button variant="primary" icon={PlusIcon}>
              Add Menu Item
            </Button>
          </Link>
          <Link to="/orders">
            <Button variant="secondary" icon={EyeIcon}>
              View Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="mb-4 text-2xl font-bold text-charcoal">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-100 rounded-2xl shadow-elevation-2">
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-elevation-2 card-hover">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-naples via-naples to-arylide">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-charcoal">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-charcoal">
                      Table
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-charcoal">
                      Items
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-charcoal">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-charcoal">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-charcoal">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gradient-to-r hover:from-gradient-primary/5 hover:to-gradient-secondary/5 transition-all duration-300 transform hover:scale-[1.01] animate-fade-in-up"
                      style={{ animationDelay: `${600 + index * 50}ms` }}
                    >
                      <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-charcoal">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        {order.table}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {order.items} items
                      </td>
                      <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-gradient-primary">
                        ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm transition-all duration-300 hover:scale-110 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                          {order.time}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
