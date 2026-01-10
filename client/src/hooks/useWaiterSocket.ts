import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import type { Order } from '../services/orderService';
import { soundManager } from '../utils/soundManager';

export interface WaiterSocketEvents {
  onOrderCreated?: (order: Order) => void;
  onOrderReady?: (order: Order) => void;
  onBillRequested?: (data: { orderId: string; tableNumber: number }) => void;
}

/**
 * useWaiterSocket - Custom hook for waiter real-time events
 * Listens to: order:created, order:ready, bill:requested
 */
export const useWaiterSocket = (events: WaiterSocketEvents) => {
  const { socket, isConnected } = useSocket();

  // Join waiter room when connected
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the waiter room to receive waiter-specific events
    socket.emit('join:room', 'waiter');
    console.log('[Waiter Socket] Joined waiter room');

    return () => {
      socket.emit('leave:room', 'waiter');
      console.log('[Waiter Socket] Left waiter room');
    };
  }, [socket, isConnected]);

  // Handle order:created event (new order from customer)
  const handleOrderCreated = useCallback(
    (data: { order: Order }) => {
      console.log('[Waiter Socket] New order created:', data.order);

      // Play notification sound
      soundManager.playNotification('new-order');

      // Call the event handler if provided
      if (events.onOrderCreated) {
        events.onOrderCreated(data.order);
      }
    },
    [events]
  );

  // Handle order:ready event (kitchen marked order as ready)
  const handleOrderReady = useCallback(
    (data: { order: Order }) => {
      console.log('[Waiter Socket] Order ready for serving:', data.order);

      // Play notification sound
      soundManager.playNotification('order-ready');

      // Call the event handler if provided
      if (events.onOrderReady) {
        events.onOrderReady(data.order);
      }
    },
    [events]
  );

  // Handle bill:requested event (customer requested bill)
  const handleBillRequested = useCallback(
    (data: { orderId: string; tableNumber: number }) => {
      console.log('[Waiter Socket] Bill requested:', data);

      // Play notification sound
      soundManager.playNotification('warning');

      // Call the event handler if provided
      if (events.onBillRequested) {
        events.onBillRequested(data);
      }
    },
    [events]
  );

  // Set up event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Register event listeners
    socket.on('order:created', handleOrderCreated);
    socket.on('order:ready', handleOrderReady);
    socket.on('bill:requested', handleBillRequested);

    // Cleanup listeners on unmount
    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:ready', handleOrderReady);
      socket.off('bill:requested', handleBillRequested);
    };
  }, [socket, isConnected, handleOrderCreated, handleOrderReady, handleBillRequested]);

  return {
    isConnected,
    socket,
  };
};

export default useWaiterSocket;
