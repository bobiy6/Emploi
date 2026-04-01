import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'glass';
}

export const Card = ({ children, className, variant = 'white' }: CardProps) => {
  const variants = {
    white: 'bg-white border border-gray-100 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-xl',
  };

  return (
    <div className={cn(
      'rounded-2xl p-6 transition-all duration-300',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
};
