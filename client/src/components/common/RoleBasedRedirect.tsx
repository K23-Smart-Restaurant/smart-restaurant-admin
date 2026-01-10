import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * T420: RoleBasedRedirect Component
 * Redirects users to appropriate dashboards based on their role after login
 */
export const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated - redirect to login
        navigate('/login', { replace: true });
      } else if (user) {
        // Authenticated - redirect based on user role
        switch (user.role) {
          case 'KITCHEN_STAFF':
            navigate('/kitchen', { replace: true });
            break;
          case 'WAITER':
            navigate('/waiter', { replace: true });
            break;
          case 'ADMIN':
          case 'SUPER_ADMIN':
            navigate('/dashboard', { replace: true });
            break;
          default:
            // Default to dashboard for unknown roles
            navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naples mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
