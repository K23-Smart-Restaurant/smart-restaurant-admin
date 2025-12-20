import { apiClient } from './api';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'WAITER' | 'KITCHEN_STAFF' | 'CUSTOMER' | 'GUEST';
export type StaffRole = 'WAITER' | 'KITCHEN_STAFF';  // For filtering in UI

export interface Staff {
    id: string;
    email: string;
    role: UserRole;
    name: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWaiterDto {
    email: string;
    password: string;
    name?: string;
    phoneNumber?: string;
}

export interface CreateKitchenStaffDto {
    email: string;
    password: string;
    name?: string;
    phoneNumber?: string;
}

export interface UpdateStaffDto {
    email?: string;
    name?: string;
    phoneNumber?: string;
    password?: string;
}

export const staffService = {
    // Get all staff members
    getAll: async (): Promise<Staff[]> => {
        const response = await apiClient.get<{ success: boolean; data: Staff[] }>('/staff');
        return response.data.data || response.data;
    },

    // Create a waiter
    createWaiter: async (data: CreateWaiterDto): Promise<Staff> => {
        const response = await apiClient.post<{ success: boolean; data: Staff }>('/staff/waiter', data);
        return response.data.data || response.data;
    },

    // Create kitchen staff
    createKitchenStaff: async (data: CreateKitchenStaffDto): Promise<Staff> => {
        const response = await apiClient.post<{ success: boolean; data: Staff }>('/staff/kitchen', data);
        return response.data.data || response.data;
    },

    // Update staff member
    update: async (id: string, data: UpdateStaffDto): Promise<Staff> => {
        const response = await apiClient.patch<{ success: boolean; data: Staff }>(`/staff/${id}`, data);
        return response.data.data || response.data;
    },

    // Delete (deactivate) staff member
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/staff/${id}`);
    },
};
