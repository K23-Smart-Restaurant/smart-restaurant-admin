import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category } from '../../hooks/useCategories';
import type { CreateCategoryDto } from '../../services/categoryService';
import { Button } from '../common/Button';

// Validation schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  description: z.string().max(200, 'Description must be at most 200 characters').optional(),
  displayOrder: z.number().min(0, 'Display order must be 0 or greater').default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryDto) => void | Promise<void>;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const isEditMode = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      displayOrder: category?.displayOrder || 0,
      isActive: category?.isActive ?? true,
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description);
      setValue('displayOrder', category.displayOrder);
      setValue('isActive', category.isActive);
    }
  }, [category, setValue]);

  const onFormSubmit = async (data: CategoryFormData) => {
    try {
      // Call parent's onSubmit with category data (without itemCount - it's computed server-side)
      await onSubmit({
        ...data,
        description: data.description || '',
      });

      // Reset form if creating new
      if (!isEditMode) {
        reset();
      }

      onCancel();
    } catch (error) {
      console.error('Error saving category:', error);
      throw error; // Let parent handle the error
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${errors.name ? 'border-red-500' : 'border-antiflash'
              }`}
            placeholder="Enter category name"
            maxLength={50}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none resize-none ${errors.description ? 'border-red-500' : 'border-antiflash'
              }`}
            placeholder="Enter category description (optional)"
            rows={3}
            maxLength={200}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Display Order field */}
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-charcoal mb-1">
            Display Order
          </label>
          <input
            id="displayOrder"
            type="number"
            {...register('displayOrder', { valueAsNumber: true })}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${errors.displayOrder ? 'border-red-500' : 'border-antiflash'
              }`}
            placeholder="0"
            min={0}
          />
          {errors.displayOrder && (
            <p className="mt-1 text-sm text-red-600">{errors.displayOrder.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-600">
            Lower numbers appear first in the menu
          </p>
        </div>

        {/* Active toggle switch */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-charcoal">
              Active
            </label>
            <p className="text-xs text-gray-600">
              {isEditMode ? 'Toggle to activate/deactivate this category' : 'Category will be active by default'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-naples peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naples"></div>
          </label>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </Button>
      </div>
    </form>
  );
};
