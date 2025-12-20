import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  menuItemService,
  type MenuItem,
  type MenuCategory,
  type CreateMenuItemDto,
  type UpdateMenuItemDto,
  type Modifier
} from '../services/menuItemService';

// Re-export types
export type { MenuItem, MenuCategory, Modifier };

type SortOption = 'name' | 'price' | 'category' | 'createdAt' | 'popularity';

interface UseMenuItemsOptions {
  searchQuery?: string;
  selectedCategory?: MenuCategory | 'ALL';
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}

export const useMenuItems = (options: UseMenuItemsOptions = {}) => {
  const {
    searchQuery = '',
    selectedCategory = 'ALL',
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  const queryClient = useQueryClient();

  // Fetch all menu items
  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => menuItemService.getAll(),
  });

  // Create menu item mutation
  const createMutation = useMutation({
    mutationFn: ({ data, imageFile }: { data: CreateMenuItemDto; imageFile?: File }) =>
      menuItemService.create(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }: { id: string; data: UpdateMenuItemDto; imageFile?: File }) =>
      menuItemService.update(id, data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: menuItemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuItemService.toggleAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  // Toggle sold out mutation
  const toggleSoldOutMutation = useMutation({
    mutationFn: ({ id, isSoldOut }: { id: string; isSoldOut: boolean }) =>
      menuItemService.toggleSoldOut(id, isSoldOut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  // Filter and sort menu items
  const filteredAndSortedItems = useMemo(() => {
    // Ensure menuItems is an array
    const itemsArray = Array.isArray(menuItems) ? menuItems : [];
    let result = [...itemsArray];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = Number(a.price) - Number(b.price);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          // Mock popularity based on chef recommendation
          comparison = (a.isChefRecommendation ? 1 : 0) - (b.isChefRecommendation ? 1 : 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [menuItems, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Helper functions
  const createMenuItem = (data: CreateMenuItemDto, imageFile?: File) => {
    return createMutation.mutateAsync({ data, imageFile });
  };

  const updateMenuItem = (id: string, data: UpdateMenuItemDto, imageFile?: File) => {
    return updateMutation.mutateAsync({ id, data, imageFile });
  };

  const deleteMenuItem = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const toggleAvailability = (id: string) => {
    const item = menuItems.find((i) => i.id === id);
    if (item) {
      return toggleAvailabilityMutation.mutateAsync({ id, isAvailable: !item.isAvailable });
    }
    return Promise.reject(new Error('Menu item not found'));
  };

  const toggleSoldOut = (id: string) => {
    const item = menuItems.find((i) => i.id === id);
    if (item) {
      return toggleSoldOutMutation.mutateAsync({ id, isSoldOut: !item.isSoldOut });
    }
    return Promise.reject(new Error('Menu item not found'));
  };

  return {
    menuItems: filteredAndSortedItems,
    allMenuItems: menuItems,
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
