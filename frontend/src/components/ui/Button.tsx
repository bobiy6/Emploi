import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:from-blue-300 disabled:to-indigo-300',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] disabled:text-gray-400',
      danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98] disabled:from-rose-300 disabled:to-red-300',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 active:bg-gray-200',
      outline: 'bg-transparent border-2 border-gray-100 hover:border-blue-600 hover:text-blue-600 active:bg-blue-50',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm font-bold rounded-xl',
      md: 'px-6 py-3 text-base font-bold rounded-2xl',
      lg: 'px-8 py-4 text-lg font-black rounded-3xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
