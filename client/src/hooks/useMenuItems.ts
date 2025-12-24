import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  menuItemService,
  type MenuItem,
  type MenuCategory,
  type CreateMenuItemDto,
  type UpdateMenuItemDto,
  type ModifierGroupInput,
  type MenuItemListResponse,
  type CreateMenuItemPayload,
  type UpdateMenuItemPayload,
  type PhotoInput,
} from "../services/menuItemService";

// Re-export types
export type { MenuItem, MenuCategory };

type SortOption = "name" | "price" | "category" | "createdAt" | "popularity";

interface UseMenuItemsOptions {
  searchQuery?: string;
  selectedCategory?: MenuCategory | "ALL";
  sortBy?: SortOption;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ModifierOptionInput {
  id?: string;
  name: string;
  price: number;
  status?: string;
  displayOrder?: number;
}

export interface ModifierGroupFormState extends ModifierGroupInput {
  options: ModifierOptionInput[];
}

export interface SaveMenuItemFormPayload {
  data: CreateMenuItemDto | UpdateMenuItemDto;
  photos?: PhotoInput[];
  modifierGroups?: ModifierGroupFormState[];
  removedPhotoIds?: string[];
  id?: string;
}

export const useMenuItems = (options: UseMenuItemsOptions = {}) => {
  const {
    searchQuery = "",
    selectedCategory = "ALL",
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    pageSize = 9,
  } = options;

  const queryClient = useQueryClient();

  // Fetch all menu items
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MenuItemListResponse>({
    queryKey: [
      "menuItems",
      searchQuery,
      selectedCategory,
      sortBy,
      sortOrder,
      page,
      pageSize,
    ],
    queryFn: () =>
      menuItemService.getAll({
        name: searchQuery || undefined,
        category: selectedCategory === "ALL" ? undefined : selectedCategory,
        sortBy,
        sortOrder,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  // Create menu item mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateMenuItemPayload) => menuItemService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMenuItemPayload) => menuItemService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: menuItemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuItemService.toggleAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  // Toggle sold out mutation
  const toggleSoldOutMutation = useMutation({
    mutationFn: ({ id, isSoldOut }: { id: string; isSoldOut: boolean }) =>
      menuItemService.toggleSoldOut(id, isSoldOut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  const menuItemsData = data?.items ?? [];
  const total = data?.total ?? menuItemsData.length;

  // Helper functions
  const createMenuItem = (payload: SaveMenuItemFormPayload) => {
    return createMutation.mutateAsync({
      data: payload.data as CreateMenuItemDto,
      photos: payload.photos,
      modifierGroups: payload.modifierGroups,
      removedPhotoIds: payload.removedPhotoIds,
    });
  };

  const updateMenuItem = (id: string, payload: SaveMenuItemFormPayload) => {
    return updateMutation.mutateAsync({
      id,
      data: payload.data as UpdateMenuItemDto,
      photos: payload.photos,
      modifierGroups: payload.modifierGroups,
      removedPhotoIds: payload.removedPhotoIds,
    });
  };

  const deleteMenuItem = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const toggleAvailability = (id: string) => {
    const item = menuItemsData.find((i) => i.id === id);
    if (item) {
      return toggleAvailabilityMutation.mutateAsync({ id, isAvailable: !item.isAvailable });
    }
    return Promise.reject(new Error("Menu item not found"));
  };

  const toggleSoldOut = (id: string) => {
    const item = menuItemsData.find((i) => i.id === id);
    if (item) {
      return toggleSoldOutMutation.mutateAsync({ id, isSoldOut: !item.isSoldOut });
    }
    return Promise.reject(new Error("Menu item not found"));
  };

  return {
    menuItems: menuItemsData,
    allMenuItems: menuItemsData,
    total,
    isLoading,
    isError,
    error,
    refetch,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleSoldOut,
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingAvailability: toggleAvailabilityMutation.isPending,
    isTogglingSoldOut: toggleSoldOutMutation.isPending,
    // Legacy properties for compatibility
    searchQuery,
    setSearchQuery: () => { }, // Deprecated - use options instead
    selectedCategory,
    setSelectedCategory: () => { }, // Deprecated - use options instead
    sortBy,
    setSortBy: () => { }, // Deprecated - use options instead
    sortOrder,
    setSortOrder: () => { }, // Deprecated - use options instead
  };
};
