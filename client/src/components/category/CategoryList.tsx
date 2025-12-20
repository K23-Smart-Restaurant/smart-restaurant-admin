import React from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import type { Category } from '../../hooks/useCategories';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  const handleDelete = (category: Category) => {
    const confirmMessage = `Are you sure? This will unassign ${category.itemCount} menu items.`;
    if (confirm(confirmMessage)) {
      onDelete(category);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-lg shadow-md border-2 border-white p-6 hover:shadow-lg hover:border-naples/80 hover:shadow-naples/30 transition-all duration-200 group relative"
        >
          {/* Category content */}
          <div className="mb-4">
            {/* Category name */}
            <h3 className="text-xl font-bold text-charcoal mb-2">
              {category.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3">
              {category.description || 'No description'}
            </p>

            {/* Badges */}
            <div className="flex items-center space-x-2">
              {/* Item count badge */}
              <span className="px-3 py-1 bg-naples/20 text-charcoal text-xs font-semibold rounded-full">
                {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
              </span>

              {/* Active/Inactive badge */}
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  category.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Hover actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-4 right-4 flex space-x-2">
            {/* Edit button */}
            <button
              onClick={() => onEdit(category)}
              className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 rounded-md transition-colors"
              title="Edit category"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={() => handleDelete(category)}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-600 rounded-md transition-colors"
              title="Delete category"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Display order indicator */}
          <div className="mt-4 pt-3 border-t border-antiflash">
            <p className="text-xs text-gray-500">
              Display Order: <span className="font-semibold">{category.displayOrder}</span>
            </p>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="col-span-full bg-white rounded-lg shadow-md border border-antiflash p-12 text-center">
          <p className="text-gray-600">No categories found. Create your first category to get started!</p>
        </div>
      )}
    </div>
  );
};
