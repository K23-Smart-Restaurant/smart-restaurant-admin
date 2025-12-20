import { apiClient } from './api';

export type MenuCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE';

export interface Modifier {
    id: string;
    name: string;
    price: number;
    groupName: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    category: MenuCategory;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    isSoldOut: boolean;
    isChefRecommendation: boolean;
    preparationTime: number | null;
    categoryId: string | null;
    createdAt: string;
    updatedAt: string;
    modifiers?: Modifier[];
}

export interface CreateMenuItemDto {
    name: string;
    description?: string;
    category: MenuCategory;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
    isSoldOut?: boolean;
    isChefRecommendation?: boolean;
    preparationTime?: number;
    categoryId?: string;
    modifiers?: Omit<Modifier, 'id'>[];
}

export interface UpdateMenuItemDto {
    name?: string;
    description?: string;
    category?: MenuCategory;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    isSoldOut?: boolean;
    isChefRecommendation?: boolean;
    preparationTime?: number;
    categoryId?: string;
    modifiers?: Omit<Modifier, 'id'>[];
}

export interface MenuItemFilters {
    name?: string;
    category?: MenuCategory;
    categoryId?: string;
    isAvailable?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export const menuItemService = {
    // Get all menu items with optional filters
    getAll: async (filters?: MenuItemFilters): Promise<MenuItem[]> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        const response = await apiClient.get<{ items: MenuItem[]; total: number }>(
            `/menu-items${params.toString() ? `?${params.toString()}` : ''}`
        );
        // API returns {items: [...], total: number} format
        return response.data.items || response.data;
    },

    // Create a new menu item (with file upload support)
    create: async (data: CreateMenuItemDto, imageFile?: File): Promise<MenuItem> => {
        const formData = new FormData();

        // Append all fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'modifiers') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // Append image file if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await apiClient.post<{ success: boolean; data: MenuItem }>('/menu-items', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data || response.data;
    },

    // Update an existing menu item (with file upload support)
    update: async (id: string, data: UpdateMenuItemDto, imageFile?: File): Promise<MenuItem> => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'modifiers') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await apiClient.patch<{ success: boolean; data: MenuItem }>(`/menu-items/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data || response.data;
    },

    // Update menu item status (availability, sold out)
    updateStatus: async (id: string, status: { isAvailable?: boolean; isSoldOut?: boolean }): Promise<MenuItem> => {
        const response = await apiClient.patch<{ success: boolean; data: MenuItem }>(`/menu-items/${id}/status`, status);
        return response.data.data || response.data;
    },

    // Delete a menu item
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/menu-items/${id}`);
    },

    // Toggle availability
    toggleAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
        return menuItemService.updateStatus(id, { isAvailable });
    },

    // Toggle sold out status
    toggleSoldOut: async (id: string, isSoldOut: boolean): Promise<MenuItem> => {
        return menuItemService.updateStatus(id, { isSoldOut });
    },
};
