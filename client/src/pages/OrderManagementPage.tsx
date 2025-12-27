import React, { useState, useEffect } from "react";
import { ShoppingCart, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import type { Order } from "../hooks/useOrders";
import { OrderList } from "../components/order/OrderList";
import { OrderDetailModal } from "../components/order/OrderDetailModal";
import { PageLoading, StatsSkeleton } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";

const OrderManagementPage: React.FC = () => {
  const {
    orders,
    isLoading,
    isError,
    updateStatus
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate summary stats
  const todayOrders = Array.isArray(orders) ? orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }) : [];

  const pendingOrders = Array.isArray(orders) ? orders.filter((order) =>
    ["PENDING", "CONFIRMED"].includes(order.status)
  ) : [];

  // Calculate overdue orders (mock - orders older than 30 minutes that aren't completed)
  const overdueOrders = Array.isArray(orders) ? orders.filter((order) => {
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    return orderAge > thirtyMinutes && !['PAID', 'CANCELLED'].includes(order.status);
  }) : [];

  const avgPrepTime =
    orders.length > 0
      ? Math.round(
        orders.reduce((sum, order) => {
          const elapsed = Math.floor(
            (Date.now() - new Date(order.createdAt).getTime()) / 60000
          );
          return sum + elapsed;
        }, 0) / orders.length
      )
      : 0;

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Real-time simulation: Add new mock order every 30s
  useEffect(() => {
    // This is just a simulation for demo purposes
    // In production, this would be replaced with real-time updates via WebSocket
    const simulationInterval = setInterval(() => {
      console.log("Real-time order simulation active (every 30s)");
      // Note: In a real app, new orders would come from the server
      // For now, we just log to show the simulation is active
    }, 30000);

    return () => clearInterval(simulationInterval);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Order Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all restaurant orders</p>
        </div>
        <StatsSkeleton count={4} />
        <PageLoading message="Loading orders..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load orders</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal">Order Management</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage all restaurant orders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders Today */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Orders Today
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2">
                {todayOrders.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
              <p className="text-3xl font-bold text-charcoal mt-2">
                {pendingOrders.length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Average Prep Time */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
              <p className="text-3xl font-bold text-charcoal mt-2">
                {avgPrepTime} min
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Overdue Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Overdue Orders
              </p>
              <p
                className={`text-3xl font-bold mt-2 ${overdueOrders.length > 0 ? "text-red-600" : "text-charcoal"
                  }`}
              >
                {overdueOrders.length}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${overdueOrders.length > 0 ? "bg-red-100" : "bg-gray-100"
                }`}
            >
              <AlertCircle
                className={`w-8 h-8 ${overdueOrders.length > 0 ? "text-red-600" : "text-gray-600"
                  }`}
              />
            </div>
          </div>
          {overdueOrders.length > 0 && (
            <div className="mt-2 text-xs text-red-600 font-semibold animate-pulse">
              ⚠️ Immediate attention required!
            </div>
          )}
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <OrderList
          orders={orders}
          onUpdateStatus={updateStatus}
          onOrderClick={handleOrderClick}
        />
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdateOrderStatus={updateStatus}
        onUpdateItemStatus={() => { }} // Not implemented in new hook yet
      />
    </div>
  );
};

export default OrderManagementPage;
