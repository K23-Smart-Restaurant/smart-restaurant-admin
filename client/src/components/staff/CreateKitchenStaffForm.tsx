import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import type { Staff } from '../../hooks/useStaff';
import { Button } from '../common/Button';

interface CreateKitchenStaffFormProps {
  staff?: Staff;
  onSubmit: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const CreateKitchenStaffForm: React.FC<CreateKitchenStaffFormProps> = ({
  staff,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation(['staff', 'common']);
  const isEditMode = !!staff;

  // Validation schema - must be inside component to use t()
  const kitchenStaffFormSchema = z
    .object({
      name: z.string().min(3, t('staff:form.validation.nameMin')),
      email: z.string().email(t('staff:form.validation.emailInvalid')),
      phoneNumber: z.string().optional(),
      password: z.string().min(8, t('staff:form.validation.passwordMin')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('staff:form.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });

  type KitchenStaffFormData = z.infer<typeof kitchenStaffFormSchema>;

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
      const { confirmPassword: _confirmPassword, ...staffData } = data;

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
            {t('staff:form.name')} <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('staff:form.namePlaceholder')}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">
            {t('staff:form.email')} <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.email ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('staff:form.emailPlaceholder')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Phone Number field */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-charcoal mb-1">
            {t('staff:form.phone')}
          </label>
          <input
            id="phoneNumber"
            type="tel"
            {...register('phoneNumber')}
            className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            placeholder={t('staff:form.phonePlaceholder')}
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1">
            {t('staff:form.password')} <span className="text-red-600">*</span>
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.password ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('staff:form.passwordPlaceholder')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-1">
            {t('staff:form.confirmPassword')} <span className="text-red-600">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className={`w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none ${
              errors.confirmPassword ? 'border-red-500' : 'border-antiflash'
            }`}
            placeholder={t('staff:form.confirmPasswordPlaceholder')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-antiflash">
        <Button type="button" onClick={onClose} variant="secondary">
          {t('common:buttons.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('common:actions.saving')
            : isEditMode
              ? t('common:buttons.save')
              : t('staff:modals.createKitchenStaff')}
        </Button>
      </div>
    </form>
  );
};
