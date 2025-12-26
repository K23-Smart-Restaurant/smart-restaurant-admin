import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XIcon, UploadIcon, ImageIcon, StarIcon } from "lucide-react";
import type { MenuItem, MenuCategory } from "../../hooks/useMenuItems";
import type { PhotoInput } from "../../services/menuItemService";
import { Button } from "../common/Button";

// Validation schema
const menuItemFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  category: z.enum(["APPETIZER", "MAIN_COURSE", "DESSERT", "BEVERAGE"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  price: z.number().min(0, "Price must be 0 or greater"),
  preparationTime: z
    .number()
    .min(0, "Preparation time must be 0 or greater")
    .max(240, "Preparation time must be 240 minutes or less")
    .optional(),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  isChefRecommendation: z.boolean().default(false),
  categoryId: z.string().optional(),
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

type PhotoState = PhotoInput & { previewUrl: string };

export interface MenuItemFormSubmitPayload {
  data: MenuItemFormData;
  photos: PhotoInput[];
  removedPhotoIds: string[];
}

interface MenuItemFormProps {
  menuItem?: MenuItem;
  onSubmit: (payload: MenuItemFormSubmitPayload) => Promise<void>;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSubmit, onCancel }) => {
  const isEditMode = !!menuItem;
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      name: menuItem?.name || "",
      description: menuItem?.description || "",
      category: menuItem?.category || "MAIN_COURSE",
      price: menuItem?.price || 0,
      preparationTime: menuItem?.preparationTime || 15,
      isAvailable: menuItem?.isAvailable ?? true,
      isSoldOut: menuItem?.isSoldOut ?? false,
      isChefRecommendation: menuItem?.isChefRecommendation ?? false,
      categoryId: menuItem?.categoryId || "",
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (menuItem) {
      setValue("name", menuItem.name);
      setValue("description", menuItem.description ?? undefined);
      setValue("category", menuItem.category);
      setValue("price", menuItem.price);
      setValue("preparationTime", menuItem.preparationTime ?? undefined);
      setValue("isAvailable", menuItem.isAvailable);
      setValue("isSoldOut", menuItem.isSoldOut);
      setValue("isChefRecommendation", menuItem.isChefRecommendation);
      setValue("categoryId", menuItem.categoryId || "");
    }

    setPhotos(initialPhotos);
    setRemovedPhotoIds([]);
  }, [menuItem, setValue, initialPhotos]);

  const onFormSubmit = async (data: MenuItemFormData) => {
    if (isLoading) return; // Prevent double submission

    try {
      if (photos.length === 0) {
        alert("Please add at least one image");
        return;
      }

      setIsLoading(true);

      const normalizedPhotos: PhotoInput[] = photos.map((photo, index) => ({
        id: photo.id,
        file: photo.file,
        url: photo.url,
        isPrimary: photo.isPrimary || (!photo.isPrimary && index === 0),
      }));

      // Await the onSubmit to keep loading state during the operation
      await onSubmit({
        data: {
          ...data,
          description: data.description || "",
          preparationTime: data.preparationTime || 15,
          categoryId: data.categoryId || undefined,
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
      console.error("Error saving menu item:", error);
      alert("Failed to save menu item");
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

  const categoryOptions: { value: MenuCategory; label: string }[] = [
    { value: "APPETIZER", label: "Appetizer" },
    { value: "MAIN_COURSE", label: "Main Course" },
    { value: "DESSERT", label: "Dessert" },
    { value: "BEVERAGE", label: "Beverage" },
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-naples border-t-transparent rounded-full animate-spin"></div>
            <p className="text-charcoal font-semibold">
              {isEditMode ? 'Updating menu item...' : 'Creating menu item...'}
            </p>
          </div>
        </div>
      )}

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
            maxLength={80}
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

        {/* Image Upload Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-charcoal">
              Photos <span className="text-red-600">*</span>
            </label>
            <span className="text-xs text-gray-600">JPG / PNG / WebP · Max 5MB</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <label className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-charcoal border border-antiflash rounded-md cursor-pointer transition-colors">
              <UploadIcon className="w-4 h-4 mr-2" />
              <span>Select photos</span>
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
                onClick={() => setPhotos((prev) => {
                  if (prev.length === 0) return prev;
                  const next = [...prev];
                  next[0].isPrimary = true;
                  return next;
                })}
                className="text-sm text-naples underline"
              >
                Ensure primary photo is first
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
                      (e.target as HTMLImageElement).src = "https://placehold.co/150?text=Image";
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
                      Primary
                    </label>
                    {photo.isPrimary && (
                      <span className="bg-naples text-charcoal text-xs font-semibold px-2 py-1 rounded-md flex items-center shadow">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Featured
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-antiflash rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">No photos added yet</p>
              <p className="text-xs text-gray-500 mt-1">Upload up to 5 photos and choose a primary image</p>
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
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {isEditMode ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};
