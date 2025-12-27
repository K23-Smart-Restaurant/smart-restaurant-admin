import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../services/api';

// User roles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'WAITER' | 'KITCHEN_STAFF';

// User type
export interface User {
  id: string;  // UUID from backend
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      const storedUser = localStorage.getItem('admin_user');

      if (token && storedUser) {
        try {
          // Try to parse stored user first
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Try to verify token is still valid (optional check)
          try {
            const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
            // Extract user from nested response structure
            const verifiedUser = response.data.data || response.data;
            // Update with fresh data if successful
            setUser(verifiedUser);
            localStorage.setItem('admin_user', JSON.stringify(verifiedUser));
          } catch (verifyError) {
            // If verification fails, trust the stored token anyway
            // This prevents logout on server errors
            console.warn('Token verification failed, using cached user data:', verifyError);
          }
        } catch (parseError) {
          // If stored user is corrupted, clear everything
          console.error('Failed to parse stored user:', parseError);
          localStorage.removeItem('admin_jwt_token');
          localStorage.removeItem('admin_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: { token: string; user: User; refreshToken?: string }
      }>('/auth/login', {
        email,
        password,
        rememberMe,
      });

      // Extract token, user, and optional refresh token from nested data structure
      const { token, user: userData, refreshToken } = response.data.data;

      // Store token and user
      localStorage.setItem('admin_jwt_token', token);
      localStorage.setItem('admin_user', JSON.stringify(userData));

      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('admin_refresh_token', refreshToken);
      }

      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');

    // Invalidate refresh token on server
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('admin_jwt_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('admin_user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
