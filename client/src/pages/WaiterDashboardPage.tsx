import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Layout, Bell, Utensils, RefreshCw } from 'lucide-react';
import PendingOrderCard from '../components/waiter/PendingOrderCard';
import ReadyOrderCard from '../components/waiter/ReadyOrderCard';
import TableGridView, { type TableStatus } from '../components/waiter/TableGridView';
import BillForm from '../components/waiter/BillForm';
import CashPaymentForm from '../components/waiter/CashPaymentForm';
import useWaiterSocket from '../hooks/useWaiterSocket';
import { waiterService } from '../services/waiterService';
import { tableService } from '../services/tableService';
import type { Order, OrderStatus } from '../services/orderService';
import { useToast } from '../hooks/useToast';

type TabType = 'pending' | 'ready' | 'tables';

/**
 * Waiter Dashboard Page (Light Theme)
 * Manages pending orders, table status, and billing
 */
const WaiterDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    pending: 0,
    ready: 0,
    billRequests: 0,
  });
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch pending orders
  const fetchPendingOrders = useCallback(async () => {
    try {
      const orders = await waiterService.getPendingOrders();
      setPendingOrders(orders);
      setNotifications((prev) => ({ ...prev, pending: orders.length }));
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    }
  }, []);

  // Fetch ready orders
  const fetchReadyOrders = useCallback(async () => {
    try {
      const orders = await waiterService.getReadyOrders();
      setReadyOrders(orders);
      setNotifications((prev) => ({ ...prev, ready: orders.length }));
    } catch (error) {
      console.error('Failed to fetch ready orders:', error);
    }
  }, []);

  // Fetch tables
  const fetchTables = useCallback(async () => {
    try {
      const allTables = await tableService.getAll();
      // Fetch bill requested orders to attach to tables
      const billRequestedOrders = await waiterService.getBillRequestedOrders();

      // Transform tables to include status and current order for TableGridView
      const tablesWithStatus: TableStatus[] = allTables.map((table) => {
        // Find if this table has an active order with bill requested
        const activeOrder = billRequestedOrders.find((order: Order) => order.tableId === table.id);

        return {
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: activeOrder ? 'BILL_REQUESTED' : table.status,
          currentOrder: activeOrder
            ? {
                id: activeOrder.id,
                orderNumber: activeOrder.orderNumber,
                orderStatus: activeOrder.status,
                guestName: activeOrder.guestName || 'Guest',
                totalAmount: activeOrder.totalAmount,
              }
            : undefined,
        };
      });
      setTables(tablesWithStatus);

      // Count bill requests
      const billRequestCount = billRequestedOrders.length;
      setNotifications((prev) => ({ ...prev, billRequests: billRequestCount }));
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPendingOrders(), fetchReadyOrders(), fetchTables()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchPendingOrders, fetchReadyOrders, fetchTables]);

  // Handle new order created
  const handleOrderCreated = useCallback(
    (order: Order) => {
      setPendingOrders((prev) => [order, ...prev]);
      setNotifications((prev) => ({ ...prev, pending: prev.pending + 1 }));
      showToast('success', 'New Order', `New order from Table #${order.table?.tableNumber}`);
    },
    [showToast]
  );

  // Handle order ready
  const handleOrderReady = useCallback(
    (order: Order) => {
      setNotifications((prev) => ({ ...prev, ready: prev.ready + 1 }));
      showToast('success', 'Order Ready', `Table #${order.table?.tableNumber} order is ready!`);
      fetchReadyOrders(); // Refresh ready orders list
    },
    [showToast, fetchReadyOrders]
  );

  // Handle bill requested
  const handleBillRequested = useCallback(
    (data: { orderId: string; tableNumber: number }) => {
      setNotifications((prev) => ({ ...prev, billRequests: prev.billRequests + 1 }));
      showToast('success', 'Bill Requested', `Table #${data.tableNumber} requested the bill`);
      fetchTables(); // Refresh tables to update status
    },
    [showToast, fetchTables]
  );

  // Set up socket listeners
  const { isConnected } = useWaiterSocket({
    onOrderCreated: handleOrderCreated,
    onOrderReady: handleOrderReady,
    onBillRequested: handleBillRequested,
  });

  // Handle accept order
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await waiterService.acceptOrder(orderId);
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setNotifications((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
      showToast('success', 'Order Accepted', 'Order has been sent to the kitchen');
      fetchTables(); // Refresh tables to show occupied status
    } catch (error) {
      console.error('Failed to accept order:', error);
      showToast('error', 'Error', 'Failed to accept order');
    }
  };

  // Handle reject order
  const handleRejectOrder = async (orderId: string) => {
    try {
      await waiterService.rejectOrder(orderId);
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setNotifications((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
      showToast('success', 'Order Rejected', 'Order has been cancelled');
    } catch (error) {
      console.error('Failed to reject order:', error);
      showToast('error', 'Error', 'Failed to reject order');
    }
  };

  // Handle mark served
  const handleMarkServed = async (orderId: string) => {
    try {
      await waiterService.markAsServed(orderId);
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      setNotifications((prev) => ({ ...prev, ready: Math.max(0, prev.ready - 1) }));
      showToast('success', 'Order Served', 'Order has been marked as served');
    } catch (error) {
      console.error('Failed to mark order as served:', error);
      showToast('error', 'Error', 'Failed to update order status');
    }
  };

  // Handle table click - opens BillForm for occupied/bill-requested tables
  const handleTableClick = async (table: TableStatus) => {
    if (table.status === 'OCCUPIED' || table.status === 'BILL_REQUESTED') {
      // Fetch the actual order for this table
      try {
        // If we already have currentOrder from table data, use it
        if (table.currentOrder) {
          // Construct a full Order object from currentOrder
          const order: Order = {
            id: table.currentOrder.id,
            orderNumber: table.currentOrder.orderNumber,
            tableId: table.id,
            userId: null,
            guestName: table.currentOrder.guestName,
            guestContact: null,
            waiterId: null,
            status: table.currentOrder.orderStatus as OrderStatus,
            totalAmount: table.currentOrder.totalAmount,
            paymentStatus: 'UNPAID',
            paymentIntentId: null,
            notes: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paidAt: null,
            table: {
              id: table.id,
              tableNumber: table.tableNumber,
            },
            orderItems: [], // Will be fetched if needed
          };
          setSelectedOrder(order);
          setIsBillFormOpen(true);
        } else {
          // Fetch all orders for this table and get the most recent unpaid one
          const billRequestedOrders = await waiterService.getBillRequestedOrders();
          const tableOrder = billRequestedOrders.find((order: Order) => order.tableId === table.id);

          if (tableOrder) {
            setSelectedOrder(tableOrder);
            setIsBillFormOpen(true);
          } else {
            showToast(
              'success',
              'No Active Order',
              `Table ${table.tableNumber} has no active order`
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        showToast('error', 'Error', 'Failed to load order details');
      }
    } else if (table.status === 'AVAILABLE') {
      showToast('success', 'Table Info', `Table ${table.tableNumber} is available`);
    } else if (table.status === 'RESERVED') {
      showToast('success', 'Table Info', `Table ${table.tableNumber} is reserved`);
    }
  };

  // Handle generate bill
  const handleGenerateBill = async (orderId: string, discount: number) => {
    try {
      await waiterService.createBill({ orderId, discount });
      showToast('success', 'Bill Generated', 'Navigating to print page...');

      // Close the bill form modal
      setIsBillFormOpen(false);

      // Clear selected order
      setSelectedOrder(null);

      // Navigate to bill print page
      navigate(`/waiter/bill/${orderId}`);
    } catch (error) {
      console.error('Failed to generate bill:', error);
      showToast('error', 'Error', 'Failed to generate bill');
    }
  };

  // Handle mark paid
  const handleMarkPaid = async (orderId: string, paymentMethod: 'CASH' | 'CARD') => {
    try {
      await waiterService.payBill({ orderId, paymentMethod });
      showToast('success', 'Payment Processed', 'Order has been marked as paid');
      setNotifications((prev) => ({ ...prev, billRequests: Math.max(0, prev.billRequests - 1) }));
      setIsBillFormOpen(false);
      fetchTables(); // Refresh tables
    } catch (error) {
      console.error('Failed to process payment:', error);
      showToast('error', 'Error', 'Failed to process payment');
    }
  };

  // Handle process cash payment
  const handleProcessCashPayment = async (paymentMethod: 'CASH' | 'CARD', amountPaid: number) => {
    if (!selectedOrder) return;

    try {
      await waiterService.processCashPayment(selectedOrder.id, paymentMethod, amountPaid);
      showToast('success', 'Payment Completed', `${paymentMethod} payment processed successfully`);
      setNotifications((prev) => ({ ...prev, billRequests: Math.max(0, prev.billRequests - 1) }));
      setIsPaymentFormOpen(false);
      setSelectedOrder(null);
      fetchTables(); // Refresh tables to show AVAILABLE status
      fetchReadyOrders(); // Refresh in case order was in ready state
    } catch (error: unknown) {
      console.error('Failed to process cash payment:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };


  // Handle refresh tab
  const refreshTab = async (tab: TabType) => {
    setIsLoading(true);
    switch (tab) {
      case 'pending':
        await fetchPendingOrders();
        break;
      case 'ready':
        await fetchReadyOrders();
        break;
      case 'tables':
        await fetchTables();
        break;
    }
    setIsLoading(false);
  };

  const tabs = [
    {
      id: 'pending' as TabType,
      label: 'Pending Orders',
      icon: ClipboardList,
      count: notifications.pending,
    },
    { id: 'ready' as TabType, label: 'Ready to Serve', icon: Utensils, count: notifications.ready },
    { id: 'tables' as TabType, label: 'Tables', icon: Layout, count: notifications.billRequests },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal">Waiter Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">Manage orders, tables, and billing</p>
            </div>
            {!isConnected && (
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-red-50 border border-red-200 rounded-lg text-red-600">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span className="font-semibold text-xs sm:text-sm">Offline</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-2">
            {/* Tabs - Scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-naples/20 to-arylide/20 border-2 border-naples text-charcoal'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-sm sm:text-base">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Refresh button */}
            <button
              onClick={() => refreshTab(activeTab)}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 bg-gray-100 border-2 border-gray-200 text-gray-700 hover:bg-gray-200 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-sm sm:text-base">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-naples/30 border-t-naples rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending Orders Tab */}
            {activeTab === 'pending' && (
              <div>
                {pendingOrders.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                    {pendingOrders.map((order) => (
                      <PendingOrderCard
                        key={order.id}
                        order={order}
                        onAccept={handleAcceptOrder}
                        onReject={handleRejectOrder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <ClipboardList className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-lg sm:text-xl font-bold text-charcoal mb-1 sm:mb-2">No Pending Orders</h2>
                    <p className="text-sm sm:text-base text-gray-600">New orders will appear here automatically</p>
                  </div>
                )}
              </div>
            )}

            {/* Ready to Serve Tab */}
            {activeTab === 'ready' && (
              <div>
                {readyOrders.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                    {readyOrders.map((order) => (
                      <ReadyOrderCard
                        key={order.id}
                        order={order}
                        onMarkServed={handleMarkServed}
                        onProcessPayment={(order) => {
                          setSelectedOrder(order);
                          setIsPaymentFormOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-lg sm:text-xl font-bold text-charcoal mb-1 sm:mb-2">No Ready Orders</h2>
                    <p className="text-sm sm:text-base text-gray-600">Orders ready from kitchen will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <div>
                <TableGridView tables={tables} onTableClick={handleTableClick} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bill Form Modal */}
      <BillForm
        isOpen={isBillFormOpen}
        onClose={() => setIsBillFormOpen(false)}
        order={selectedOrder}
        onGenerateBill={handleGenerateBill}
        onMarkPaid={handleMarkPaid}
      />

      {/* Cash Payment Form Modal */}
      {isPaymentFormOpen && selectedOrder && (
        <CashPaymentForm
          order={selectedOrder}
          onSubmit={handleProcessCashPayment}
          onCancel={() => {
            setIsPaymentFormOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default WaiterDashboardPage;
