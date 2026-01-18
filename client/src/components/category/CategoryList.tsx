import React from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../hooks/useCategories';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  const { t } = useTranslation('categories');
  const handleDelete = (category: Category) => {
    // Parent page handles confirmation dialog
    onDelete(category);
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
            <h3 className="text-xl font-bold text-charcoal mb-2">{category.name}</h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3">
              {category.description || t('list.noDescription')}
            </p>

            {/* Badges */}
            <div className="flex items-center space-x-2">
              {/* Item count badge */}
              <span className="px-3 py-1 bg-naples/20 text-charcoal text-xs font-semibold rounded-full">
                {t('list.itemCount', { count: category.itemCount })}
              </span>

              {/* Active/Inactive badge */}
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {category.isActive ? t('status.active') : t('status.inactive')}
              </span>
            </div>
          </div>

          {/* Actions - visible on mobile, hover on desktop */}
          <div className="sm:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 absolute top-4 right-4 flex space-x-2">
            {/* Edit button */}
            <button
              onClick={() => onEdit(category)}
              className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 rounded-md transition-colors"
              title={t('actions.edit')}
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={() => handleDelete(category)}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-600 rounded-md transition-colors"
              title={t('actions.delete')}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Display order indicator */}
          <div className="mt-4 pt-3 border-t border-antiflash">
            <p className="text-xs text-gray-500">
              {t('list.displayOrder')}{' '}
              <span className="font-semibold">{category.displayOrder}</span>
            </p>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="col-span-full bg-white rounded-lg shadow-md border border-antiflash p-12 text-center">
          <p className="text-gray-600">{t('list.noCategories')}</p>
        </div>
      )}
    </div>
  );
};
