'use client';

import { useUserStore } from '@/store/user'; // Ensure path
import { BRANDING_NAME } from '@repo/shared/const/branding'; // Ensure path
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Feature-specific components and constants
import { AuthLayout } from '@/components/nextauth/signin/auth-layout'; // Adjust path as needed
import {
  AuthMethodTabs,
  NoAuthMethodsMessage,
} from '@/components/nextauth/signin/auth-methods';
import {
  type AuthErrorKeyMapValue,
  CARD_CONTENT_CLASSNAME,
  DEFAULT_CALLBACK_URL,
  ERROR_KEY_MAP,
  isMagicLinkEnabled,
} from '@/components/nextauth/signin/constants';
import { ErrorAlert } from '@/components/nextauth/signin/error-alert';
import {
  AuthButtonListLoading,
  SignInPageSkeleton,
} from '@/components/nextauth/signin/loading-states';
import { MagicLinkSection } from '@/components/nextauth/signin/magic-link-section';
import { OAuthProvidersList } from '@/components/nextauth/signin/oauth-providers-list';

export const SignInForm = memo(() => {
  const { t } = useTranslation('signin');

  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('oauth');

  const oAuthSSOProviders = useUserStore((s) => s.oAuthSSOProviders);
  const callbackUrl = searchParams.get('callbackUrl') ?? DEFAULT_CALLBACK_URL;

  const hasOAuthProviders = oAuthSSOProviders && oAuthSSOProviders?.length > 0;
  const hasAtLeastOneMethod = hasOAuthProviders || isMagicLinkEnabled;
  const hasBothMethods = hasOAuthProviders && isMagicLinkEnabled;
  const isLoadingProviders =
    oAuthSSOProviders === null || oAuthSSOProviders === undefined;

  useEffect(() => {
    // Only run this effect once the component is mounted
    // This prevents hydration mismatch errors

    setMounted(true);
    const urlError = searchParams.get('error');

    if (urlError) {
      const translationKey =
        ERROR_KEY_MAP[urlError as keyof typeof ERROR_KEY_MAP] ||
        (ERROR_KEY_MAP.GenericError as string);
      const errorMessage = t(translationKey, {
        defaultValue: t(ERROR_KEY_MAP.GenericAuthError), // Default generic error message
        email: searchParams.get('email') || '', // Pass email if available for interpolation
      });
      const emailSuffix = searchParams.get('email')
        ? ` (${searchParams.get('email')})`
        : '';
      setError(`${errorMessage}${emailSuffix}`);
    }

    if (isMagicLinkEnabled && !hasOAuthProviders) {
      setActiveTab('magic');
    } else if (hasOAuthProviders) {
      setActiveTab('oauth');
    }
  }, [searchParams, t, hasOAuthProviders]);

  const handleSignIn = async (provider: string) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    setError(null);

    try {
      await signIn(provider, { callbackUrl, redirect: true });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      setLoadingProvider(null);
      let errorType: AuthErrorKeyMapValue = ERROR_KEY_MAP.GenericError; // Default to generic
      if (err instanceof AuthError) {
        errorType =
          err.type in ERROR_KEY_MAP
            ? ERROR_KEY_MAP[err.type as keyof typeof ERROR_KEY_MAP]
            : ERROR_KEY_MAP.GenericAuthError;
      }
      setError(t(errorType, { defaultValue: t(ERROR_KEY_MAP.GenericError) }));
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error('Sign-in error:', err);
    }
  };

  if (!mounted) {
    return <SignInPageSkeleton />;
  }

  const renderFormContent = () => {
    if (isLoadingProviders && !hasAtLeastOneMethod) {
      // Show loading only if we don't know providers yet AND no magic link
      return <AuthButtonListLoading />;
    }
    if (hasBothMethods) {
      return (
        <AuthMethodTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          oAuthProviders={oAuthSSOProviders}
          onSignIn={handleSignIn}
          loadingProvider={loadingProvider}
        />
      );
    }
    if (hasOAuthProviders) {
      return (
        <OAuthProvidersList
          providers={oAuthSSOProviders}
          onSignIn={handleSignIn}
          loadingProvider={loadingProvider}
        />
      );
    }
    if (isMagicLinkEnabled) {
      return <MagicLinkSection />; // MagicSignInForm handles its own error/loading states internally ideally
    }
    return <NoAuthMethodsMessage />;
  };

  return (
    <AuthLayout
      pageTitle={t('welcome.title', { name: BRANDING_NAME })}
      pageSubtitle={t('welcome.subtitle')}
      cardTitle={t('form.title')}
      cardSubtitle={t('form.subtitle')}
      showLogoAndWelcome // Defaults to true, can be explicit
      cardContentClassName={CARD_CONTENT_CLASSNAME} // Pass the specific class for card content
    >
      <ErrorAlert error={error} />
      {renderFormContent()}
    </AuthLayout>
  );
});

SignInForm.displayName = 'SignInForm';

export default SignInForm; // If this is the default export for the page/route
