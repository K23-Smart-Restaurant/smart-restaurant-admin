import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import type { Category } from '../hooks/useCategories';
import { CategoryList } from '../components/category/CategoryList';
import { CategoryForm } from '../components/category/CategoryForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

const CategoryManagementPage: React.FC = () => {
  const { categories: _categories, addCategory, updateCategory, deleteCategory, getSortedCategories } = useCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCategory) {
      // Update existing category
      updateCategory(editingCategory.id, categoryData);
    } else {
      // Add new category
      addCategory(categoryData);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    deleteCategory(category.id);
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
