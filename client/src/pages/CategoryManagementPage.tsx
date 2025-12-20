import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
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
    getSortedCategories
  } = useCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  // Get categories sorted by display order
  const sortedCategories = getSortedCategories();

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

        {/* Add Category button */}
        <Button onClick={openAddCategoryModal} icon={PlusIcon}>
          Add Category
        </Button>
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
