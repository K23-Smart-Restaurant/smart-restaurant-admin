import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  UtensilsIcon,
  LayoutGridIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  BellIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon,
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, roles: ['ADMIN', 'SUPER_ADMIN', 'WAITER', 'KITCHEN_STAFF'] },
    { name: 'Staff Management', path: '/staff', icon: UsersIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Categories', path: '/categories', icon: FolderIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Menu Items', path: '/menu', icon: UtensilsIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Tables', path: '/tables', icon: LayoutGridIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Orders', path: '/orders', icon: ShoppingCartIcon, roles: ['ADMIN', 'SUPER_ADMIN', 'WAITER', 'KITCHEN_STAFF'] },
    { name: 'Reports', path: '/reports', icon: BarChart3Icon, roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const visibleNavigation = navigation.filter(item => 
    !user || item.roles.includes(user.role)
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-antiflash">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-charcoal text-white border-r border-arylide transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-arylide">
            <h1 className="text-2xl font-bold text-naples">Smart Restaurant</h1>
            <p className="text-sm text-antiflash mt-1">Admin Dashboard</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-naples text-charcoal font-semibold shadow-[0_3px_14px_3px_#ffd95452]'
                          : 'text-white hover:bg-arylide/20 hover:text-naples'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-antiflash shadow-sm z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-charcoal hover:bg-antiflash rounded-md transition-colors"
            >
              {isSidebarOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

            {/* Restaurant name (visible on mobile) */}
            <div className="lg:hidden">
              <h2 className="text-lg font-bold text-charcoal">Smart Restaurant</h2>
            </div>

            {/* Right side: Notifications & Profile */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 text-charcoal hover:bg-antiflash rounded-full transition-colors">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>

              {/* User profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-antiflash rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-naples flex items-center justify-center">
                    <span className="text-charcoal font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-charcoal">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.role || 'ADMIN'}
                    </p>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-600 hidden md:block" />
                </button>

                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-antiflash py-2 z-20">
                      <div className="px-4 py-2 border-b border-antiflash">
                        <p className="text-sm font-medium text-charcoal">
                          {user?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-600">{user?.email || ''}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-content mx-auto p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
