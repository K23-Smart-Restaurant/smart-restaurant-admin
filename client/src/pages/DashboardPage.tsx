import React from 'react';
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

// Mock dashboard data
const mockDashboardData = {
  totalOrders: 156,
  todayRevenue: 12450,
  activeTables: 8,
  totalTables: 12,
  staffOnline: 5,
  totalStaff: 8,
};

// Mock recent orders
const mockRecentOrders = [
  {
    id: 'ORD-001',
    table: 'Table 5',
    items: 3,
    amount: 245.50,
    status: 'PREPARING',
    time: '5 mins ago',
  },
  {
    id: 'ORD-002',
    table: 'Table 12',
    items: 2,
    amount: 89.00,
    status: 'PENDING',
    time: '8 mins ago',
  },
  {
    id: 'ORD-003',
    table: 'Table 3',
    items: 5,
    amount: 425.75,
    status: 'READY',
    time: '12 mins ago',
  },
  {
    id: 'ORD-004',
    table: 'Table 8',
    items: 1,
    amount: 35.00,
    status: 'DELIVERED',
    time: '15 mins ago',
  },
  {
    id: 'ORD-005',
    table: 'Table 2',
    items: 4,
    amount: 312.25,
    status: 'PREPARING',
    time: '18 mins ago',
  },
];

const DashboardPage: React.FC = () => {
  const activeTablePercentage = (mockDashboardData.activeTables / mockDashboardData.totalTables) * 100;
  // staffOnlinePercentage calculation available for future use when needed

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Summary cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders Card */}
        <div className="bg-naples rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-charcoal" />
            </div>
            <div className="flex items-center text-charcoal text-sm font-medium">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +12%
            </div>
          </div>
          <h3 className="text-charcoal/80 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold text-charcoal mt-1">{mockDashboardData.totalOrders}</p>
        </div>

        {/* Today's Revenue Card */}
        <div className="bg-naples rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSignIcon className="w-6 h-6 text-charcoal" />
            </div>
          </div>
          <h3 className="text-charcoal/80 text-sm font-medium">Today's Revenue</h3>
          <p className="text-3xl font-bold text-charcoal mt-1">
            ${mockDashboardData.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Active Tables Card */}
        <div className="bg-naples rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <LayoutGridIcon className="w-6 h-6 text-charcoal" />
            </div>
          </div>
          <h3 className="text-charcoal/80 text-sm font-medium">Active Tables</h3>
          <p className="text-3xl font-bold text-charcoal mt-1">
            {mockDashboardData.activeTables}/{mockDashboardData.totalTables}
          </p>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="bg-charcoal h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeTablePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-charcoal/80 mt-1">{activeTablePercentage.toFixed(0)}% occupied</p>
          </div>
        </div>

        {/* Staff Online Card */}
        <div className="bg-naples rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <UsersIcon className="w-6 h-6 text-charcoal" />
            </div>
          </div>
          <h3 className="text-charcoal/80 text-sm font-medium">Staff Online</h3>
          <p className="text-3xl font-bold text-charcoal mt-1">
            {mockDashboardData.staffOnline}/{mockDashboardData.totalStaff}
          </p>
          {/* Status indicators */}
          <div className="mt-4 flex items-center space-x-2">
            {Array.from({ length: mockDashboardData.totalStaff }).map((_, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full ${index < mockDashboardData.staffOnline ? 'bg-charcoal' : 'bg-charcoal/30'
                  }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-charcoal mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/menu">
            <Button icon={PlusIcon}>
              Add Menu Item
            </Button>
          </Link>
          <Link to="/orders">
            <Button variant="secondary" icon={EyeIcon} className="hover:bg-charcoal hover:text-white">
              View Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal mb-4">Recent Orders</h2>
        <div className="bg-white rounded-lg shadow-md border border-antiflash overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-antiflash">
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-naples/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.table}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.items} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-charcoal">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {order.time}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
