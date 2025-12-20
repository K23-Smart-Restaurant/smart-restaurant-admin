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
        return 'bg-naples/20 text-charcoal border border-naples/50';
      case 'PREPARING':
        return 'bg-gray-100 text-charcoal border border-gray-200';
      case 'READY':
        return 'bg-green-100 text-green-800 border border-green-200'; // Keep semantic green but distinct
      case 'DELIVERED':
        return 'bg-charcoal text-white'; // Dark for final state
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                +12%
              </div>
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-charcoal/80">Total Orders</h3>
            <p className="mt-2 text-4xl font-bold text-charcoal">{mockDashboardData.totalOrders}</p>
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
              ${mockDashboardData.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {mockDashboardData.activeTables}/{mockDashboardData.totalTables}
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
              {mockDashboardData.staffOnline}/{mockDashboardData.totalStaff}
            </p>
            {/* Status indicators */}
            <div className="flex items-center mt-4 space-x-2">
              {Array.from({ length: mockDashboardData.totalStaff }).map((_, index) => (
                <div
                  key={index}
                  className={`w-7 h-7 rounded-full transition-all duration-300 ${index < mockDashboardData.staffOnline
                      ? 'bg-charcoal shadow-md transform scale-110'
                      : 'bg-charcoal/30'
                    }`}
                ></div>
              ))}
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
                {mockRecentOrders.map((order, index) => (
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
      </div>
    </div>
  );
};

export default DashboardPage;
