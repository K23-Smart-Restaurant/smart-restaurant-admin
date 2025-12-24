import React, { useMemo, useState } from 'react';
import { PlusIcon, ArrowUpDownIcon } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import type { Category } from '../hooks/useCategories';
import { CategoryList } from '../components/category/CategoryList';
import { CategoryForm } from '../components/category/CategoryForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import type { CreateCategoryDto } from '../services/categoryService';

const CategoryManagementPage: React.FC = () => {
  const {
    categories: _categories,
    isLoading,
    isError,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<'displayOrder' | 'name' | 'createdAt'>('displayOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleAddCategory = async (categoryData: CreateCategoryDto) => {
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, categoryData);
      } else {
        // Add new category
        await addCategory(categoryData);
      }
      closeCategoryModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      // You can add toast notification here
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        console.error('Failed to delete category:', error);
        // You can add toast notification here
      }
    }
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const sortedCategories = useMemo(() => {
    const categoriesCopy = [..._categories];
    categoriesCopy.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'displayOrder') comparison = a.displayOrder - b.displayOrder;
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'createdAt') comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return categoriesCopy;
  }, [_categories, sortBy, sortOrder]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading categories: {error?.message || 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your menu categories</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700" htmlFor="category-sort">
              Sort by
            </label>
            <select
              id="category-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
            >
              <option value="displayOrder">Display order</option>
              <option value="name">Name</option>
              <option value="createdAt">Created date</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-200 hover:bg-gray-300 text-charcoal rounded-md border border-antiflash"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDownIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add Category button */}
          <Button onClick={openAddCategoryModal} icon={PlusIcon}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Category List */}
      <CategoryList
        categories={sortedCategories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleAddCategory}
          onCancel={closeCategoryModal}
        />
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
