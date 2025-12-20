import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '../services/categoryService';

// Re-export the Category type for convenience
export type { Category };

export const useCategories = () => {
  const queryClient = useQueryClient();

  // Fetch all categories
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      // Invalidate and refetch categories after successful creation
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Delete category mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Helper functions
  const addCategory = (newCategory: CreateCategoryDto) => {
    return createMutation.mutateAsync(newCategory);
  };

  const updateCategory = (id: string, data: UpdateCategoryDto) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteCategory = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const toggleActive = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      return toggleActiveMutation.mutateAsync({ id, isActive: !category.isActive });
    }
    return Promise.reject(new Error('Category not found'));
  };

  // Get active categories only
  const getActiveCategories = () => {
    return categories.filter((category) => category.isActive);
  };

  // Get category by ID
  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  // Sort categories by display order
  const getSortedCategories = () => {
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  };

  // Compute itemCount from _count field
  const categoriesWithItemCount = categories.map((category) => ({
    ...category,
    itemCount: category._count?.menuItems || 0,
  }));

  return {
    categories: categoriesWithItemCount,
    isLoading,
    isError,
    error,
    refetch,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleActive,
    getActiveCategories,
    getCategoryById,
    getSortedCategories,
    // Mutation states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
  };
};
