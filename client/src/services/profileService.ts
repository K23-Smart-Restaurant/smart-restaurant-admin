import { apiClient } from './api';

export interface ProfileUpdateData {
  name?: string;
  phoneNumber?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
}

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<ProfileResponse>('/auth/me');
  return response.data.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (data: ProfileUpdateData): Promise<UserProfile> => {
  const response = await apiClient.patch<ProfileResponse>('/auth/me', data);
  return response.data.data;
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiClient.post<ProfileResponse>('/auth/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};
