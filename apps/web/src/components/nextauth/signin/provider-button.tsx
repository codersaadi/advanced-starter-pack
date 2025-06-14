'use client';

import { useAppLocale } from '@/i18n/components/Locale';
import * as AuthIcons from '@repo/ui/components/AuthIcons'; // Ensure path
import { Button } from '@repo/ui/components/ui/button'; // Ensure path
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PROVIDER_CONFIGS, defaultProviderConfig } from './constants';
import type { ProviderButtonProps, ProviderConfig } from './types';

export const ProviderButton = memo<ProviderButtonProps>(
  ({ provider, onSignIn, isLoading }) => {
    const { t } = useTranslation('signin');
    const ProviderIcon = AuthIcons.getAuthIcon(provider);
    const { isRtl } = useAppLocale();
    const normalizedProviderKey = provider
      .toLowerCase()
      .replace(/([A-Z])/g, '-$1')
      .replace(/^-/, '');

    const baseConfig = PROVIDER_CONFIGS[normalizedProviderKey];

    let config: ProviderConfig;

    if (baseConfig) {
      config = {
        name: t(baseConfig.nameKey, { defaultValue: normalizedProviderKey }), // Provide a simple default
        description: t(baseConfig.descriptionKey, {
          defaultValue: `Sign in with ${normalizedProviderKey}`,
        }),
        colors: baseConfig.colors,
        gradient: baseConfig.gradient,
      };
    } else {
      // Fallback for providers not in PROVIDER_CONFIGS
      config = {
        name: t(defaultProviderConfig.name, {
          provider: provider,
          defaultValue: provider,
        }),
        description: t(defaultProviderConfig.description, {
          defaultValue: `Continue with ${provider}`,
        }),
        colors: defaultProviderConfig.colors,
        gradient: defaultProviderConfig.gradient,
      };
    }

    return (
      <Button
        variant="outline"
        className={`group relative h-20 w-full justify-start overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r ${config.gradient} bg-card/60 text-left backdrop-blur-sm transition-all duration-500 ease-out ${config.colors} ${
          isLoading
            ? 'cursor-not-allowed opacity-60'
            : 'hover:scale-[1.02] hover:shadow-black/5 hover:shadow-xl focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]'
        }`}
        onClick={() => !isLoading && onSignIn(provider)}
        disabled={isLoading}
        type="button"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 dark:via-white/5 ${
            isRtl
              ? 'translate-x-[100%] group-hover:translate-x-[-100%]'
              : 'translate-x-[-100%] group-hover:translate-x-[100%]'
          }`}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex w-full items-center">
          {ProviderIcon && (
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/80 to-white/40 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md dark:from-white/10 dark:to-white/5">
              <ProviderIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div
              className={`font-semibold text-base text-foreground transition-all duration-300 ${
                isRtl
                  ? 'group-hover:-translate-x-1'
                  : 'group-hover:translate-x-1'
              }`}
            >
              {config.name}
            </div>
            <div
              className={`mt-1 text-muted-foreground text-sm transition-all duration-300 group-hover:text-muted-foreground/80 ${
                isRtl
                  ? 'group-hover:-translate-x-1'
                  : 'group-hover:translate-x-1'
              }`}
            >
              {config.description}
            </div>
          </div>
          {isLoading ? (
            <div className="ml-4 flex-shrink-0">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
            </div>
          ) : (
            <div
              className={`ml-4 flex-shrink-0 opacity-0 transition-all duration-300 group-hover:opacity-100 ${
                isRtl
                  ? 'group-hover:-translate-x-1'
                  : 'group-hover:translate-x-1'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </Button>
    );
  }
);
ProviderButton.displayName = 'ProviderButton';
