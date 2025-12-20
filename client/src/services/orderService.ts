import { apiClient } from './api';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED';
export type OrderItemStatus = 'QUEUED' | 'COOKING' | 'READY';

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    itemStatus: OrderItemStatus;
    specialInstructions: string | null;
    createdAt: string;
    menuItem?: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
    };
}

export interface Order {
    id: string;
    orderNumber: number;
    tableId: string;
    userId: string | null;
    guestName: string | null;
    guestContact: string | null;
    waiterId: string | null;
    status: OrderStatus;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentIntentId: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    tableName?: string; // Computed from table.tableNumber
    prepTime?: number; // Expected preparation time in minutes
    table?: {
        id: string;
        tableNumber: number;
    };
    customer?: {
        id: string;
        name: string | null;
        email: string;
    };
    waiter?: {
        id: string;
        name: string | null;
        email: string;
    };
    orderItems?: OrderItem[];
}

export interface OrderFilters {
    status?: OrderStatus;
    tableId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
}

export const orderService = {
    // Get all orders with optional filters
    getAll: async (filters?: OrderFilters): Promise<Order[]> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        const response = await apiClient.get<Order[]>(
            `/orders${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data;
    },

    // Get order by ID
    getById: async (id: string): Promise<Order> => {
        const response = await apiClient.get<Order>(`/orders/${id}`);
        return response.data;
    },

    // Update order status
    updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
        return response.data;
    },
};
