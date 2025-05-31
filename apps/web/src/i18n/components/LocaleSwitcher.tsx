'use client';

import { CheckIcon, GlobeIcon } from '@radix-ui/react-icons'; // Or your preferred icon library e.g. lucide-react
import type { SupportedLocales } from '@repo/i18n/config/client';
import { Button } from '@repo/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import { cn } from '@repo/ui/lib/utils'; // Utility for conditional class names
import * as React from 'react';
export interface LocaleOption {
  label: string;
  value: string; // e.g., 'en-US', 'ar'
  dir?: 'ltr' | 'rtl';
  // icon?: React.ComponentType<{ className?: string }>; // Optional: for flags
}

interface LocaleSwitcherProps {
  currentLocale: string;
  localeOptions: readonly LocaleOption[];
  onLocaleChange: (localeValue: SupportedLocales) => void;
  align?: DropdownMenuContentProps['align']; // Pass through DropdownMenuContent alignment
  disabled?: boolean;
  triggerClassName?: string; // ClassName for the trigger button
  contentClassName?: string; // ClassName for the dropdown content
}

export function LocaleSwitcher({
  currentLocale,
  localeOptions,
  onLocaleChange,
  align = 'end',
  disabled = false,
  triggerClassName,
  contentClassName,
}: LocaleSwitcherProps) {
  const currentOption = React.useMemo(
    () => localeOptions.find((opt) => opt.value === currentLocale),
    [currentLocale, localeOptions]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-x-1.5 px-3', // Adjusted padding and gap
            triggerClassName
          )}
        >
          <GlobeIcon className="h-[1.1rem] w-[1.1rem]" />
          <span className="sr-only sm:not-sr-only">
            {' '}
            {/* Show text on sm screens and up */}
            {currentOption ? currentOption.label : currentLocale.toUpperCase()}
          </span>
          <span className="not-sr-only sm:sr-only">
            {' '}
            {/* Show short code on xs screens */}
            {currentOption
              ? currentOption?.value?.split?.('-')?.[0]?.toUpperCase()
              : currentLocale.split('-')?.[0]?.toUpperCase()}
          </span>
          {/* Optional: Add a chevron if desired, though often implicit with DropdownMenu */}
          {/* <ChevronDownIcon className="ml-1 h-4 w-4 opacity-70" /> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn(contentClassName)}>
        {localeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onLocaleChange(option.value as SupportedLocales)}
            // Optional: Add a visual cue for text direction if mixed
            // dir={option.dir || 'ltr'}
            className={cn(
              'flex cursor-pointer items-center justify-between gap-x-2',
              option.value === currentLocale
                ? 'bg-accent text-accent-foreground' // Highlight active
                : 'hover:bg-accent/50' // Standard hover
            )}
          >
            <span>{option.label}</span>
            {option.value === currentLocale && (
              <CheckIcon className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export DropdownMenuContentProps if needed for 'align' prop type, or use built-in Radix type
type DropdownMenuContentProps = React.ComponentProps<
  typeof DropdownMenuContent
>;
