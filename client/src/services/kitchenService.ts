import { apiClient } from './api';
import type { Order, OrderItemStatus } from './orderService';

export interface KitchenOrder extends Order {
  elapsedTime?: number; // Calculated in frontend
}

export interface UpdateItemStatusDto {
  itemStatus: OrderItemStatus;
}

export const kitchenService = {
  // Get active orders for kitchen (CONFIRMED, PREPARING, READY)
  getActiveOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>('/kitchen/orders');
    return response.data.data;
  },

  // Update order status (PREPARING -> READY)
  updateOrderStatus: async (orderId: string, status: 'PREPARING' | 'READY'): Promise<Order> => {
    const response = await apiClient.patch<{ success: boolean; data: Order }>(
      `/kitchen/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  },

  // Update individual item status
  updateItemStatus: async (
    orderId: string,
    itemId: string,
    itemStatus: OrderItemStatus
  ): Promise<Order> => {
    const response = await apiClient.patch<{ success: boolean; data: Order }>(
      `/kitchen/orders/${orderId}/items/${itemId}/status`,
      { itemStatus }
    );
    return response.data.data;
  },

  // Get order history (last 10 completed orders)
  getOrderHistory: async (): Promise<Order[]> => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>(
      '/kitchen/orders/history'
    );
    return response.data.data;
  },
};
