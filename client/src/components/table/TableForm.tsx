import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Table, TableStatus } from '../../hooks/useTables';
import { Button } from '../common/Button';

// Validation schema
const tableFormSchema = z.object({
  tableNumber: z.number().min(1, 'Table number must be at least 1'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(50, 'Capacity cannot exceed 50'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be at most 100 characters'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
});

type TableFormData = z.infer<typeof tableFormSchema>;

interface TableFormProps {
  table?: Table;
  onSubmit: (data: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode'>) => void;
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
    watch,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      tableNumber: table?.tableNumber || 1,
      capacity: table?.capacity || 4,
      location: table?.location || '',
      status: table?.status || 'AVAILABLE',
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (table) {
      setValue('tableNumber', table.tableNumber);
      setValue('capacity', table.capacity);
      setValue('location', table.location);
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Table Number and Capacity row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Table Number field */}
          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-charcoal mb-1">
              Table Number <span className="text-red-600">*</span>
            </label>
            <input
              id="tableNumber"
              type="number"
              {...register('tableNumber', { valueAsNumber: true })}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
                errors.tableNumber ? 'border-red-500' : 'border-antiflash'
              }`}
              placeholder="1"
              min="1"
            />
            {errors.tableNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.tableNumber.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">Unique identifier for the table</p>
          </div>

          {/* Capacity field */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-charcoal mb-1">
              Seating Capacity <span className="text-red-600">*</span>
            </label>
            <input
              id="capacity"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
                errors.capacity ? 'border-red-500' : 'border-antiflash'
              }`}
              placeholder="4"
              min="1"
              max="50"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">Maximum number of guests</p>
          </div>
        </div>

        {/* Location field with suggestions */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-charcoal mb-1">
            Location <span className="text-red-600">*</span>
          </label>
          <input
            id="location"
            type="text"
            list="location-suggestions"
            {...register('location')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.location ? 'border-red-500' : 'border-antiflash'
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
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-600">
            Physical location in the restaurant (start typing to see suggestions)
          </p>
        </div>

        {/* Status field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-charcoal mb-1">
            Current Status <span className="text-red-600">*</span>
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
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <span className="w-20 font-medium">Available:</span>
              <span>Ready for new guests</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 font-medium">Occupied:</span>
              <span>Currently serving guests</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 font-medium">Reserved:</span>
              <span>Booked for upcoming guests</span>
            </div>
          </div>
        </div>

        {/* Quick capacity presets */}
        <div className="bg-antiflash/50 p-4 rounded-lg">
          <p className="text-sm font-medium text-charcoal mb-2">Quick Capacity Presets:</p>
          <div className="flex flex-wrap gap-2">
            {[2, 4, 6, 8].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue('capacity', preset)}
                className="px-3 py-1 bg-white hover:bg-naples/20 border border-antiflash rounded-md text-sm text-charcoal transition-colors"
              >
                {preset} seats
              </button>
            ))}
          </div>
        </div>

        {/* Info box for new tables */}
        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> A QR code will be automatically generated for this table after creation. 
              Guests can scan this code to access the menu and place orders.
            </p>
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Table' : 'Create Table'}
        </Button>
      </div>
    </form>
  );
};
