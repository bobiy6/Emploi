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
            'flex h-12 w-full rounded-2xl border border-gray-100 bg-white px-4 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 transition-all duration-300 shadow-sm shadow-gray-100/50',
            error ? 'border-red-500 focus:ring-red-500/10' : 'hover:border-gray-200 hover:shadow-md',
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
