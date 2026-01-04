import React from 'react';
import { cn } from '@/lib/utils';

interface TutagoraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const TutagoraLogo: React.FC<TutagoraLogoProps> = ({ 
  className, 
  size = 'md',
  variant = 'full'
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icon/Symbol */}
      <div className={cn(
        'rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold',
        iconSizes[size]
      )}>
        <span className={size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm'}>
          T
        </span>
      </div>
      
      {/* Text */}
      {variant === 'full' && (
        <span className={cn(
          'font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          sizeClasses[size]
        )}>
          TUTAGORA
        </span>
      )}
    </div>
  );
};

export default TutagoraLogo;
