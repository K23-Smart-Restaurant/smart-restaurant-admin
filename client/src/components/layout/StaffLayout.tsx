import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  LogOutIcon,
  WifiIcon,
  WifiOffIcon,
  ClockIcon,
  ChevronDownIcon,
  UserIcon,
} from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';

/**
 * T422: StaffLayout Component
 * Minimal layout for Kitchen Display System and Waiter Dashboard
 * Features: Clock, WiFi status, Logout button, Maximum screen space
 */
const StaffLayout: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Get current locale for date/time formatting
  const currentLocale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(currentLocale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: currentLocale === 'en-US',
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(currentLocale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Minimal Header - Using DashboardLayout styling */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-elevation-1 z-20">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2.5 sm:py-4 gap-2 sm:gap-3">
          {/* Left: App Title & User Role */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink">
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent truncate">
                {t('header.appName')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block">
                {user?.role === 'KITCHEN_STAFF'
                  ? t('header.kitchenDisplay')
                  : t('header.waiterDashboard')}
              </p>
            </div>
          </div>

          {/* Center: Clock */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-naples/10 to-arylide/10 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border border-naples/20 shadow-sm flex-shrink-0">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-naples" />
            <div className="text-center">
              <div className="text-sm sm:text-lg lg:text-xl font-bold text-charcoal tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-600 hidden sm:block">{formatDate(currentTime)}</div>
            </div>
          </div>

          {/* Right: Language Switcher, WiFi Status & Profile Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* WiFi/Socket Status */}
            <div
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                isConnected
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
              }`}
              title={isConnected ? t('header.connected') : t('header.disconnected')}
            >
              {isConnected ? (
                <WifiIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <WifiOffIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="text-xs font-semibold hidden md:inline">
                {isConnected ? t('header.online') : t('header.offline')}
              </span>
            </div>

            {/* User profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gradient-to-r hover:from-gradient-primary/10 hover:to-gradient-secondary/10 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-naples to-arylide flex items-center justify-center shadow-md group-hover:shadow-glow-yellow transition-shadow duration-300 overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'Staff'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-charcoal font-bold text-sm sm:text-base">
                      {user?.name?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-charcoal">{user?.name || 'Staff'}</p>
                  <p className="text-xs text-gray-600">
                    {user?.role?.replace('_', ' ') || 'Staff'}
                  </p>
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-600 hidden md:block transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                />
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
                      <p className="text-sm font-semibold text-charcoal">{user?.name || 'Staff'}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{user?.email || ''}</p>
                    </div>
                    <Link
                      to={user?.role === 'KITCHEN_STAFF' ? '/kitchen/profile' : '/waiter/profile'}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-gradient-to-r hover:from-gradient-primary/10 hover:to-gradient-secondary/10 transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{t('navigation.profile')}</span>
                      <span className="ml-auto transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      <span>{t('navigation.logout')}</span>
                      <span className="ml-auto transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Premium background matching DashboardLayout */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
        <div className="max-w-content mx-auto p-4 lg:p-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
