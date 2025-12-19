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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white/80 backdrop-blur-xl text-charcoal border-r border-gray-200 shadow-elevation-2 transition-all duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-naples/10 via-transparent to-naples/10 animate-gradient-x"></div>
            <h1 className="text-2xl font-bold text-naples relative z-10 animate-fade-in">Smart Restaurant</h1>
            <p className="text-sm text-gray-600 mt-1 relative z-10">Admin Dashboard</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {visibleNavigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li 
                    key={item.path}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-naples to-arylide text-charcoal font-semibold shadow-glow-yellow-lg transform scale-105'
                          : 'text-charcoal hover:bg-gradient-to-r hover:from-naples/20 hover:to-arylide/20 hover:text-charcoal hover:scale-105'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 transition-all duration-300 ${isActive(item.path) ? 'animate-bounce-gentle' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
                      <span className="relative z-10">{item.name}</span>
                      {!isActive(item.path) && (
                        <span className="absolute inset-0 bg-gradient-to-r from-naples/0 via-naples/10 to-naples/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
                      )}
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
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-charcoal/80 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-elevation-1 z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2.5 text-charcoal hover:bg-gradient-to-r hover:from-gradient-primary/10 hover:to-gradient-secondary/10 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-90 group"
            >
              {isSidebarOpen ? (
                <XIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
              ) : (
                <MenuIcon className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>

            {/* Restaurant name (visible on mobile) */}
            <div className="lg:hidden">
              <h2 className="text-lg font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">Smart Restaurant</h2>
            </div>

            {/* Right side: Notifications & Profile */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2.5 text-charcoal hover:bg-gradient-to-r hover:from-gradient-primary/10 hover:to-gradient-secondary/10 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <BellIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse-glow"></span>
              </button>

              {/* User profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gradient-to-r hover:from-gradient-primary/10 hover:to-gradient-secondary/10 rounded-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-naples to-arylide flex items-center justify-center shadow-md group-hover:shadow-glow-yellow transition-shadow duration-300">
                    <span className="text-charcoal font-bold text-base">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-charcoal">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.role || 'ADMIN'}
                    </p>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-600 hidden md:block transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevation-3 border border-gray-100 py-2 z-20 animate-scale-in overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gradient-primary/5 to-gradient-secondary/5">
                        <p className="text-sm font-semibold text-charcoal">
                          {user?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">{user?.email || ''}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 flex items-center space-x-2 group"
                      >
                        <span>Logout</span>
                        <span className="ml-auto transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
          <div className="max-w-content mx-auto p-4 lg:p-8 animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
