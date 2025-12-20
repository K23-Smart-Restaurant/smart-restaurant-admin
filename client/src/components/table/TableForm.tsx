import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Table, TableStatus } from '../../hooks/useTables';
import { Button } from '../common/Button';

// Validation schema
const tableFormSchema = z.object({
  tableNumber: z.number().min(1, 'Table number must be at least 1'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(20, 'Capacity cannot exceed 20'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
});

type TableFormData = z.infer<typeof tableFormSchema>;

interface TableFormProps {
  table?: Table;
  onSubmit: (data: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode' | 'qrToken' | 'qrTokenCreatedAt'>) => void;
  onCancel: () => void;
  existingLocations?: string[]; // For location suggestions
}

export const TableForm: React.FC<TableFormProps> = ({
  table,
  onSubmit,
  onCancel,
  existingLocations = []
}) => {
  const isEditMode = !!table;

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
      // Call parent's onSubmit with table data
      onSubmit(data);

      // Show success message
      alert(`Table ${isEditMode ? 'updated' : 'created'} successfully!`);

      // Reset form if creating new
      if (!isEditMode) {
        reset();
      }
    } catch (error) {
      console.error('Error saving table:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to save table');
      }
    }
  };

  const statusOptions: { value: TableStatus; label: string; color: string }[] = [
    { value: 'AVAILABLE', label: 'Available', color: 'text-green-600' },
    { value: 'OCCUPIED', label: 'Occupied', color: 'text-red-600' },
    { value: 'RESERVED', label: 'Reserved', color: 'text-yellow-600' },
  ];

  // Common location suggestions
  const locationSuggestions = Array.from(
    new Set([
      'Main Floor',
      'Patio',
      'Private Room A',
      'Private Room B',
      'Bar Area',
      'Window Section',
      'Garden',
      'VIP Area',
      ...existingLocations,
    ])
  ).sort();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 animate-fade-in-up">
      <div className="space-y-5">
        {/* Table Number and Capacity row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Table Number field */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <label htmlFor="tableNumber" className="block text-sm font-semibold text-charcoal mb-2">
              Table Number <span className="text-red-600">*</span>
            </label>
            <input
              id="tableNumber"
              type="number"
              {...register('tableNumber', { valueAsNumber: true })}
              className={`w-full bg-white px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary focus:outline-none transition-all duration-300 ${errors.tableNumber ? 'border-red-500' : 'border-gray-200 hover:border-gradient-primary/50'
                }`}
              placeholder="1"
              min="1"
            />
            {errors.tableNumber && (
              <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.tableNumber.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">Unique identifier for the table</p>
          </div>

          {/* Capacity field */}
          <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <label htmlFor="capacity" className="block text-sm font-semibold text-charcoal mb-2">
              Seating Capacity <span className="text-red-600">*</span>
            </label>
            <input
              id="capacity"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className={`w-full bg-white px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary focus:outline-none transition-all duration-300 ${errors.capacity ? 'border-red-500' : 'border-gray-200 hover:border-gradient-primary/50'
                }`}
              placeholder="4"
              min="1"
              max="50"
            />
            {errors.capacity && (
              <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.capacity.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">Maximum number of guests</p>
          </div>
        </div>

        {/* Location field with suggestions */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <label htmlFor="location" className="block text-sm font-semibold text-charcoal mb-2">
            Location <span className="text-red-600">*</span>
          </label>
          <input
            id="location"
            type="text"
            list="location-suggestions"
            {...register('location')}
            className={`w-full bg-white px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary focus:outline-none transition-all duration-300 ${errors.location ? 'border-red-500' : 'border-gray-200 hover:border-gradient-primary/50'
              }`}
            placeholder="e.g., Main Floor, Patio, Private Room"
            maxLength={100}
          />
          <datalist id="location-suggestions">
            {locationSuggestions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          {errors.location && (
            <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.location.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Physical location in the restaurant (start typing to see suggestions)
          </p>
        </div>

        {/* Description field */}
        <div className="animate-fade-in-up" style={{ animationDelay: '125ms' }}>
          <label htmlFor="description" className="block text-sm font-semibold text-charcoal mb-2">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Additional notes about this table (e.g., 'Window view', 'Near kitchen', 'Quiet corner')..."
            className={`w-full bg-white px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary focus:outline-none transition-all duration-300 resize-none ${errors.description ? 'border-red-500' : 'border-gray-200 hover:border-gradient-primary/50'
              }`}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.description.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Optional additional information about this table
          </p>
        </div>

        {/* Status field */}
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <label htmlFor="status" className="block text-sm font-semibold text-charcoal mb-2">
            Current Status <span className="text-red-600">*</span>
          </label>
          <select
            id="status"
            {...register('status')}
            className={`w-full bg-white px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary focus:outline-none transition-all duration-300 ${errors.status ? 'border-red-500' : 'border-gray-200 hover:border-gradient-primary/50'
              }`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.status.message}</p>
          )}
          <div className="mt-3 space-y-2 text-xs bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-100">
            <div className="flex items-center">
              <span className="w-20 font-semibold text-gray-700">Available:</span>
              <span className="text-gray-600">Ready for new guests</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 font-semibold text-gray-700">Occupied:</span>
              <span className="text-gray-600">Currently serving guests</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 font-semibold text-gray-700">Reserved:</span>
              <span className="text-gray-600">Booked for upcoming guests</span>
            </div>
          </div>
        </div>

        {/* Quick capacity presets */}
        <div className="bg-gradient-to-r from-gradient-primary/5 to-gradient-secondary/5 p-5 rounded-xl border border-gradient-primary/10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm font-semibold text-charcoal mb-3">Quick Capacity Presets:</p>
          <div className="flex flex-wrap gap-2">
            {[2, 4, 6, 8].map((preset, index) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue('capacity', preset)}
                className="px-4 py-2 bg-white hover:bg-gradient-to-r hover:from-gradient-primary hover:to-gradient-secondary hover:text-white border-2 border-gray-200 hover:border-transparent rounded-xl text-sm font-semibold text-charcoal transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                style={{ animationDelay: `${250 + index * 50}ms` }}
              >
                {preset} seats
              </button>
            ))}
          </div>
        </div>

        {/* Info box for new tables */}
        {!isEditMode && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-blue-900 font-medium">
              <strong className="text-blue-700">💡 Note:</strong> A QR code will be automatically generated for this table after creation.
              Guests can scan this code to access the menu and place orders.
            </p>
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t-2 border-gray-100 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Table' : 'Create Table'}
        </Button>
      </div>
    </form>
  );
};
