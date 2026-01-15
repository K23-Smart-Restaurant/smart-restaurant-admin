import { useEffect, useCallback, useRef } from 'react';
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

  // Use refs to store event handlers to avoid re-registering listeners on every render
  const eventsRef = useRef(events);

  // Update ref in useEffect to avoid ref assignment during render
  useEffect(() => {
    eventsRef.current = events;
  });

  // Join kitchen room when connected
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the kitchen room to receive kitchen-specific events
    socket.emit('join:room', {
      role: 'KITCHEN_STAFF',
      userId: 'kitchen-client',
    });
    console.log('[Kitchen Socket] Joined kitchen room');

    return () => {
      socket.emit('leave:room', { role: 'KITCHEN_STAFF' });
      console.log('[Kitchen Socket] Left kitchen room');
    };
  }, [socket, isConnected]);

  // Handle order:confirmed event (new order sent to kitchen)
  const handleOrderConfirmed = useCallback(
    (data: { order: Order }) => {
      console.log('[Kitchen Socket] New order confirmed:', data.order);

      // Play notification sound
      soundManager.playNotification('new-order');

      // Call the event handler if provided (using ref for stable reference)
      if (eventsRef.current.onOrderConfirmed) {
        eventsRef.current.onOrderConfirmed(data.order);
      }
    },
    [] // No dependencies - uses ref
  );

  // Handle order:updated event
  const handleOrderUpdated = useCallback(
    (data: { order: Order }) => {
      console.log('[Kitchen Socket] Order updated:', data.order);

      // Call the event handler if provided (using ref for stable reference)
      if (eventsRef.current.onOrderUpdated) {
        eventsRef.current.onOrderUpdated(data.order);
      }
    },
    [] // No dependencies - uses ref
  );

  // Handle order:ready event
  const handleOrderReady = useCallback(
    (data: { order: Order }) => {
      console.log('[Kitchen Socket] Order marked ready:', data.order);

      // Play notification sound
      soundManager.playNotification('order-ready');

      // Call the event handler if provided (using ref for stable reference)
      if (eventsRef.current.onOrderReady) {
        eventsRef.current.onOrderReady(data.order);
      }
    },
    [] // No dependencies - uses ref
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
