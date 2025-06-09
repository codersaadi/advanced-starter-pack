'use client';
import { cn } from '@repo/ui/lib/utils';
import {
  AlertCircle,
  ArrowLeft,
  Compass,
  Home,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../ui/button';

// Class variants for different 404 page styles
const pageVariants = {
  variant: {
    minimal: 'min-h-screen bg-background text-foreground',
    gradient:
      'min-h-screen bg-gradient-to-br from-background via-muted to-background text-foreground',
    centered: 'min-h-screen bg-background text-foreground',
    illustration:
      'min-h-screen bg-gradient-to-b from-background to-muted text-foreground',
  },
  size: {
    compact: 'py-12 px-4',
    default: 'py-16 px-6',
    spacious: 'py-24 px-8',
  },
};

const containerVariants = {
  variant: {
    minimal: 'max-w-md mx-auto text-center',
    gradient: 'max-w-2xl mx-auto text-center',
    centered: 'max-w-lg mx-auto text-center',
    illustration: 'max-w-4xl mx-auto text-center',
  },
};

const errorCodeVariants = {
  variant: {
    minimal: 'text-6xl font-bold text-muted-foreground mb-4',
    gradient:
      'text-8xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent mb-6',
    centered: 'text-7xl font-bold text-primary mb-4',
    illustration: 'text-9xl font-bold text-muted-foreground/20 mb-8',
  },
};

const titleVariants = {
  variant: {
    minimal: 'text-2xl font-semibold text-foreground mb-2',
    gradient: 'text-3xl font-bold text-foreground mb-4',
    centered: 'text-3xl font-semibold text-foreground mb-3',
    illustration: 'text-4xl font-bold text-foreground mb-4',
  },
};

const descriptionVariants = {
  variant: {
    minimal: 'text-muted-foreground mb-8 text-sm',
    gradient: 'text-muted-foreground mb-12 text-lg leading-relaxed',
    centered: 'text-muted-foreground mb-10 text-base',
    illustration: 'text-muted-foreground mb-12 text-lg max-w-2xl mx-auto',
  },
};

const buttonVariants = {
  variant: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline:
      'border border-border bg-background hover:bg-accent text-foreground',
  },
  size: {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  },
};

// Utility function to combine classes

// Floating animation component
const FloatingElement = ({
  delay = 0,
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
    >
      {children}
    </div>
  );
};

// Main 404 Component
const NotFoundPage = () => {
  const [currentVariant, setCurrentVariant] =
    useState<keyof typeof descriptionVariants.variant>('gradient');
  const [currentSize, setCurrentSize] =
    useState<keyof typeof pageVariants.size>('default');

  const variants = ['minimal', 'gradient', 'centered', 'illustration'] as const;
  const sizes = ['compact', 'default', 'spacious'] as const;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Variant Selector */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {variants.map((variant) => (
              <button
                type="button"
                key={variant}
                onClick={() => setCurrentVariant(variant)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs capitalize transition-colors',
                  currentVariant === variant
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {variant}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setCurrentSize(size)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs capitalize transition-colors',
                  currentSize === size
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background Elements */}
      {currentVariant === 'illustration' && (
        <div className="pointer-events-none absolute inset-0">
          <FloatingElement
            delay={0}
            className="absolute top-20 left-10 text-muted-foreground/10"
          >
            <Compass size={80} />
          </FloatingElement>
          <FloatingElement
            delay={1}
            className="absolute top-40 right-20 text-muted-foreground/10"
          >
            <Search size={60} />
          </FloatingElement>
          <FloatingElement
            delay={2}
            className="absolute bottom-32 left-20 text-muted-foreground/10"
          >
            <AlertCircle size={70} />
          </FloatingElement>
          <FloatingElement
            delay={1.5}
            className="absolute right-10 bottom-20 text-muted-foreground/10"
          >
            <Home size={50} />
          </FloatingElement>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          pageVariants.variant[
            currentVariant as keyof typeof pageVariants.variant
          ],
          pageVariants.size[currentSize],
          'flex items-center justify-center'
        )}
      >
        <div className={containerVariants.variant[currentVariant]}>
          {/* Error Code */}
          <div className={errorCodeVariants.variant[currentVariant]}>404</div>

          {/* Title */}
          <h1 className={titleVariants.variant[currentVariant]}>
            {currentVariant === 'minimal' && 'Page Not Found'}
            {currentVariant === 'gradient' && "Oops! You've Lost Your Way"}
            {currentVariant === 'centered' && 'Page Not Found'}
            {currentVariant === 'illustration' && 'Lost in Cyberspace'}
          </h1>

          {/* Description */}
          <p className={descriptionVariants.variant[currentVariant]}>
            {currentVariant === 'minimal' &&
              "The page you're looking for doesn't exist."}
            {currentVariant === 'gradient' &&
              "The page you're searching for seems to have vanished into thin air. Don't worry, even the best explorers sometimes take a wrong turn."}
            {currentVariant === 'centered' &&
              "The page you're looking for might have been moved, deleted, or you entered the wrong URL."}
            {currentVariant === 'illustration' &&
              "It looks like you've stumbled into uncharted territory. The page you're seeking has drifted beyond our digital horizon."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={'/'}>
              <Button
                variant={'default'}
                size={
                  currentSize === 'compact'
                    ? 'sm'
                    : currentSize === 'spacious'
                      ? 'lg'
                      : 'default'
                }
              >
                <Home size={20} />
                Go Home
              </Button>
            </Link>

            <Button
              variant="outline"
              size={
                currentSize === 'compact'
                  ? 'sm'
                  : currentSize === 'spacious'
                    ? 'lg'
                    : 'default'
              }
              onClick={handleGoBack}
            >
              <ArrowLeft size={20} />
              Go Back
            </Button>

            {currentVariant !== 'minimal' && (
              <Button
                variant="secondary"
                size={
                  currentSize === 'compact'
                    ? 'sm'
                    : currentSize === 'spacious'
                      ? 'lg'
                      : 'default'
                }
                onClick={handleRefresh}
              >
                <RefreshCw size={20} />
                Refresh
              </Button>
            )}
          </div>

          {/* Additional Help Text */}
          {(currentVariant === 'gradient' ||
            currentVariant === 'illustration') && (
            <div className="mt-12 border-border border-t pt-8">
              <p className="mb-4 text-muted-foreground text-sm">
                Need help? Here are some suggestions:
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <button
                  type="button"
                  className="text-primary transition-colors hover:text-primary/80"
                >
                  Check the URL
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  className="text-primary transition-colors hover:text-primary/80"
                >
                  Search our site
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  className="text-primary transition-colors hover:text-primary/80"
                >
                  Contact support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="-translate-x-1/2 absolute bottom-4 left-1/2 transform">
        <p className="text-muted-foreground text-xs">
          Error Code: 404 • Page Not Found
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
