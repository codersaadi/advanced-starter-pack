'use client';

import {
  featureFlagsSelectors,
  useServerConfigStore,
} from '@/store/serverConfig';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes'; // Clerk's dark theme base
import { authEnv } from '@repo/env/auth';
import { useTheme } from 'next-themes';
import type { NextClerkProviderProps } from 'node_modules/@clerk/nextjs/dist/types/types';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import UserUpdater from './UserUpdater';

export function ClerkProviderWrapper({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  const {
    i18n: { language, getResourceBundle, exists },
  } = useTranslation(['clerk', 'common']);
  const { enableClerkSignUp } = useServerConfigStore(featureFlagsSelectors);

  const clerkPublishableKey = authEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkLocalization = useMemo(() => {
    if (exists('formButtonPrimary', { ns: 'clerk', lng: language })) {
      return getResourceBundle(language, 'clerk');
    }
    return undefined;
  }, [language, getResourceBundle, exists]);

  const appearance: NextClerkProviderProps['appearance'] = useMemo(() => {
    const isDark = resolvedTheme === 'dark';

    // Shadcn/UI uses CSS variables for theming. Clerk can pick these up if its
    // components are built to respect them, or you can map them.
    // We primarily use `baseTheme` to tell Clerk about the dark/light mode.
    // Specific element styling is best done via global CSS targeting Clerk's classes
    // or by ensuring your Shadcn components (if used within Clerk's custom flows)
    // are styled correctly.

    return {
      baseTheme: isDark ? dark : undefined, // Use Clerk's dark theme as a base for dark mode
      variables: {
        // Map your Tailwind/Shadcn CSS variables to Clerk's theme variables
        // See: https://clerk.com/docs/customization/theming#theme-variables
        colorPrimary: `hsl(${isDark ? 'var(--primary-foreground-oklch)' : 'var(--primary-oklch)'})`, // Example
        colorBackground: 'hsl(var(--background-oklch))',
        colorText: 'hsl(var(--foreground-oklch))',
        colorInputBackground: 'hsl(var(--input-oklch))',
        colorInputBorder: 'hsl(var(--border-oklch))',
        borderRadius: 'var(--radius)', // e.g., '0.5rem'
      },
      elements: {
        ...(enableClerkSignUp ? {} : { footerAction: { display: 'none' } }),
      },
    };
  }, [resolvedTheme, enableClerkSignUp]);

  if (!clerkPublishableKey) {
    console.warn('Clerk publishable key is not set. Clerk will not function.');
    return <>{children}</>; // Or some fallback UI
  }
  const signUpUrl = enableClerkSignUp ? '/sign-up' : '/sign-in';

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      localization={clerkLocalization}
      appearance={appearance}
      signUpUrl={signUpUrl}
    >
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
}
