import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['ADMIN', 'SUPER_ADMIN', 'WAITER', 'KITCHEN_STAFF'] },
    { name: 'Staff', path: '/staff', icon: '👥', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Categories', path: '/categories', icon: '📁', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Menu', path: '/menu', icon: '🍽️', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Tables', path: '/tables', icon: '🪑', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Orders', path: '/orders', icon: '📋', roles: ['ADMIN', 'SUPER_ADMIN', 'WAITER', 'KITCHEN_STAFF'] },
    { name: 'Reports', path: '/reports', icon: '📈', roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const visibleNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg min-h-sidebar">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">Smart Restaurant</h1>
          <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {visibleNavigation.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-content mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
