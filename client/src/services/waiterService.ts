import { apiClient } from './api';
import type { Order } from './orderService';

export interface BillData {
  orderId: string;
  orderNumber: number;
  tableNumber: number;
  tableLocation: string;
  guestName: string;
  guestContact: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    specialInstructions: string | null;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceChargeRate: number;
  serviceCharge: number;
  total: number;
  createdAt: string;
  status: string;
  generatedAt: string;
  billNumber: string;
}

export interface CreateBillDto {
  orderId: string;
  discount?: number;
}

export interface PayBillDto {
  orderId: string;
  paymentMethod: 'CASH' | 'CARD';
}

export const waiterService = {
  // Get pending orders (status: PENDING)
  getPendingOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>(
      '/waiter/orders/pending'
    );
    return response.data.data;
  },

  // Get ready orders (status: READY) - from kitchen
  getReadyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>(
      '/waiter/orders/ready'
    );
    return response.data.data;
  },

  // Get orders with bill requested
  getBillRequestedOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>(
      '/waiter/orders/bill-requested'
    );
    return response.data.data;
  },

  // Accept order and send to kitchen
  acceptOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.post<{ success: boolean; data: Order }>(
      `/waiter/orders/${orderId}/accept`
    );
    return response.data.data;
  },

  // Reject order
  rejectOrder: async (orderId: string, reason?: string): Promise<Order> => {
    const response = await apiClient.post<{ success: boolean; data: Order }>(
      `/waiter/orders/${orderId}/reject`,
      { reason }
    );
    return response.data.data;
  },

  // Mark order as served
  markAsServed: async (orderId: string): Promise<Order> => {
    const response = await apiClient.post<{ success: boolean; data: Order }>(
      `/waiter/orders/${orderId}/served`
    );
    return response.data.data;
  },

  // Generate bill
  createBill: async (data: CreateBillDto): Promise<BillData> => {
    const response = await apiClient.post<{ success: boolean; data: BillData }>(
      '/waiter/bill/generate',
      data
    );
    return response.data.data;
  },

  // Mark bill as paid
  payBill: async (data: PayBillDto): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/waiter/bill/pay',
      data
    );
    return response.data;
  },

  // Process cash/card payment at restaurant
  processCashPayment: async (
    orderId: string,
    paymentMethod: 'CASH' | 'CARD',
    amountPaid: number
  ): Promise<Order> => {
    const response = await apiClient.post<{ success: boolean; data: Order }>(
      `/waiter/orders/${orderId}/process-payment`,
      { paymentMethod, amountPaid }
    );
    return response.data.data;
  },

  // Get bill by order ID for printing
  getBillByOrderId: async (orderId: string): Promise<BillData> => {
    const response = await apiClient.get<{ success: boolean; data: BillData }>(
      `/waiter/bill/${orderId}`
    );
    return response.data.data;
  },
};
