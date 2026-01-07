import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { LogOutIcon, WifiIcon, WifiOffIcon, ClockIcon } from 'lucide-react';

/**
 * T422: StaffLayout Component
 * Minimal layout for Kitchen Display System and Waiter Dashboard
 * Features: Clock, WiFi status, Logout button, Maximum screen space
 */
const StaffLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { isConnected } = useSocket();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
            {/* Minimal Header - Fixed height */}
            <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 shadow-lg">
                <div className="flex items-center justify-between px-4 lg:px-6 py-3">
                    {/* Left: App Title & User Role */}
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                Smart Restaurant
                            </h1>
                            <p className="text-xs text-gray-400">
                                {user?.role === 'KITCHEN_STAFF' ? 'Kitchen Display' : 'Waiter Dashboard'}
                            </p>
                        </div>
                    </div>

                    {/* Center: Clock */}
                    <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-naples" />
                        <div className="text-center">
                            <div className="text-xl font-bold text-white tabular-nums">
                                {formatTime(currentTime)}
                            </div>
                            <div className="text-xs text-gray-400">
                                {formatDate(currentTime)}
                            </div>
                        </div>
                    </div>

                    {/* Right: WiFi Status & User & Logout */}
                    <div className="flex items-center space-x-3">
                        {/* WiFi/Socket Status */}
                        <div
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${isConnected
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-red-900/30 text-red-400 animate-pulse'
                                }`}
                            title={isConnected ? 'Connected' : 'Disconnected'}
                        >
                            {isConnected ? (
                                <WifiIcon className="w-5 h-5" />
                            ) : (
                                <WifiOffIcon className="w-5 h-5" />
                            )}
                            <span className="text-xs font-medium hidden md:inline">
                                {isConnected ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="hidden lg:flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-naples to-arylide flex items-center justify-center">
                                <span className="text-gray-900 font-bold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-white leading-tight">
                                    {user?.name || 'Staff'}
                                </p>
                                <p className="text-xs text-gray-400 leading-tight">
                                    {user?.role?.replace('_', ' ') || 'Staff'}
                                </p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                            title="Logout"
                        >
                            <LogOutIcon className="w-5 h-5" />
                            <span className="hidden md:inline font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Takes remaining height */}
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default StaffLayout;
