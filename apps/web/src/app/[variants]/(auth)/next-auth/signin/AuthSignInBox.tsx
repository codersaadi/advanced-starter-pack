'use client';

import { AuthError } from 'next-auth'; // Keep for error handling
import { signIn } from 'next-auth/react'; // Keep for sign-in logic
import { useRouter, useSearchParams } from 'next/navigation'; // Keep for routing
import { memo } from 'react';
import { useTranslation } from 'react-i18next'; // Keep for localization

import { useUserStore } from '@/store/user'; // Keep your user store
import { BRANDING_NAME } from '@repo/core/const/branding'; // Keep for branding
import * as AuthIcons from '@repo/ui/components/AuthIcons'; // Keep your AuthIcons

// Import Shadcn/UI components from your @repo/ui
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton'; // For loading state

// Helper for loading state, using Shadcn Skeleton
const AuthButtonListLoading = memo(() => {
  return (
    <div className="space-y-2">
      {' '}
      {/* Replaces Flex gap vertical */}
      <Skeleton className="h-10 w-full" /> {/* Matches button height */}
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
});

// Placeholder for BrandWatermark - create this component if needed
// const BrandWatermark = () => <div className="text-xs text-muted-foreground">Powered by {BRANDING_NAME}</div>;

export const SignInForm = memo(() => {
  const { t } = useTranslation('clerk'); // Assuming 'clerk' namespace has signIn.start.title etc.
  // Or use a more generic 'auth' namespace.
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get available OAuth providers from your user store
  // Ensure this store is populated correctly (e.g., from server config)
  const oAuthSSOProviders = useUserStore((s) => s.oAuthSSOProviders);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'; // Default to a dashboard or home

  const handleSignIn = async (provider: string) => {
    try {
      // The `signIn` function from `next-auth/react` will handle the OAuth flow.
      // `redirectTo` is preferred over `callbackUrl` for `signIn` for clarity if it's just for post-sign-in.
      // If `callbackUrl` is for OAuth state, then it's correctly named.
      await signIn(provider, { callbackUrl: callbackUrl, redirect: true });
    } catch (error) {
      if (error instanceof AuthError) {
        // You might want to display an error message on the page instead of redirecting,
        // or use a toast notification.
        // For now, redirecting to an error page like next-auth examples:
        return router.push(`/error?error=${error.type}`); // Or a dedicated auth error page
      }
      // Rethrow other errors for Next.js to handle
      console.error('Sign-in error:', error);
      // Optionally, show a generic error message to the user here
      throw error;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {' '}
      {/* Centering container */}
      <Card className="w-full max-w-md">
        {' '}
        {/* Replaces styles.container */}
        <CardHeader className="text-center">
          {' '}
          {/* Replaces styles.contentCard header part */}
          {/* Optional: Add a Logo here */}
          {/* <img src="/logo.svg" alt={`${BRANDING_NAME} Logo`} className="mx-auto mb-4 h-12 w-auto" /> */}
          <CardTitle className="font-semibold text-2xl tracking-tight">
            {' '}
            {/* Replaces styles.title */}
            {t('signIn.start.title', { applicationName: BRANDING_NAME })}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {' '}
            {/* Replaces styles.description */}
            {t('signIn.start.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {' '}
          {/* Replaces styles.contentCard content part */}
          <div className="space-y-4">
            {' '}
            {/* Replaces Flex gap vertical */}
            {oAuthSSOProviders && oAuthSSOProviders.length > 0 ? (
              oAuthSSOProviders.map((provider) => {
                const ProviderIcon = AuthIcons.getAuthIcon(provider);
                return (
                  <Button
                    variant="outline" // Shadcn outline variant often used for social logins
                    className="w-full capitalize" // Replaces styles.button
                    key={provider}
                    onClick={() => handleSignIn(provider)}
                    type="button" // Explicitly set type for buttons not submitting a form
                  >
                    {ProviderIcon && <ProviderIcon className="mr-2 h-5 w-5" />}{' '}
                    {/* Adjust size as needed */}
                    {t(`signIn.providers.${provider}`, provider)}{' '}
                    {/* e.g., "Sign in with Google" */}
                  </Button>
                );
              })
            ) : oAuthSSOProviders === null ||
              oAuthSSOProviders === undefined ? ( // Check for null/undefined explicitly for loading state
              <AuthButtonListLoading />
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                {t(
                  'signIn.noProvidersConfigured',
                  'No sign-in methods are currently available.'
                )}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-6 text-xs">
          {' '}
          {/* Replaces styles.footer */}
          {/* Optional: Terms and Privacy links */}
          {/* <div className="text-center text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </div> */}
          {/* <BrandWatermark /> */}
        </CardFooter>
      </Card>
    </div>
  );
});

export default SignInForm;
