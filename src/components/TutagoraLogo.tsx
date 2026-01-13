import React from 'react';
import { cn } from '@/lib/utils';
import tutagoraLogo from '@/assets/tutagora-logo.png';

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
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className={cn('flex items-center', className)}>
      <img 
        src={tutagoraLogo} 
        alt="Tutagora" 
        className={cn(sizeClasses[size], 'object-contain')}
      />
    </div>
  );
};

export default TutagoraLogo;
