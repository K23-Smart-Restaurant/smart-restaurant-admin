import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Staff } from '../../hooks/useStaff';import { Button } from '../common/Button';
// Validation schema (same as waiter form)
const kitchenStaffFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type KitchenStaffFormData = z.infer<typeof kitchenStaffFormSchema>;

interface CreateKitchenStaffFormProps {
  staff?: Staff;
  onSubmit: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const CreateKitchenStaffForm: React.FC<CreateKitchenStaffFormProps> = ({ staff, onSubmit, onClose }) => {
  const isEditMode = !!staff;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<KitchenStaffFormData>({
    resolver: zodResolver(kitchenStaffFormSchema),
    defaultValues: {
      name: staff?.name || '',
      email: staff?.email || '',
      phoneNumber: staff?.phoneNumber || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onFormSubmit = async (data: KitchenStaffFormData) => {
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...staffData } = data;
      
      // Call parent's onSubmit with staff data
      onSubmit({
        ...staffData,
        phoneNumber: staffData.phoneNumber || null,
        role: 'KITCHEN_STAFF',
        isActive: staff?.isActive ?? true,
      });
      
      // Reset form and close modal
      if (!isEditMode) {
        reset();
      }
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} kitchen staff:`, error);
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
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.email ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder="email@restaurant.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number field */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-charcoal mb-1">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            {...register('phoneNumber')}
            className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            placeholder="+1234567890"
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1">
            Password <span className="text-red-600">*</span>
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.password ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder="Minimum 8 characters"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-1">
            Confirm Password <span className="text-red-600">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.confirmPassword ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Kitchen Staff Account'}
        </Button>
      </div>
    </form>
  );
};
