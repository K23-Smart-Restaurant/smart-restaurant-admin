import React, { useState, useEffect, useCallback } from 'react';
import { History, Volume2, VolumeX, WifiOff, RefreshCw } from 'lucide-react';
import KitchenOrderCard from '../components/kitchen/KitchenOrderCard';
import RecallHistoryModal from '../components/kitchen/RecallHistoryModal';
import useKitchenSocket from '../hooks/useKitchenSocket';
import { kitchenService } from '../services/kitchenService';
import type { Order, OrderItemStatus } from '../services/orderService';
import { soundManager } from '../utils/soundManager';
import { useToast } from '../hooks/useToast';

/**
 * Kitchen Display System Page (Light Theme)
 * Real-time order display for kitchen staff with grid layout
 */
const KitchenDisplayPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOneItemCooking, setIsOneItemCooking] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const { showToast } = useToast();

    // Fetch initial orders
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await kitchenService.getActiveOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch kitchen orders:', error);
            showToast('error', 'Error', 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle new order confirmed (sent to kitchen)
    const handleOrderConfirmed = useCallback((order: Order) => {
        setOrders((prevOrders) => {
            // Check if order already exists
            const exists = prevOrders.some(o => o.id === order.id);
            if (exists) {
                return prevOrders.map(o => o.id === order.id ? order : o);
            }
            return [order, ...prevOrders];
        });
        showToast('success', 'New Order', `Order for Table #${order.table?.tableNumber}`);
    }, [showToast]);

    // Handle order updated
    const handleOrderUpdated = useCallback((order: Order) => {
        setOrders((prevOrders) => {
            // Check if order exists in current state
            const exists = prevOrders.some(o => o.id === order.id);
            if (exists) {
                return prevOrders.map(o => o.id === order.id ? order : o);
            }
            // If order doesn't exist, don't add it (it might have been removed)
            return prevOrders;
        });
    }, []);

    // Handle order ready
    const handleOrderReady = useCallback((order: Order) => {
        // Keep in active orders for a moment, then move to completed
        setOrders((prevOrders) => {
            const exists = prevOrders.some(o => o.id === order.id);
            if (exists) {
                return prevOrders.map(o => o.id === order.id ? order : o);
            }
            return prevOrders;
        });

        // After 5 seconds, move to completed
        setTimeout(() => {
            setOrders((prevOrders) => prevOrders.filter(o => o.id !== order.id));
            setCompletedOrders((prevCompleted) => {
                const updated = [order, ...prevCompleted];
                return updated.slice(0, 10); // Keep only last 10
            });
        }, 5000);
    }, []);

    // Set up socket listeners
    const { isConnected } = useKitchenSocket({
        onOrderConfirmed: handleOrderConfirmed,
        onOrderUpdated: handleOrderUpdated,
        onOrderReady: handleOrderReady,
    });

    // Handle mark order ready
    const handleMarkReady = async (orderId: string) => {
        try {
            const updatedOrder = await kitchenService.updateOrderStatus(orderId, 'READY');
            setOrders((prevOrders) =>
                prevOrders.map((o) => (o.id === orderId ? updatedOrder : o))
            );
            showToast('success', 'Success', 'Order marked as ready!');
        } catch (error) {
            console.error('Failed to mark order ready:', error);
            showToast('error', 'Error', 'Failed to update order status');
        }
    };

    // Handle update item status
    const handleUpdateItemStatus = async (
        orderId: string,
        itemId: string,
        itemStatus: OrderItemStatus
    ) => {
        // Store previous state for rollback on error
        let previousOrders: Order[] = [];

        try {
            // Optimistically update the UI first
            setOrders((prevOrders) => {
                previousOrders = prevOrders; // Store for rollback
                return prevOrders.map((o) => {
                    if (o.id === orderId) {
                        return {
                            ...o,
                            orderItems: o.orderItems?.map((item) =>
                                item.id === itemId ? { ...item, itemStatus } : item
                            ),
                        };
                    }
                    return o;
                });
            });

            // Then update on the backend
            let updatedOrder = await kitchenService.updateItemStatus(orderId, itemId, itemStatus);

            // If this is the first item being marked as cooking, also update order status
            if (!isOneItemCooking && itemStatus === 'COOKING') {
                setIsOneItemCooking(true);
                // Update orderStatus to 'PREPARING' if at least one item is cooking
                updatedOrder = await kitchenService.updateOrderStatus(orderId, 'PREPARING');
            }

            // Update state with the actual backend response
            setOrders((prevOrders) =>
                prevOrders.map((o) => (o.id === orderId ? updatedOrder : o))
            );
        } catch (error) {
            console.error('Failed to update item status:', error);

            // Rollback to previous state on error
            setOrders(previousOrders);

            showToast('error', 'Error', 'Failed to update item status');
        }
    };

    // Toggle sound
    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        soundManager.setEnabled(newState);
        showToast('success', 'Settings', newState ? 'Sound enabled' : 'Sound disabled');
    };

    // Sort orders by priority (oldest first, then by status)
    const sortedOrders = [...orders].sort((a, b) => {
        // Priority: CONFIRMED > PREPARING > READY
        const statusPriority: Record<string, number> = {
            CONFIRMED: 1,
            PREPARING: 2,
            READY: 3,
        };

        const aPriority = statusPriority[a.status] || 999;
        const bPriority = statusPriority[b.status] || 999;

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // Same status, sort by creation time (oldest first)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return (
        <div className="h-full overflow-hidden flex flex-col">
            {/* Header Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm rounded-t-lg">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Kitchen Display System</h1>
                    <p className="text-gray-600 mt-1">
                        {orders.length} active order{orders.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Offline Warning */}
                    {!isConnected && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            <WifiOff className="w-5 h-5 animate-pulse" />
                            <span className="font-semibold">Offline</span>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={fetchOrders}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-charcoal flex items-center gap-2 border border-gray-200"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    {/* Sound Toggle */}
                    <button
                        onClick={toggleSound}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${soundEnabled
                            ? 'bg-gradient-to-r from-naples/20 to-arylide/20 hover:from-naples/30 hover:to-arylide/30 border border-naples/30 text-charcoal'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600'
                            }`}
                    >
                        {soundEnabled ? (
                            <>
                                <Volume2 className="w-5 h-5" />
                                Sound On
                            </>
                        ) : (
                            <>
                                <VolumeX className="w-5 h-5" />
                                Sound Off
                            </>
                        )}
                    </button>

                    {/* History Button */}
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-naples/20 to-arylide/20 hover:from-naples/30 hover:to-arylide/30 border border-naples/30 rounded-lg transition-all duration-200 text-charcoal flex items-center gap-2"
                    >
                        <History className="w-5 h-5" />
                        History ({completedOrders.length})
                    </button>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-naples/30 border-t-naples rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">Loading orders...</p>
                        </div>
                    </div>
                ) : sortedOrders.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-min">
                        {sortedOrders.map((order) => (
                            <KitchenOrderCard
                                key={order.id}
                                order={order}
                                onMarkReady={handleMarkReady}
                                onUpdateItemStatus={handleUpdateItemStatus}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="bg-gray-100 rounded-full p-8 mx-auto mb-6 inline-block">
                                <svg
                                    className="w-24 h-24 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-charcoal mb-2">No Active Orders</h2>
                            <p className="text-gray-600">
                                New orders will appear here automatically
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Recall History Modal */}
            <RecallHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                completedOrders={completedOrders}
            />
        </div>
    );
};

export default KitchenDisplayPage;
