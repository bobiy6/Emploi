import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              'w-full h-11 px-4 appearance-none rounded-lg border bg-white text-sm font-medium transition-all duration-200 outline-none pr-10',
              'border-gray-200 text-gray-900 focus:border-[#0050d7] focus:ring-4 focus:ring-[#0050d7]/5',
              error && 'border-red-500 focus:ring-red-500/10',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="py-2">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#0050d7] transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
