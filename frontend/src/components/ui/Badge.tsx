import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  const variants = {
    primary: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
    secondary: 'bg-gray-500/10 text-gray-600 border-gray-200/50',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
    danger: 'bg-rose-500/10 text-rose-600 border-rose-200/50',
    ghost: 'bg-transparent text-gray-400 border-gray-100',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-300',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
