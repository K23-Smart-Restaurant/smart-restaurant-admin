import React from 'react';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'primary' | 'white';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
};

const variantClasses: Record<SpinnerVariant, string> = {
    default: 'text-naples',
    primary: 'text-charcoal',
    white: 'text-white',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'default',
    className = '',
}) => {
    return (
        <Loader2
            className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        />
    );
};

// -----------------------
// Page Loading Component
// -----------------------
interface PageLoadingProps {
    message?: string;
    size?: SpinnerSize;
    fullScreen?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
    message = 'Loading...',
    size = 'xl',
    fullScreen = false,
}) => {
    const containerClass = fullScreen
        ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
        : 'flex items-center justify-center h-64';

    return (
        <div className={containerClass}>
            <div className="text-center">
                <div className="relative inline-block">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-naples/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                    {/* Spinner */}
                    <div className="relative p-4 bg-white rounded-full shadow-elevation-2">
                        <LoadingSpinner size={size} />
                    </div>
                </div>
                {message && (
                    <p className="mt-4 text-gray-600 font-medium animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

// -----------------------
// Card Skeleton Component
// -----------------------
interface CardSkeletonProps {
    count?: number;
    className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
    count = 1,
    className = '',
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`bg-white rounded-lg shadow-md border border-antiflash p-6 animate-pulse ${className}`}
                >
                    {/* Image placeholder */}
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 shimmer" />
                    {/* Title */}
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 shimmer" />
                    {/* Description */}
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 shimmer" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 shimmer" />
                    {/* Bottom actions */}
                    <div className="flex justify-between mt-4">
                        <div className="h-8 bg-gray-200 rounded w-20 shimmer" />
                        <div className="h-8 bg-gray-200 rounded w-20 shimmer" />
                    </div>
                </div>
            ))}
        </>
    );
};

// -----------------------
// Table Skeleton Component
// -----------------------
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
    rows = 5,
    columns = 5,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-antiflash overflow-hidden animate-pulse">
            {/* Table header */}
            <div className="bg-charcoal px-6 py-4 flex gap-4">
                {Array.from({ length: columns }).map((_, index) => (
                    <div key={index} className="h-4 bg-gray-600 rounded flex-1 shimmer" />
                ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="px-6 py-4 flex gap-4 border-b border-antiflash last:border-b-0"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1 shimmer" />
                    ))}
                </div>
            ))}
        </div>
    );
};

// -----------------------
// Stats Card Skeleton
// -----------------------
interface StatsSkeletonProps {
    count?: number;
}

export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({
    count = 4,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2 shimmer" />
                            <div className="h-8 bg-gray-200 rounded w-16 shimmer" />
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-full shimmer" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// -----------------------
// Inline Loading (for buttons, small areas)
// -----------------------
interface InlineLoadingProps {
    text?: string;
    size?: SpinnerSize;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
    text = 'Loading',
    size = 'sm',
}) => {
    return (
        <span className="inline-flex items-center gap-2 text-gray-600">
            <LoadingSpinner size={size} />
            {text && <span>{text}</span>}
        </span>
    );
};
