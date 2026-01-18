import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { XIcon, UploadIcon, ImageIcon, StarIcon } from 'lucide-react';
import type { MenuItem } from '../../hooks/useMenuItems';
import type { PhotoInput } from '../../services/menuItemService';
import { Button } from '../common/Button';
import { useCategories } from '../../hooks/useCategories';

type PhotoState = PhotoInput & { previewUrl: string };

export interface MenuItemFormSubmitPayload {
  data: Record<string, unknown>;
  photos: PhotoInput[];
  removedPhotoIds: string[];
}

interface MenuItemFormProps {
  menuItem?: MenuItem;
  onSubmit: (payload: MenuItemFormSubmitPayload) => Promise<void>;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSubmit, onCancel }) => {
  const { t } = useTranslation('menu');
  const isEditMode = !!menuItem;
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from the Category table
  const { categories, isLoading: categoriesLoading, getActiveCategories } = useCategories();

  // Validation schema - must be inside component to access t()
  const menuItemFormSchema = z.object({
    name: z.string().min(2, t('form.validation.nameMin')).max(80, t('form.validation.nameMax')),
    description: z.string().max(500, t('form.validation.descriptionMax')).optional(),
    categoryId: z
      .string()
      .uuid(t('form.validation.categoryRequired'))
      .min(1, t('form.validation.categoryRequired')),
    price: z.number().min(0, t('form.validation.priceMin')),
    preparationTime: z
      .number()
      .min(0, t('form.validation.prepTimeMin'))
      .max(240, t('form.validation.prepTimeMax'))
      .optional(),
    isAvailable: z.boolean().default(true),
    isSoldOut: z.boolean().default(false),
    isChefRecommendation: z.boolean().default(false),
  });

  type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

  const initialPhotos = useMemo<PhotoState[]>(() => {
    if (menuItem?.photos?.length) {
      return menuItem.photos.map((photo, index) => ({
        id: photo.id,
        url: photo.url,
        isPrimary: photo.isPrimary ?? index === 0,
        previewUrl: photo.url,
      }));
    }

    if (menuItem?.imageUrl) {
      return [
        {
          url: menuItem.imageUrl,
          previewUrl: menuItem.imageUrl,
          isPrimary: true,
        },
      ];
    }

    return [];
  }, [menuItem]);

  const [photos, setPhotos] = useState<PhotoState[]>(initialPhotos);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: menuItem?.name || '',
      description: menuItem?.description || '',
      categoryId: menuItem?.categoryId || (categories.length > 0 ? categories[0].id : ''),
      price: menuItem?.price || 0,
      preparationTime: menuItem?.preparationTime || 15,
      isAvailable: menuItem?.isAvailable ?? true,
      isSoldOut: menuItem?.isSoldOut ?? false,
      isChefRecommendation: menuItem?.isChefRecommendation ?? false,
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (menuItem) {
      setValue('name', menuItem.name);
      setValue('description', menuItem.description ?? undefined);
      setValue('categoryId', menuItem.categoryId || '');
      setValue('price', menuItem.price);
      setValue('preparationTime', menuItem.preparationTime ?? undefined);
      setValue('isAvailable', menuItem.isAvailable);
      setValue('isSoldOut', menuItem.isSoldOut);
      setValue('isChefRecommendation', menuItem.isChefRecommendation);
    }

    setPhotos(initialPhotos);
    setRemovedPhotoIds([]);
  }, [menuItem, setValue, initialPhotos]);

  const onFormSubmit = async (data: MenuItemFormData) => {
    if (isLoading) return; // Prevent double submission

    try {
      if (photos.length === 0) {
        // Validation: at least one photo required
        console.warn('At least one image is required');
        return;
      }

      setIsLoading(true);

      // Check if any photo is already marked as primary
      const hasPrimary = photos.some((p) => p.isPrimary);

      const normalizedPhotos: PhotoInput[] = photos.map((photo, index) => ({
        id: photo.id,
        file: photo.file,
        url: photo.url,
        // Only set first photo as primary if no photo is explicitly marked as primary
        isPrimary: hasPrimary ? photo.isPrimary : index === 0,
      }));

      // Await the onSubmit to keep loading state during the operation
      await onSubmit({
        data: {
          ...data,
          description: data.description || '',
          preparationTime: data.preparationTime || 15,
          categoryId: data.categoryId,
        } as MenuItemFormData,
        photos: normalizedPhotos,
        removedPhotoIds,
      });

      if (!isEditMode) {
        reset();
        setPhotos([]);
        setRemovedPhotoIds([]);
        setFileInputKey((key) => key + 1);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      throw error; // Let parent handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        file,
        url: previewUrl,
        previewUrl,
        isPrimary: false,
      } as PhotoState;
    });

    setPhotos((prev) => {
      const merged = [...prev, ...incoming];
      if (!merged.some((p) => p.isPrimary) && merged.length > 0) {
        merged[0].isPrimary = true;
      }
      return merged;
    });

    // Reset file input so the same file can be selected again if needed
    setFileInputKey((key) => key + 1);
  };

  const handleSetPrimary = (index: number) => {
    setPhotos((prev) =>
      prev.map((photo, i) => ({
        ...photo,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const target = prev[index];
      const remaining = prev.filter((_, i) => i !== index);

      if (target?.id) {
        setRemovedPhotoIds((ids) => [...ids, target.id!]);
      }

      if (remaining.length > 0 && !remaining.some((p) => p.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  // Get active categories for the dropdown
  const activeCategories = getActiveCategories();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-naples border-t-transparent rounded-full animate-spin"></div>
            <p className="text-charcoal font-semibold">
              {isEditMode ? t('form.updating') : t('form.creating')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1">
            {t('form.name')} <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('form.namePlaceholder')}
            maxLength={80}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1">
            {t('form.description')}
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none resize-none ${
              errors.description ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('form.descriptionPlaceholder')}
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
            <label htmlFor="categoryId" className="block text-sm font-medium text-charcoal mb-1">
              {t('form.category')} <span className="text-red-600">*</span>
            </label>
            <select
              id="categoryId"
              {...register('categoryId')}
              disabled={categoriesLoading}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
                errors.categoryId ? 'border-red-500' : 'border-antiflash'
              } ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {categoriesLoading ? (
                <option value="">{t('form.loadingCategories', 'Loading categories...')}</option>
              ) : activeCategories.length === 0 ? (
                <option value="">{t('form.noCategories', 'No categories available')}</option>
              ) : (
                activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Price field */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-charcoal mb-1">
              {t('form.price')} <span className="text-red-600">*</span>
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
                errors.price ? 'border-red-500' : 'border-antiflash'
              }`}
              placeholder={t('form.pricePlaceholder')}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        </div>

        {/* Preparation Time */}
        <div>
          <label htmlFor="preparationTime" className="block text-sm font-medium text-charcoal mb-1">
            {t('form.preparationTime')}
          </label>
          <input
            id="preparationTime"
            type="number"
            {...register('preparationTime', { valueAsNumber: true })}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.preparationTime ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('form.preparationTimePlaceholder')}
          />
          {errors.preparationTime && (
            <p className="mt-1 text-sm text-red-600">{errors.preparationTime.message}</p>
          )}
        </div>

        {/* Image Upload Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-charcoal">
              {t('form.photos')} <span className="text-red-600">*</span>
            </label>
            <span className="text-xs text-gray-600">{t('form.photosHelper')}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <label className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-charcoal border border-antiflash rounded-md cursor-pointer transition-colors">
              <UploadIcon className="w-4 h-4 mr-2" />
              <span>{t('form.selectPhotos')}</span>
              <input
                key={fileInputKey}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </label>

            {photos.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setPhotos((prev) => {
                    if (prev.length === 0) return prev;
                    const next = [...prev];
                    next[0].isPrimary = true;
                    return next;
                  })
                }
                className="text-sm text-naples underline"
              >
                {t('form.ensurePrimary')}
              </button>
            )}
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.previewUrl + index}
                  className="relative group rounded-lg overflow-hidden border-2 border-antiflash bg-white"
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/150?text=Image';
                    }}
                  />

                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <label className="bg-white/80 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-charcoal shadow">
                      <input
                        type="radio"
                        name="primary-photo"
                        checked={!!photo.isPrimary}
                        onChange={() => handleSetPrimary(index)}
                        className="mr-1"
                      />
                      {t('form.primary')}
                    </label>
                    {photo.isPrimary && (
                      <span className="bg-naples text-charcoal text-xs font-semibold px-2 py-1 rounded-md flex items-center shadow">
                        <StarIcon className="w-3 h-3 mr-1" />
                        {t('form.featured')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('form.removePhoto')}
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-antiflash rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">{t('form.noPhotos')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('form.noPhotosHelper')}</p>
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
              {t('form.isAvailable')}
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
              {t('form.isSoldOut')}
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
              {t('form.isChefRecommendation')}
            </label>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {isEditMode ? t('form.update') : t('form.save')}
        </Button>
      </div>
    </form>
  );
};
