import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import type { Table, TableStatus } from '../../hooks/useTables';
import { Button } from '../common/Button';

interface TableFormProps {
  table?: Table;
  onSubmit: (
    data: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode' | 'qrToken' | 'qrTokenCreatedAt'>
  ) => void;
  onCancel: () => void;
  existingLocations?: string[]; // For location suggestions
}

export const TableForm: React.FC<TableFormProps> = ({
  table,
  onSubmit,
  onCancel,
  existingLocations = [],
}) => {
  const { t } = useTranslation(['tables', 'common']);
  const isEditMode = !!table;

  // Validation schema with translations
  const tableFormSchema = z.object({
    tableNumber: z
      .number({
        required_error: t('tables:form.validation.tableNumberRequired'),
        invalid_type_error: t('tables:form.validation.tableNumberRequired'),
      })
      .min(1, t('tables:form.validation.tableNumberMin')),
    capacity: z
      .number({
        required_error: t('tables:form.validation.capacityRequired'),
        invalid_type_error: t('tables:form.validation.capacityRequired'),
      })
      .min(1, t('tables:form.validation.capacityMin'))
      .max(50, t('tables:form.validation.capacityMax')),
    location: z
      .string()
      .min(1, t('tables:form.validation.locationRequired'))
      .max(100, t('tables:form.validation.locationMax')),
    description: z.string().max(500, t('tables:form.validation.descriptionMax')).optional(),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED'], {
      required_error: t('tables:form.validation.statusRequired'),
    }),
  });

  type TableFormData = z.infer<typeof tableFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      tableNumber: table?.tableNumber || 1,
      capacity: table?.capacity || 4,
      location: table?.location || '',
      description: table?.description || '',
      status: table?.status || 'AVAILABLE',
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (table) {
      setValue('tableNumber', table.tableNumber);
      setValue('capacity', table.capacity);
      setValue('location', table.location);
      setValue('description', table.description || '');
      setValue('status', table.status);
    }
  }, [table, setValue]);

  const onFormSubmit = async (data: TableFormData) => {
    try {
      // Call parent's onSubmit with table data, including isActive (default true)
      onSubmit({
        ...data,
        isActive: table?.isActive ?? true,
      });

      // Reset form if creating new
      if (!isEditMode) {
        reset();
      }
    } catch (error) {
      console.error('Error saving table:', error);
      throw error; // Let parent handle the error
    }
  };

  const statusOptions: { value: TableStatus; label: string; color: string }[] = [
    { value: 'AVAILABLE', label: t('tables:status.available'), color: 'text-green-600' },
    { value: 'OCCUPIED', label: t('tables:status.occupied'), color: 'text-red-600' },
    { value: 'RESERVED', label: t('tables:status.reserved'), color: 'text-yellow-600' },
  ];

  // Common location suggestions
  const locationSuggestions = Array.from(
    new Set([
      t('tables:locations.mainFloor'),
      t('tables:locations.patio'),
      t('tables:locations.privateRoomA'),
      t('tables:locations.privateRoomB'),
      t('tables:locations.bar'),
      t('tables:locations.terrace'),
      t('tables:locations.vip'),
      ...existingLocations,
    ])
  ).sort();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Table Number and Capacity row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Table Number field */}
          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-charcoal mb-1">
              {t('tables:form.tableNumber')}{' '}
              <span className="text-red-600">{t('tables:form.required')}</span>
            </label>
            <input
              id="tableNumber"
              type="number"
              {...register('tableNumber', { valueAsNumber: true })}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
                errors.tableNumber ? 'border-red-500' : 'border-antiflash'
              }`}
              placeholder={t('tables:form.tableNumberPlaceholder')}
              min="1"
            />
            {errors.tableNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.tableNumber.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">{t('tables:form.tableNumberHelp')}</p>
          </div>

          {/* Capacity field */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-charcoal mb-1">
              {t('tables:form.capacity')}{' '}
              <span className="text-red-600">{t('tables:form.required')}</span>
            </label>
            <input
              id="capacity"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
                errors.capacity ? 'border-red-500' : 'border-antiflash'
              }`}
              placeholder={t('tables:form.capacityPlaceholder')}
              min="1"
              max="50"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">{t('tables:form.capacityHelp')}</p>
          </div>
        </div>

        {/* Location field with suggestions */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-charcoal mb-1">
            {t('tables:form.location')}{' '}
            <span className="text-red-600">{t('tables:form.required')}</span>
          </label>
          <input
            id="location"
            type="text"
            list="location-suggestions"
            {...register('location')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.location ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('tables:form.locationPlaceholder')}
            maxLength={100}
          />
          <datalist id="location-suggestions">
            {locationSuggestions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-600">{t('tables:form.locationHelp')}</p>
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1">
            {t('tables:form.description')}
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder={t('tables:form.descriptionPlaceholder')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none resize-none ${
              errors.description ? 'border-red-500' : 'border-antiflash'
            }`}
            maxLength={500}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Status field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-charcoal mb-1">
            {t('tables:form.status')}{' '}
            <span className="text-red-600">{t('tables:form.required')}</span>
          </label>
          <select
            id="status"
            {...register('status')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.status ? 'border-red-500' : 'border-antiflash'
            }`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          <p className="mt-1 text-xs text-gray-600">{t('tables:form.statusHelp')}</p>
        </div>

        {/* Quick capacity presets */}
        <div>
          <p className="text-sm font-medium text-charcoal mb-2">{t('tables:form.quickCapacity')}</p>
          <div className="flex flex-wrap gap-2">
            {[2, 4, 6, 8].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue('capacity', preset)}
                className="px-3 py-1 bg-gray-200 hover:bg-naples hover:text-charcoal border border-antiflash rounded-md text-sm text-charcoal transition-colors"
              >
                {t('tables:form.seatsPreset', { count: preset })}
              </button>
            ))}
          </div>
        </div>

        {/* Info box for new tables */}
        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>{t('tables:form.newTableNote')}</strong> {t('tables:form.newTableInfo')}
            </p>
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" onClick={onCancel} variant="secondary">
          {t('tables:form.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('tables:form.saving')
            : isEditMode
              ? t('tables:form.updateTable')
              : t('tables:form.createTable')}
        </Button>
      </div>
    </form>
  );
};
