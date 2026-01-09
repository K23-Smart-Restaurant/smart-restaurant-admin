import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import type { Order } from '../services/orderService';
import { soundManager } from '../utils/soundManager';

export interface KitchenSocketEvents {
    onOrderConfirmed?: (order: Order) => void;
    onOrderUpdated?: (order: Order) => void;
    onOrderReady?: (order: Order) => void;
}

/**
 * useKitchenSocket - Custom hook for kitchen real-time events
 * Listens to: order:confirmed, order:updated, order:ready
 */
export const useKitchenSocket = (events: KitchenSocketEvents) => {
    const { socket, isConnected } = useSocket();

    // Join kitchen room when connected
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join the kitchen room to receive kitchen-specific events
        socket.emit('join:room', 'kitchen');
        console.log('[Kitchen Socket] Joined kitchen room');

        return () => {
            socket.emit('leave:room', 'kitchen');
            console.log('[Kitchen Socket] Left kitchen room');
        };
    }, [socket, isConnected]);

    // Handle order:confirmed event (new order sent to kitchen)
    const handleOrderConfirmed = useCallback(
        (data: { order: Order }) => {
            console.log('[Kitchen Socket] New order confirmed:', data.order);

            // Play notification sound
            soundManager.playNotification('new-order');

            // Call the event handler if provided
            if (events.onOrderConfirmed) {
                events.onOrderConfirmed(data.order);
            }
        },
        [events]
    );

    // Handle order:updated event
    const handleOrderUpdated = useCallback(
        (data: { order: Order }) => {
            console.log('[Kitchen Socket] Order updated:', data.order);

            // Call the event handler if provided
            if (events.onOrderUpdated) {
                events.onOrderUpdated(data.order);
            }
        },
        [events]
    );

    // Handle order:ready event
    const handleOrderReady = useCallback(
        (data: { order: Order }) => {
            console.log('[Kitchen Socket] Order marked ready:', data.order);

            // Play notification sound
            soundManager.playNotification('order-ready');

            // Call the event handler if provided
            if (events.onOrderReady) {
                events.onOrderReady(data.order);
            }
        },
        [events]
    );

    // Set up event listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Register event listeners
        socket.on('order:confirmed', handleOrderConfirmed);
        socket.on('order:updated', handleOrderUpdated);
        socket.on('order:ready', handleOrderReady);

        // Cleanup listeners on unmount
        return () => {
            socket.off('order:confirmed', handleOrderConfirmed);
            socket.off('order:updated', handleOrderUpdated);
            socket.off('order:ready', handleOrderReady);
        };
    }, [socket, isConnected, handleOrderConfirmed, handleOrderUpdated, handleOrderReady]);

    return {
        isConnected,
        socket,
    };
};

export default useKitchenSocket;
