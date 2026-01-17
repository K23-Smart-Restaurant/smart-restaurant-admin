import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserIcon, MailIcon, PhoneIcon, ShieldIcon, SaveIcon, EditIcon, ArrowLeftIcon, CameraIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, uploadAvatar, getProfile, type UserProfile } from '../services/profileService';
import { Button } from '../components/common/Button';
import { useToastContext } from '../contexts/ToastContext';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation schema
  const profileSchema = z.object({
    name: z.string().min(2, t('validation.minLength', { count: 2 })),
    phoneNumber: z.string().optional(),
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: '',
    },
  });

  // Fetch full profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setProfileData(profile);
        reset({
          name: profile.name || '',
          phoneNumber: profile.phoneNumber || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await updateProfile({
        name: data.name,
        phoneNumber: data.phoneNumber || null,
      });

      // Update profile data state
      setProfileData(updatedUser);

      // Update local auth context
      updateUser({
        ...user!,
        name: updatedUser.name,
      });

      showSuccess(t('profile.title'), t('profile.updateSuccess'));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError(t('profile.title'), t('profile.updateError'));
    }
  };

  const handleCancel = () => {
    reset({
      name: profileData?.name || user?.name || '',
      phoneNumber: profileData?.phoneNumber || '',
    });
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setIsUploadingAvatar(true);
      const updatedUser = await uploadAvatar(file);
      
      // Update profile data state
      setProfileData(updatedUser);

      // Update local auth context
      updateUser({
        ...user!,
        avatar: updatedUser.avatarUrl || undefined,
      });
      
      showSuccess(t('profile.title'), t('profile.avatarSuccess'));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showError(t('profile.title'), t('profile.avatarError'));
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || profileData?.avatarUrl || user.avatar;
  const displayName = profileData?.name || user.name;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-charcoal hover:text-naples transition-colors duration-300 mb-6 group"
      >
        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium">{t('buttons.back')}</span>
      </button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">
          {t('profile.title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('profile.subtitle')}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-elevation-2 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-naples/20 to-arylide/20 px-6 py-8">
          <div className="flex items-center space-x-4">
            {/* Avatar with upload capability */}
            <div className="relative">
              <div
                onClick={handleAvatarClick}
                className={`w-20 h-20 rounded-full bg-gradient-to-r from-naples to-arylide flex items-center justify-center shadow-lg overflow-hidden ${
                  isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                }`}
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
                ) : displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-charcoal font-bold text-3xl">
                    {displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-naples rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <CameraIcon className="w-4 h-4 text-charcoal" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">{displayName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-naples/20 text-charcoal">
                <ShieldIcon className="w-4 h-4 mr-1" />
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-charcoal mb-2">
              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
              {t('profile.name')}
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-naples focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder={t('profile.namePlaceholder')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </>
            ) : (
              <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal">
                {displayName}
              </p>
            )}
          </div>

          {/* Email Field - Read Only */}
          <div>
            <label className="flex items-center text-sm font-medium text-charcoal mb-2">
              <MailIcon className="w-4 h-4 mr-2 text-gray-500" />
              {t('profile.email')}
              <span className="ml-2 text-xs text-gray-400">({t('profile.readOnly')})</span>
            </label>
            <p className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600">
              {user.email}
            </p>
          </div>

          {/* Phone Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-charcoal mb-2">
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
              {t('profile.phone')}
            </label>
            {isEditing ? (
              <input
                type="tel"
                {...register('phoneNumber')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-naples focus:border-transparent transition-all"
                placeholder={t('profile.phonePlaceholder')}
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal">
                {profileData?.phoneNumber || '-'}
              </p>
            )}
          </div>

          {/* Role Field - Read Only */}
          <div>
            <label className="flex items-center text-sm font-medium text-charcoal mb-2">
              <ShieldIcon className="w-4 h-4 mr-2 text-gray-500" />
              {t('profile.role')}
              <span className="ml-2 text-xs text-gray-400">({t('profile.readOnly')})</span>
            </label>
            <p className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600">
              {user.role.replace('_', ' ')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            {isEditing ? (
              <>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  {t('buttons.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {isSubmitting ? t('actions.saving') : t('buttons.save')}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <EditIcon className="w-4 h-4 mr-2" />
                {t('profile.editButton')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
