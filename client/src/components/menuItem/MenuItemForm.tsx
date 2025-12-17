import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XIcon, UploadIcon, ImageIcon } from 'lucide-react';
import type { MenuItem, MenuCategory } from '../../hooks/useMenuItems';
import { Button } from '../common/Button';

// Validation schema
const menuItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  category: z.enum(['APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  price: z.number().min(0, 'Price must be 0 or greater'),
  preparationTime: z.number().min(0, 'Preparation time must be 0 or greater').optional(),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  isChefRecommendation: z.boolean().default(false),
  categoryId: z.string().optional(),
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  menuItem?: MenuItem;
  onSubmit: (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'modifiers'>, imageUrls: string[]) => void;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSubmit, onCancel }) => {
  const isEditMode = !!menuItem;
  const [imageUrls, setImageUrls] = useState<string[]>(menuItem?.imageUrls || []);
  const [imageInput, setImageInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: menuItem?.name || '',
      description: menuItem?.description || '',
      category: menuItem?.category || 'MAIN_COURSE',
      price: menuItem?.price || 0,
      preparationTime: menuItem?.preparationTime || 15,
      isAvailable: menuItem?.isAvailable ?? true,
      isSoldOut: menuItem?.isSoldOut ?? false,
      isChefRecommendation: menuItem?.isChefRecommendation ?? false,
      categoryId: menuItem?.categoryId || '',
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (menuItem) {
      setValue('name', menuItem.name);
      setValue('description', menuItem.description);
      setValue('category', menuItem.category);
      setValue('price', menuItem.price);
      setValue('preparationTime', menuItem.preparationTime);
      setValue('isAvailable', menuItem.isAvailable);
      setValue('isSoldOut', menuItem.isSoldOut);
      setValue('isChefRecommendation', menuItem.isChefRecommendation);
      setValue('categoryId', menuItem.categoryId || '');
      setImageUrls(menuItem.imageUrls || []);
    }
  }, [menuItem, setValue]);

  const onFormSubmit = async (data: MenuItemFormData) => {
    try {
      if (imageUrls.length === 0) {
        alert('Please add at least one image');
        return;
      }

      // Call parent's onSubmit with menu item data
      onSubmit(
        {
          ...data,
          description: data.description || '',
          preparationTime: data.preparationTime || 15,
          categoryId: data.categoryId || undefined,
        } as any,
        imageUrls
      );

      // Reset form if creating new
      if (!isEditMode) {
        reset();
        setImageUrls([]);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setImageUrls([...imageUrls, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImageUrl();
    }
  };

  const categoryOptions: { value: MenuCategory; label: string }[] = [
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'MAIN_COURSE', label: 'Main Course' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'BEVERAGE', label: 'Beverage' },
  ];

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
            placeholder="Enter menu item name"
            maxLength={100}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none resize-none ${errors.description ? 'border-red-500' : 'border-antiflash'
              }`}
            placeholder="Enter item description"
            maxLength={500}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Category and Price row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-charcoal mb-1">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              id="category"
              {...register('category')}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${errors.category ? 'border-red-500' : 'border-antiflash'
                }`}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Price field */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-charcoal mb-1">
              Price ($) <span className="text-red-600">*</span>
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${errors.price ? 'border-red-500' : 'border-antiflash'
                }`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        </div>

        {/* Preparation Time */}
        <div>
          <label htmlFor="preparationTime" className="block text-sm font-medium text-charcoal mb-1">
            Preparation Time (minutes)
          </label>
          <input
            id="preparationTime"
            type="number"
            {...register('preparationTime', { valueAsNumber: true })}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${errors.preparationTime ? 'border-red-500' : 'border-antiflash'
              }`}
            placeholder="15"
          />
          {errors.preparationTime && (
            <p className="mt-1 text-sm text-red-600">{errors.preparationTime.message}</p>
          )}
        </div>

        {/* Image URLs Section */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Images <span className="text-red-600">*</span>
          </label>

          {/* Image input */}
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
              placeholder="Enter image URL and press Enter or click Add"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addImageUrl}
              icon={UploadIcon}
            >
              Add
            </Button>
          </div>

          {/* Image preview grid */}
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-antiflash"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-antiflash rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">No images added yet</p>
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center">
            <input
              id="isAvailable"
              type="checkbox"
              {...register('isAvailable')}
              className="w-4 h-4 text-naples bg-gray-200 border-antiflash rounded focus:ring-naples focus:ring-2"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm text-charcoal">
              Available for ordering
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="isSoldOut"
              type="checkbox"
              {...register('isSoldOut')}
              className="w-4 h-4 text-naples bg-gray-200 border-antiflash rounded focus:ring-naples focus:ring-2"
            />
            <label htmlFor="isSoldOut" className="ml-2 text-sm text-charcoal">
              Sold out
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="isChefRecommendation"
              type="checkbox"
              {...register('isChefRecommendation')}
              className="w-4 h-4 text-naples bg-gray-200 border-antiflash rounded focus:ring-naples focus:ring-2"
            />
            <label htmlFor="isChefRecommendation" className="ml-2 text-sm text-charcoal">
              Chef's recommendation
            </label>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};
