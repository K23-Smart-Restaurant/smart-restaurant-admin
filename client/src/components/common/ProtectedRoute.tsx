import React from 'react';
// import { Navigate } from 'react-router-dom';  // Temporarily disabled with auth bypass
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allowedRoles: _allowedRoles
}) => {
  // const { isAuthenticated, isLoading, user } = useAuth();

  // TEMPORARY: Bypass authentication for development
  // TODO: Remove this to re-enable authentication
  return <>{children}</>;

  // Show loading state while checking authentication
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  //     </div>
  //   );
  // }

  // // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // // Check role-based access if allowedRoles is specified
  // if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
  //         <p className="text-xl text-gray-600">Forbidden: Insufficient permissions</p>
  //       </div>
  //     </div>
  //   );
  // }

  // return <>{children}</>;
};
