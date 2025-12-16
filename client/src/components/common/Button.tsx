import React from 'react';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center px-4 py-2 shadow-md rounded-md font-medium transition-all duration-150 focus:ring-2 focus:ring-naples focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-naples hover:brightness-105 text-charcoal disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white hover:bg-antiflash text-charcoal border border-antiflash disabled:opacity-50 disabled:cursor-not-allowed',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};
