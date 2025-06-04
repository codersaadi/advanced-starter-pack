'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ButtonProps } from '../CopyButton';
import { Button } from '../ui/button';

interface GoBackButtonProps extends Omit<ButtonProps, 'onClick'> {
  fallbackUrl?: string;
  label?: string;
}

export const GoBackButton = ({
  fallbackUrl = '/',
  label = 'Go Back',
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: GoBackButtonProps) => {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`group relative overflow-hidden transition-all duration-300 ${className}`}
      onClick={handleGoBack}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <span className="flex items-center gap-2">
        <ArrowLeft
          className={`h-4 w-4 transition-transform duration-300 ${isHovering ? '-translate-x-1' : ''}`}
        />
        <span>{label}</span>
      </span>

      {/* Animated background on hover */}
      <span
        className={`-z-10 absolute inset-0 bg-primary/10 transition-transform duration-300 ${
          isHovering ? 'translate-x-0' : '-translate-x-full'
        }`}
      />
    </Button>
  );
};
