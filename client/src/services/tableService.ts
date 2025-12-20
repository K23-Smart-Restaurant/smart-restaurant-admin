import { api, apiClient } from './api';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface Table {
    id: string;
    tableNumber: number;
    capacity: number;
    status: TableStatus;
    qrCode: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTableDto {
    tableNumber: number;
    capacity: number;
    status?: TableStatus;
}

export interface UpdateTableDto {
    tableNumber?: number;
    capacity?: number;
    status?: TableStatus;
}

export const tableService = {
    // Get all tables
    getAll: async (): Promise<Table[]> => {
        const response = await apiClient.get<{ success: boolean; data: Table[] }>('/tables');
        return response.data.data || response.data;
    },

    // Create a new table
    create: async (data: CreateTableDto): Promise<Table> => {
        const response = await apiClient.post<{ success: boolean; data: Table }>('/tables', data);
        return response.data.data || response.data;
    },

    // Update an existing table
    update: async (id: string, data: UpdateTableDto): Promise<Table> => {
        const response = await apiClient.patch<{ success: boolean; data: Table }>(`/tables/${id}`, data);
        return response.data.data || response.data;
    },

    // Delete a table
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tables/${id}`);
    },

    // Regenerate QR code for a table
    regenerateQR: async (id: string): Promise<Table> => {
        const response = await apiClient.post<{ success: boolean; data: Table }>(`/tables/${id}/regenerate-qr`);
        return response.data.data || response.data;
    },

    // Get QR code download URL
    getQRCodeUrl: (id: string): string => {
        return `${api.defaults.baseURL}/tables/${id}/qr-code`;
    },

    // Update table status
    updateStatus: async (id: string, status: TableStatus): Promise<Table> => {
        const response = await apiClient.patch<{ success: boolean; data: Table }>(`/tables/${id}`, { status });
        return response.data.data || response.data;
    },
};
