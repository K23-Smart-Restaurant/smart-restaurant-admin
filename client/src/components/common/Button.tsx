import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'gradient' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon: Icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-offset-2 transform active:scale-95 relative overflow-hidden group';

  const variantStyles = {
    primary: 'bg-naples hover:bg-arylide text-charcoal shadow-lg hover:shadow-glow-yellow focus:ring-naples disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105',
    secondary: 'bg-white hover:bg-gray-50 text-charcoal border-2 border-gray-200 hover:border-naples shadow-md hover:shadow-lg focus:ring-naples disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105',
    gradient: 'bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white shadow-lg hover:shadow-glow-lg focus:ring-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:from-gradient-secondary hover:to-gradient-primary',
    outline: 'bg-transparent border-2 border-gradient-primary text-gradient-primary hover:bg-gradient-primary hover:text-white shadow-md hover:shadow-glow focus:ring-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {loading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          Icon && <Icon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" />
        )}
        {children}
      </span>
      {variant === 'gradient' && (
        <span className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
};
