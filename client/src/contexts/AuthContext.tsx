import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../services/api';

// User roles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'WAITER' | 'KITCHEN_STAFF';

// User type
export interface User {
  id: number;
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
  login: (email: string, password: string) => Promise<void>;
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
          // Verify token is still valid
          const { data } = await apiClient.get<User>('/auth/me');
          setUser(data);
        } catch (_error) {
          // Token invalid, clear storage
          localStorage.removeItem('admin_jwt_token');
          localStorage.removeItem('admin_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });

      // Store token and user
      localStorage.setItem('admin_jwt_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('admin_jwt_token');
    localStorage.removeItem('admin_user');
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
