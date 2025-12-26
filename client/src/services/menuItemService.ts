import { apiClient } from "./api";

export type MenuCategory = "APPETIZER" | "MAIN_COURSE" | "DESSERT" | "BEVERAGE";

export interface MenuItemPhoto {
  id?: string;
  url: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface ModifierOption {
  id?: string;
  name: string;
  price: number;
  status?: string;
  displayOrder?: number;
}

export interface ModifierGroupInput {
  id?: string;
  name: string;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  minSelections?: number | null;
  maxSelections?: number | null;
  displayOrder?: number;
  status?: string;
  options: ModifierOption[];
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
  photos?: MenuItemPhoto[];
  modifiers?: ModifierGroupInput[];
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  category: MenuCategory;
  price: number;
  isAvailable?: boolean;
  isSoldOut?: boolean;
  isChefRecommendation?: boolean;
  preparationTime?: number;
  categoryId?: string;
  modifiers?: ModifierGroupInput[];
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  category?: MenuCategory;
  price?: number;
  isAvailable?: boolean;
  isSoldOut?: boolean;
  isChefRecommendation?: boolean;
  preparationTime?: number;
  categoryId?: string;
  modifiers?: ModifierGroupInput[];
}

export interface MenuItemFilters {
  name?: string;
  category?: MenuCategory;
  categoryId?: string;
  isAvailable?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface PhotoInput {
  id?: string;
  url?: string;
  file?: File;
  isPrimary?: boolean;
}

export interface MenuItemListResponse {
  items: MenuItem[];
  total: number;
}

interface BaseMenuItemPayload<TPayload> {
  data: TPayload;
  photos?: PhotoInput[];
  modifierGroups?: ModifierGroupInput[];
  removedPhotoIds?: string[];
}

export type CreateMenuItemPayload = BaseMenuItemPayload<CreateMenuItemDto>;
export type UpdateMenuItemPayload = BaseMenuItemPayload<UpdateMenuItemDto> & {
  id: string;
};

const appendScalar = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;
  formData.append(key, value.toString());
};

const appendModifierGroups = (
  formData: FormData,
  modifierGroups?: ModifierGroupInput[]
) => {
  if (!modifierGroups) return;
  formData.append("modifierGroups", JSON.stringify(modifierGroups));

  // Legacy flatten for backward compatibility with simple modifier array
  const legacyModifiers = modifierGroups.flatMap((group) =>
    group.options.map((option) => ({
      name: option.name,
      price: option.price,
      groupName: group.name,
    }))
  );
  formData.append("modifiers", JSON.stringify(legacyModifiers));
};

const appendPhotos = (
  formData: FormData,
  photos?: PhotoInput[],
  removedPhotoIds?: string[]
) => {
  if (!photos) return;

  const primary = photos.find((p) => p.isPrimary) || photos[0];

  // Separate new photos (with files) from existing photos (with ids)
  const newPhotos = photos.filter((p) => p.file);

  if (primary?.id) {
    // Existing photo is primary
    formData.append("primaryPhotoId", primary.id);
  } else if (primary?.file && newPhotos.length > 0) {
    // New photo is primary - find its index within the new photos array
    const primaryIndexInNewPhotos = newPhotos.findIndex((p) => p === primary);
    if (primaryIndexInNewPhotos >= 0) {
      formData.append("primaryPhotoIndex", primaryIndexInNewPhotos.toString());
    }
  }

  photos.forEach((photo) => {
    if (photo.file) {
      formData.append("photos", photo.file);
      // Backward compatibility: still provide single image field
      if (photo === primary) {
        formData.append("image", photo.file);
      }
    }
    if (photo.id) {
      formData.append("existingPhotoIds", photo.id);
    }
  });

  removedPhotoIds?.forEach((id) => formData.append("removedPhotoIds", id));
};

export const menuItemService = {
  // Get all menu items with optional filters
  getAll: async (filters?: MenuItemFilters): Promise<MenuItemListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<MenuItemListResponse | MenuItem[]>(
      `/menu-items${params.toString() ? `?${params.toString()}` : ""}`
    );

    const payload = response.data;
    if (Array.isArray(payload)) {
      const items = payload as MenuItem[];
      return { items, total: items.length };
    }

    return payload;
  },

  // Get a single menu item by ID
  getById: async (id: string): Promise<MenuItem | null> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: MenuItem;
      }>(`/menu-items/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return null;
    }
  },

  // Create a new menu item (with multi-photo support)
  create: async (payload: CreateMenuItemPayload): Promise<MenuItem> => {
    const formData = new FormData();

    Object.entries(payload.data).forEach(([key, value]) => {
      appendScalar(formData, key, value as unknown);
    });

    appendModifierGroups(
      formData,
      payload.modifierGroups ?? payload.data.modifiers
    );
    appendPhotos(formData, payload.photos, payload.removedPhotoIds);

    const response = await apiClient.post<
      MenuItem | { success?: boolean; data: MenuItem }
    >("/menu-items", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const responseData = response.data;
    return "data" in responseData ? responseData.data : responseData;
  },

  // Update an existing menu item (with multi-photo support)
  update: async (payload: UpdateMenuItemPayload): Promise<MenuItem> => {
    const formData = new FormData();

    Object.entries(payload.data).forEach(([key, value]) => {
      appendScalar(formData, key, value as unknown);
    });

    appendModifierGroups(
      formData,
      payload.modifierGroups ?? payload.data.modifiers
    );
    appendPhotos(formData, payload.photos, payload.removedPhotoIds);

    const response = await apiClient.patch<
      MenuItem | { success?: boolean; data: MenuItem }
    >(`/menu-items/${payload.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const responseData = response.data;
    return "data" in responseData ? responseData.data : responseData;
  },

  // Update menu item status (availability, sold out)
  updateStatus: async (
    id: string,
    status: { isAvailable?: boolean; isSoldOut?: boolean }
  ): Promise<MenuItem> => {
    const response = await apiClient.patch<{
      success: boolean;
      data: MenuItem;
    }>(`/menu-items/${id}/status`, status);
    return response.data.data || response.data;
  },

  // Delete a menu item
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu-items/${id}`);
  },

  // Toggle availability
  toggleAvailability: async (
    id: string,
    isAvailable: boolean
  ): Promise<MenuItem> => {
    return menuItemService.updateStatus(id, { isAvailable });
  },

  // Toggle sold out status
  toggleSoldOut: async (id: string, isSoldOut: boolean): Promise<MenuItem> => {
    return menuItemService.updateStatus(id, { isSoldOut });
  },
};
