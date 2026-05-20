import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'glass';
  onClick?: () => void;
}

export const Card = ({ children, className, variant = 'white', onClick }: CardProps) => {
  const variants = {
    white: 'bg-white border border-gray-50 shadow-xl shadow-gray-200/50',
    glass: 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-500/10',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
      'rounded-[2rem] p-8 transition-all duration-500',
      variants[variant],
      onClick ? 'cursor-pointer hover:border-blue-200 hover:-translate-y-1 active:scale-[0.98]' : '',
      className
    )}>
      {children}
    </div>
  );
};
