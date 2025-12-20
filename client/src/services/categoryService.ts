import { apiClient } from './api';

export interface Category {
    id: string;
    name: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        menuItems: number;
    };
}

export interface CreateCategoryDto {
    name: string;
    description: string;
    displayOrder: number;
    isActive?: boolean;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export const categoryService = {
    // Get all categories
    getAll: async (): Promise<Category[]> => {
        const response = await apiClient.get<{ success: boolean; data: Category[] }>('/categories');
        return response.data.data || response.data;
    },

    // Create a new category
    create: async (data: CreateCategoryDto): Promise<Category> => {
        const response = await apiClient.post<{ success: boolean; data: Category }>('/categories', data);
        return response.data.data || response.data;
    },

    // Update an existing category
    update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
        const response = await apiClient.patch<{ success: boolean; data: Category }>(`/categories/${id}`, data);
        return response.data.data || response.data;
    },

    // Delete (soft delete) a category
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/categories/${id}`);
    },

    // Toggle active status
    toggleActive: async (id: string, isActive: boolean): Promise<Category> => {
        const response = await apiClient.patch<{ success: boolean; data: Category }>(`/categories/${id}`, { isActive });
        return response.data.data || response.data;
    },
};
