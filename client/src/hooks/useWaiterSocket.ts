import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import type { Order } from "../services/orderService";
import { soundManager } from "../utils/soundManager";

export interface WaiterSocketEvents {
  onOrderCreated?: (order: Order) => void;
  onOrderReady?: (order: Order) => void;
  onBillRequested?: (data: { orderId: string; tableNumber: number }) => void;
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

  // Use refs to store event handlers to avoid re-registering listeners on every render
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // Join waiter room when connected
  useEffect(() => {
    if (!socket || !isConnected) return;
  // Join waiter room when connected
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the waiter room to receive waiter-specific events
    socket.emit("join:room", { role: "WAITER", userId: "waiter-client" });
    console.log("[Waiter Socket] Joined waiter room");

    return () => {
      socket.emit("leave:room", { role: "WAITER" });
      console.log("[Waiter Socket] Left waiter room");
    };
  }, [socket, isConnected]);

  // Handle order:created event (new order from customer)
  const handleOrderCreated = useCallback(
    (data: { order: Order }) => {
      console.log("[Waiter Socket] New order created:", data.order);

      // Play notification sound
      soundManager.playNotification("new-order");

      // Call the event handler if provided (using ref for stable reference)
      if (eventsRef.current.onOrderCreated) {
        eventsRef.current.onOrderCreated(data.order);
      }
    },
    [] // No dependencies - uses ref
  );

  // Handle order:ready event (kitchen marked order as ready)
  const handleOrderReady = useCallback(
    (data: { order: Order }) => {
      console.log("[Waiter Socket] Order ready for serving:", data.order);

      // Play notification sound
      soundManager.playNotification("order-ready");

      // Call the event handler if provided (using ref for stable reference)
      if (eventsRef.current.onOrderReady) {
        eventsRef.current.onOrderReady(data.order);
      }
    },
    [] // No dependencies - uses ref
  );

  // Handle bill:requested event (customer requested bill)
  const handleBillRequested = useCallback(
    (data: { orderId: string; tableNumber: number }) => {
      console.log("[Waiter Socket] Bill requested:", data);

      // Play notification sound
      soundManager.playNotification("warning");

      // Call the event handler if provided (using ref for stable reference)
      if (eventsRef.current.onBillRequested) {
        eventsRef.current.onBillRequested(data);
      }
    },
    [] // No dependencies - uses ref
  );

  // Set up event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;
  // Set up event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Register event listeners
    socket.on("order:created", handleOrderCreated);
    socket.on("order:ready", handleOrderReady);
    socket.on("bill:requested", handleBillRequested);

    // Cleanup listeners on unmount
    return () => {
      socket.off("order:created", handleOrderCreated);
      socket.off("order:ready", handleOrderReady);
      socket.off("bill:requested", handleBillRequested);
    };
  }, [
    socket,
    isConnected,
    handleOrderCreated,
    handleOrderReady,
    handleBillRequested,
  ]);

  return {
    isConnected,
    socket,
  };
  return {
    isConnected,
    socket,
  };
};

export default useWaiterSocket;
