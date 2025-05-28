'use client';

import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { BRANDING_NAME } from '@repo/core/const/branding';
import * as AuthIcons from '@repo/ui/components/AuthIcons';

import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton';

// Enhanced loading state with better visual hierarchy
const AuthButtonListLoading = memo(() => {
  return (
    <div className="space-y-3">
      {[...new Array(3)].map((_, i) => (
        <div key={i} className='flex animate-pulse items-center space-x-3'>
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className='mb-2 h-4 w-3/4' />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
});

// Enhanced provider button with better visual design
const ProviderButton = memo(
  ({
    provider,
    onSignIn,
    isLoading,
  }: {
    provider: string;
    onSignIn: (provider: string) => void;
    isLoading: boolean;
  }) => {
    const { t } = useTranslation('clerk');
    const ProviderIcon = AuthIcons.getAuthIcon(provider);

    const providerConfigs = {
      google: {
        color: 'hover:bg-accent hover:text-accent-foreground border-input',
        bgColor: 'bg-card',
        textColor: 'text-card-foreground',
      },
      github: {
        color: 'hover:bg-accent hover:text-accent-foreground border-input',
        bgColor: 'bg-card',
        textColor: 'text-card-foreground',
      },
      microsoft: {
        color: 'hover:bg-accent hover:text-accent-foreground border-input',
        bgColor: 'bg-card',
        textColor: 'text-card-foreground',
      },
      apple: {
        color: 'hover:bg-accent hover:text-accent-foreground border-input',
        bgColor: 'bg-card',
        textColor: 'text-card-foreground',
      },
      default: {
        color: 'hover:bg-accent hover:text-accent-foreground border-input',
        bgColor: 'bg-card',
        textColor: 'text-card-foreground',
      },
    };

    const config =
      providerConfigs[provider as keyof typeof providerConfigs] ||
      providerConfigs.default;

    return (
      <Button
        variant="outline"
        className={`h-14 w-full justify-start text-left transition-all duration-200 ${config.bgColor} ${config.textColor} ${config.color} ${isLoading
          ? 'cursor-not-allowed opacity-50'
          : 'hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2'
          }`}
        onClick={() => !isLoading && onSignIn(provider)}
        disabled={isLoading}
        type="button"
      >
        <div className='flex w-full items-center'>
          {ProviderIcon && (
            <div className='mr-4 flex-shrink-0'>
              <ProviderIcon className="h-6 w-6" />
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <div className="font-medium capitalize">
              {t(`signIn.providers.${provider}`, `Continue with ${provider}`)}
            </div>
            <div className='mt-0.5 text-muted-foreground text-xs'>
              {provider === 'google' && 'Fast & secure authentication'}
              {provider === 'github' && 'For developers and teams'}
              {provider === 'microsoft' && 'Enterprise & Office 365'}
              {provider === 'apple' && 'Privacy-focused sign in'}
              {!['google', 'github', 'microsoft', 'apple'].includes(provider) &&
                'Secure authentication'}
            </div>
          </div>
          {isLoading && (
            <div className='ml-2 flex-shrink-0'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
            </div>
          )}
        </div>
      </Button>
    );
  }
);

// Main sign-in form with enhanced UX
export const SignInForm = memo(() => {
  const { t } = useTranslation('clerk');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const oAuthSSOProviders = useUserStore((s) => s.oAuthSSOProviders);
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  useEffect(() => {
    setMounted(true);
    // Check for error in URL params
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(
        t(`signIn.errors.${urlError}`, 'An error occurred during sign in')
      );
    }
  }, [searchParams, t]);

  const handleSignIn = async (provider: string) => {
    if (loadingProvider) return;

    setLoadingProvider(provider);
    setError(null);

    try {
      await signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: true,
      });
    } catch (error) {
      setLoadingProvider(null);

      if (error instanceof AuthError) {
        setError(
          t(
            `signIn.errors.${error.type}`,
            'Authentication failed. Please try again.'
          )
        );
        return;
      }

      console.error('Sign-in error:', error);
      setError(
        t('signIn.errors.generic', 'Something went wrong. Please try again.')
      );
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className='pb-8 text-center'>
            <Skeleton className='mx-auto mb-2 h-8 w-3/4' />
            <Skeleton className='mx-auto h-4 w-1/2' />
          </CardHeader>
          <CardContent>
            <AuthButtonListLoading />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header with branding */}
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
            <div className='h-8 w-8 rounded-lg bg-primary' />
          </div>
          <h1 className='mb-2 font-bold text-3xl text-foreground tracking-tight'>
            Welcome to {BRANDING_NAME}
          </h1>
          <p className="text-muted-foreground">
            Choose your preferred way to continue
          </p>
        </div>

        <Card className="border border-border bg-card shadow-lg">
          <CardHeader className='pb-6 text-center'>
            <CardTitle className='font-semibold text-card-foreground text-xl'>
              {t('signIn.start.title', 'Sign in to your account', {
                applicationName: BRANDING_NAME
              })}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t(
                'signIn.start.subtitle',
                'Access your dashboard and manage your account'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {oAuthSSOProviders && oAuthSSOProviders.length > 0 ? (
              <div className="space-y-3">
                {oAuthSSOProviders.map((provider) => (
                  <ProviderButton
                    key={provider}
                    provider={provider}
                    onSignIn={handleSignIn}
                    isLoading={loadingProvider === provider}
                  />
                ))}
              </div>
            ) : oAuthSSOProviders === null ||
              oAuthSSOProviders === undefined ? (
              <AuthButtonListLoading />
            ) : (
              <div className='py-8 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                  <div className='h-8 w-8 rounded-full border-2 border-muted-foreground/30' />
                </div>
                <p className="text-muted-foreground">
                  {t(
                    'signIn.noProvidersConfigured',
                    'No sign-in methods are currently available.'
                  )}
                </p>
                <p className='mt-2 text-muted-foreground text-xs'>
                  Please contact your administrator for assistance.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className='flex flex-col items-center justify-center space-y-4 pt-6'>
            {/* Security badge */}
            <div className="flex items-center justify-center space-x-2">
              <Badge
                variant="secondary"
                className='bg-secondary text-secondary-foreground text-xs'
              >
                🔒 Secure
              </Badge>
              <Badge
                variant="secondary"
                className='bg-secondary text-secondary-foreground text-xs'
              >
                ⚡ Fast
              </Badge>
              <Badge
                variant="secondary"
                className='bg-secondary text-secondary-foreground text-xs'
              >
                🛡️ Private
              </Badge>
            </div>

            {/* Terms and privacy */}
            <div className='text-center text-muted-foreground text-xs'>
              By continuing, you agree to our{' '}
              <a
                href="/terms"
                className='underline transition-colors hover:text-foreground'
              >
                Terms
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className='underline transition-colors hover:text-foreground'
              >
                Privacy Policy
              </a>
            </div>
          </CardFooter>
        </Card>

        {/* Additional help */}
        <div className='mt-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            Need help?{' '}
            <a
              href="/support"
              className='underline transition-colors hover:text-foreground'
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
});

SignInForm.displayName = 'SignInForm';

export default SignInForm;
