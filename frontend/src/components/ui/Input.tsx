import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label ? (
          <label className="block text-sm font-medium text-gray-700 ml-1">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50 transition-all duration-200',
            error ? 'border-red-500 focus:ring-red-500' : 'hover:border-gray-300',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-500 ml-1">{error}</p>
        ) : null}
      </div>
    );
  }
);
