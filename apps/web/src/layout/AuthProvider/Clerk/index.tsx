'use client';

import {
  featureFlagsSelectors,
  useServerConfigStore,
} from '@/store/serverConfig';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Theme } from '@clerk/types';
import { authEnv } from '@repo/env/auth';
import { useTheme } from 'next-themes';
import type { NextClerkProviderProps } from 'node_modules/@clerk/nextjs/dist/types/types';
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import UserUpdater from './UserUpdater';

interface ClerkProviderWrapperProps extends PropsWithChildren {
  /**
   * Override the default sign-up URL behavior
   */
  customSignUpUrl?: string;
  /**
   * Additional theme customizations
   */
  themeOverrides?: Partial<Theme>;
  /**
   * Disable UserUpdater component if needed
   */
  disableUserUpdater?: boolean;
}

export function ClerkProviderWrapper({
  children,
  customSignUpUrl,
  themeOverrides,
  disableUserUpdater = false,
}: ClerkProviderWrapperProps) {
  const { resolvedTheme } = useTheme();
  const {
    i18n: { language, getResourceBundle, exists },
  } = useTranslation(['clerk']);
  const { enableClerkSignUp } = useServerConfigStore(featureFlagsSelectors);

  const clerkPublishableKey = authEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Memoize localization to prevent unnecessary re-renders
  const clerkLocalization = useMemo(() => {
    if (exists('formButtonPrimary', { ns: 'clerk', lng: language })) {
      return getResourceBundle(language, 'clerk');
    }
    return undefined;
  }, [language, getResourceBundle, exists]);

  // Enhanced variables with proper color values based on your theme
  const variables: Theme['variables'] = useMemo(() => {
    const isDark = resolvedTheme === 'dark';

    return {
      // Typography
      fontFamily: 'var(--font-sans)',
      fontFamilyButtons: 'var(--font-sans)',
      fontWeight: {
        bold: '600',
        normal: '400',
        medium: '500',
      },
      fontSize: '1rem',

      // Colors - using actual values that match your CSS variables
      colorPrimary: isDark ? '#fafafa' : '#1a1a1a', // primary
      colorDanger: isDark ? '#dc2626' : '#ef4444', // destructive
      colorSuccess: '#10b981', // emerald-500
      colorWarning: '#f59e0b', // amber-500
      colorNeutral: isDark ? '#404040' : '#f5f5f5', // muted
      colorText: isDark ? '#fafafa' : '#1a1a1a', // foreground
      colorTextSecondary: isDark ? '#a1a1aa' : '#71717a', // muted-foreground
      colorBackground: isDark ? '#1a1a1a' : '#ffffff', // background
      colorInputBackground: isDark ? '#404040' : '#f5f5f5', // input
      colorInputText: isDark ? '#fafafa' : '#1a1a1a', // foreground

      // Borders and radius
      borderRadius: '0.625rem', // matches your --radius
      spacingUnit: '1rem',
    };
  }, [resolvedTheme]);

  // Enhanced elements styling
  const elements: Theme['elements'] = useMemo(
    () => ({
      // Layout components
      card: 'bg-card text-card-foreground border-border shadow-sm',
      headerTitle: 'text-foreground font-semibold',
      headerSubtitle: 'text-muted-foreground',

      // Form elements
      formButtonPrimary:
        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 font-medium shadow-sm',
      formButtonSecondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border transition-colors duration-200',

      // Input styling
      formFieldInput:
        'bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-ring transition-colors duration-200',
      formFieldLabel: 'text-foreground font-medium text-sm',
      formFieldHintText: 'text-muted-foreground text-sm',
      formFieldErrorText: 'text-destructive text-sm font-medium',

      // Navigation and organizational elements
      navbar: 'bg-background border-b border-border',
      navbarButton:
        'text-foreground hover:text-foreground/80 hover:bg-accent transition-colors duration-200',
      organizationSwitcherTrigger:
        'hover:bg-accent transition-colors duration-200',
      organizationSwitcherTrigger__open: 'bg-accent',
      organizationPreviewMainIdentifier: 'text-foreground font-medium',
      organizationSwitcherTriggerIcon: 'text-muted-foreground',
      organizationPreview__organizationSwitcherTrigger: 'gap-2 p-2',
      organizationPreviewAvatarContainer: 'shrink-0',

      // Social auth buttons
      socialButtonsIconButton:
        'bg-card border-border hover:bg-accent transition-colors duration-200',
      socialButtonsBlockButton:
        'bg-card border-border hover:bg-accent text-foreground transition-colors duration-200',
      socialButtonsBlockButtonText: 'text-foreground font-medium',

      // Dividers and separators
      dividerLine: 'bg-border',
      dividerText: 'text-muted-foreground text-sm',

      // Footer and actions
      footerAction: enableClerkSignUp
        ? 'text-muted-foreground'
        : { display: 'none' },
      footerActionLink:
        'text-primary hover:text-primary/80 font-medium transition-colors duration-200',

      // Modal and overlay styling
      modalContent: 'bg-background border-border shadow-lg',
      modalCloseButton:
        'text-muted-foreground hover:text-foreground transition-colors duration-200',

      // Alert and notification styling
      alert: 'bg-card border-border text-card-foreground',
      alertText: 'text-foreground',

      // Avatar styling
      avatarBox: 'border-border shadow-sm',

      // Badge styling
      badge: 'bg-secondary text-secondary-foreground border-border',
    }),
    [enableClerkSignUp]
  );

  // Create appearance configuration
  const appearance: NextClerkProviderProps['appearance'] = useMemo(() => {
    const isDark = resolvedTheme === 'dark';

    return {
      baseTheme: isDark ? dark : undefined,
      variables: {
        ...variables,
        ...themeOverrides?.variables,
      },
      elements: {
        ...elements,
        ...themeOverrides?.elements,
      },
      layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'blockButton',
        ...themeOverrides?.layout,
      },
    };
  }, [resolvedTheme, variables, elements, themeOverrides]);

  // Error handling for missing publishable key
  const handleMissingKey = useCallback(() => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(
      'Clerk publishable key is not set. Please check your environment variables.'
    );
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        Authentication service is not configured properly. Please contact
        support.
      </div>
    );
  }, []);

  // Early return if no publishable key
  if (!clerkPublishableKey) {
    return (
      <div>
        {handleMissingKey()}
        {children}
      </div>
    );
  }

  // Determine sign-up URL with fallback logic
  const signUpUrl =
    customSignUpUrl || (enableClerkSignUp ? '/sign-up' : '/sign-in');

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      localization={clerkLocalization}
      appearance={appearance}
      signUpUrl={signUpUrl}
      signInUrl="/sign-in"
      // Enable organization features if needed
      // organizationProfileMode="navigation"
    >
      {children}
      {!disableUserUpdater && <UserUpdater />}
    </ClerkProvider>
  );
}
