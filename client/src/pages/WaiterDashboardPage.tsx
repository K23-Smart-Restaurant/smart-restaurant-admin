import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Layout, Bell, Utensils } from 'lucide-react';
import PendingOrderCard from '../components/waiter/PendingOrderCard';
import ReadyOrderCard from '../components/waiter/ReadyOrderCard';
import TableGridView, { type TableStatus } from '../components/waiter/TableGridView';
import BillForm from '../components/waiter/BillForm';
import useWaiterSocket from '../hooks/useWaiterSocket';
import { waiterService } from '../services/waiterService';
import { tableService } from '../services/tableService';
import type { Order } from '../services/orderService';
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
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState({
        pending: 0,
        ready: 0,
        billRequests: 0,
    });
    const { showToast } = useToast();

    // Fetch pending orders
    const fetchPendingOrders = useCallback(async () => {
        try {
            const orders = await waiterService.getPendingOrders();
            setPendingOrders(orders);
            setNotifications(prev => ({ ...prev, pending: orders.length }));
        } catch (error) {
            console.error('Failed to fetch pending orders:', error);
        }
    }, []);

    // Fetch ready orders
    const fetchReadyOrders = useCallback(async () => {
        try {
            const orders = await waiterService.getReadyOrders();
            setReadyOrders(orders);
            setNotifications(prev => ({ ...prev, ready: orders.length }));
        } catch (error) {
            console.error('Failed to fetch ready orders:', error);
        }
    }, []);

    // Fetch tables
    const fetchTables = useCallback(async () => {
        try {
            const allTables = await tableService.getAll();
            // Transform tables to include status for TableGridView
            const tablesWithStatus: TableStatus[] = allTables.map(table => ({
                id: table.id,
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                status: table.status, // Use the existing status from table
                // TODO: In production, fetch actual order data for occupied tables
                currentOrder: undefined,
            }));
            setTables(tablesWithStatus);

            // Count bill requests
            const billRequestCount = tablesWithStatus.filter(t => t.status === 'BILL_REQUESTED').length;
            setNotifications(prev => ({ ...prev, billRequests: billRequestCount }));
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
    const handleOrderCreated = useCallback((order: Order) => {
        setPendingOrders(prev => [order, ...prev]);
        setNotifications(prev => ({ ...prev, pending: prev.pending + 1 }));
        showToast('success', 'New Order', `New order from Table #${order.table?.tableNumber}`);
    }, [showToast]);

    // Handle order ready
    const handleOrderReady = useCallback((order: Order) => {
        setNotifications(prev => ({ ...prev, ready: prev.ready + 1 }));
        showToast('success', 'Order Ready', `Table #${order.table?.tableNumber} order is ready!`);
        fetchReadyOrders(); // Refresh ready orders list
    }, [showToast, fetchReadyOrders]);

    // Handle bill requested
    const handleBillRequested = useCallback((data: { orderId: string; tableNumber: number }) => {
        setNotifications(prev => ({ ...prev, billRequests: prev.billRequests + 1 }));
        showToast('success', 'Bill Requested', `Table #${data.tableNumber} requested the bill`);
        fetchTables(); // Refresh tables to update status
    }, [showToast, fetchTables]);

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
            setPendingOrders(prev => prev.filter(o => o.id !== orderId));
            setNotifications(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
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
            setPendingOrders(prev => prev.filter(o => o.id !== orderId));
            setNotifications(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
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
            setReadyOrders(prev => prev.filter(o => o.id !== orderId));
            setNotifications(prev => ({ ...prev, ready: Math.max(0, prev.ready - 1) }));
            showToast('success', 'Order Served', 'Order has been marked as served');
        } catch (error) {
            console.error('Failed to mark order as served:', error);
            showToast('error', 'Error', 'Failed to update order status');
        }
    };

    // Handle table click - opens BillForm for occupied/bill-requested tables
    const handleTableClick = (table: TableStatus) => {
        if (table.status === 'OCCUPIED' || table.status === 'BILL_REQUESTED') {
            // In production, fetch the actual order for this table
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
                    status: table.currentOrder.orderStatus as any, // Type will be correct when backend integration is complete
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
                    orderItems: [], // TODO: Fetch actual items
                };
                setSelectedOrder(order);
                setIsBillFormOpen(true);
            } else {
                // TODO: Fetch order details from API using table.id
                showToast('error', 'Info', 'Order details will be loaded when backend is integrated');
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
            showToast('success', 'Bill Generated', 'Bill has been generated and can be printed');
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
            setNotifications(prev => ({ ...prev, billRequests: Math.max(0, prev.billRequests - 1) }));
            setIsBillFormOpen(false);
            fetchTables(); // Refresh tables
        } catch (error) {
            console.error('Failed to process payment:', error);
            showToast('error', 'Error', 'Failed to process payment');
        }
    };

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending Orders', icon: ClipboardList, count: notifications.pending },
        { id: 'ready' as TabType, label: 'Ready to Serve', icon: Utensils, count: notifications.ready },
        { id: 'tables' as TabType, label: 'Tables', icon: Layout, count: notifications.billRequests },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header with Tabs */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-charcoal">Waiter Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage orders, tables, and billing</p>
                        </div>
                        {!isConnected && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600">
                                <Bell className="w-5 h-5 animate-pulse" />
                                <span className="font-semibold">Offline</span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-naples/20 to-arylide/20 border-2 border-naples text-charcoal'
                                        : 'bg-gray-100 border-2 border-gray-200 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <div className="text-center py-12">
                                        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h2 className="text-xl font-bold text-charcoal mb-2">No Pending Orders</h2>
                                        <p className="text-gray-600">New orders will appear here automatically</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ready to Serve Tab */}
                        {activeTab === 'ready' && (
                            <div>
                                {readyOrders.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {readyOrders.map((order) => (
                                            <ReadyOrderCard
                                                key={order.id}
                                                order={order}
                                                onMarkServed={handleMarkServed}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h2 className="text-xl font-bold text-charcoal mb-2">No Ready Orders</h2>
                                        <p className="text-gray-600">Orders ready from kitchen will appear here</p>
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
        </div>
    );
};

export default WaiterDashboardPage;
