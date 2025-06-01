'use client';

import MagicSignInForm from '@/components/nextauth/signin-magic';
import { useUserStore } from '@/store/user';
import { BRANDING_NAME } from '@repo/core/const/branding';
import * as AuthIcons from '@repo/ui/components/AuthIcons';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/ui/tabs';
import { LockIcon } from 'lucide-react';
import { MailIcon } from 'lucide-react';
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
export const isMagicLinkEnabled = authEnv.NEXT_PUBLIC_MAGIC_LINK;
import { requestMagicLink } from '@repo/core/libs/next-auth/custom-actions/magic';
import { authEnv } from '@repo/env/auth';
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
  // const { t } = useTranslation('signin'); // t is not used here

  return (
    <div className="space-y-4">
      {[...new Array(3)].map((_, i) => (
        <div
          key={i}
          // Match ProviderButton height (h-20) for consistency
          className="flex h-20 animate-pulse items-center space-x-4 rounded-xl border border-border/30 bg-card/50 p-5 backdrop-blur-sm"
        >
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
          {/* Skeleton for the arrow area, consistent with ProviderButton's interactive element */}
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
});
AuthButtonListLoading.displayName = 'AuthButtonListLoading';

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
    const { t } = useTranslation('signin');
    const ProviderIcon = AuthIcons.getAuthIcon(provider);

    // Map your actual SSO providers to configurations
    const providerConfigs = {
      auth0: {
        name: t('providers.auth0.name'),
        description: t('providers.auth0.description'),
        colors:
          'hover:bg-orange-50/80 hover:border-orange-200/50 hover:shadow-orange-100/50 dark:hover:bg-orange-950/20 dark:hover:border-orange-800/50',
        gradient: 'from-orange-500/10 to-orange-600/5',
      },
      authentik: {
        name: t('providers.authentik.name'),
        description: t('providers.authentik.description'),
        colors:
          'hover:bg-blue-50/80 hover:border-blue-200/50 hover:shadow-blue-100/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800/50',
        gradient: 'from-blue-500/10 to-blue-600/5',
      },
      'azure-ad': {
        name: t('providers.azureAd.name'),
        description: t('providers.azureAd.description'),
        colors:
          'hover:bg-blue-50/80 hover:border-blue-200/50 hover:shadow-blue-100/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800/50',
        gradient: 'from-blue-500/10 to-blue-600/5',
      },
      'generic-oidc': {
        name: t('providers.genericOidc.name'),
        description: t('providers.genericOidc.description'),
        colors:
          'hover:bg-slate-50/80 hover:border-slate-200/50 hover:shadow-slate-100/50 dark:hover:bg-slate-950/20 dark:hover:border-slate-800/50',
        gradient: 'from-slate-500/10 to-slate-600/5',
      },
      github: {
        name: t('providers.github.name'),
        description: t('providers.github.description'),
        colors:
          'hover:bg-gray-50/80 hover:border-gray-200/50 hover:shadow-gray-100/50 dark:hover:bg-gray-950/20 dark:hover:border-gray-800/50',
        gradient: 'from-gray-500/10 to-gray-600/5',
      },
      zitadel: {
        name: t('providers.zitadel.name'),
        description: t('providers.zitadel.description'),
        colors:
          'hover:bg-purple-50/80 hover:border-purple-200/50 hover:shadow-purple-100/50 dark:hover:bg-purple-950/20 dark:hover:border-purple-800/50',
        gradient: 'from-purple-500/10 to-purple-600/5',
      },
      authelia: {
        name: t('providers.authelia.name'),
        description: t('providers.authelia.description'),
        colors:
          'hover:bg-indigo-50/80 hover:border-indigo-200/50 hover:shadow-indigo-100/50 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-800/50',
        gradient: 'from-indigo-500/10 to-indigo-600/5',
      },
      logto: {
        name: t('providers.logto.name'),
        description: t('providers.logto.description'),
        colors:
          'hover:bg-violet-50/80 hover:border-violet-200/50 hover:shadow-violet-100/50 dark:hover:bg-violet-950/20 dark:hover:border-violet-800/50',
        gradient: 'from-violet-500/10 to-violet-600/5',
      },
      'cloudflare-zero-trust': {
        name: t('providers.cloudflareZeroTrust.name'),
        description: t('providers.cloudflareZeroTrust.description'),
        colors:
          'hover:bg-orange-50/80 hover:border-orange-200/50 hover:shadow-orange-100/50 dark:hover:bg-orange-950/20 dark:hover:border-orange-800/50',
        gradient: 'from-orange-500/10 to-orange-600/5',
      },
      casdoor: {
        name: t('providers.casdoor.name'),
        description: t('providers.casdoor.description'),
        colors:
          'hover:bg-emerald-50/80 hover:border-emerald-200/50 hover:shadow-emerald-100/50 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-800/50',
        gradient: 'from-emerald-500/10 to-emerald-600/5',
      },
      'microsoft-entra-id': {
        name: t('providers.microsoftEntraId.name'),
        description: t('providers.microsoftEntraId.description'),
        colors:
          'hover:bg-blue-50/80 hover:border-blue-200/50 hover:shadow-blue-100/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800/50',
        gradient: 'from-blue-500/10 to-blue-600/5',
      },
      wechat: {
        name: t('providers.wechat.name'),
        description: t('providers.wechat.description'),
        colors:
          'hover:bg-green-50/80 hover:border-green-200/50 hover:shadow-green-100/50 dark:hover:bg-green-950/20 dark:hover:border-green-800/50',
        gradient: 'from-green-500/10 to-green-600/5',
      },
      keycloak: {
        name: t('providers.keycloak.name'),
        description: t('providers.keycloak.description'),
        colors:
          'hover:bg-red-50/80 hover:border-red-200/50 hover:shadow-red-100/50 dark:hover:bg-red-950/20 dark:hover:border-red-800/50',
        gradient: 'from-red-500/10 to-red-600/5',
      },
      default: {
        name: t('providers.default.name', { provider }),
        description: t('providers.default.description'),
        colors:
          'hover:bg-accent/80 hover:border-accent-foreground/20 hover:shadow-accent/20',
        gradient: 'from-accent/10 to-accent/5',
      },
    };

    const normalizedProvider = provider
      .toLowerCase()
      .replace(/([A-Z])/g, '-$1')
      .replace(/^-/, '');
    const config =
      providerConfigs[normalizedProvider as keyof typeof providerConfigs] ||
      providerConfigs.default;

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
        {/* Animated background shimmer */}
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%] dark:via-white/5" />

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex w-full items-center">
          {ProviderIcon && (
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/80 to-white/40 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md dark:from-white/10 dark:to-white/5">
              <ProviderIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-base text-foreground transition-all duration-300 group-hover:translate-x-1">
              {config.name}
            </div>
            <div className="mt-1 text-muted-foreground text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground/80">
              {config.description}
            </div>
          </div>
          {isLoading ? (
            <div className="ml-4 flex-shrink-0">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
            </div>
          ) : (
            <div className="ml-4 flex-shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true" // Added for accessibility as it's decorative
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

// Main sign-in form with enhanced UX
export const SignInForm = memo(() => {
  const { t } = useTranslation('signin');
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('oauth');

  const oAuthSSOProviders = useUserStore((s) => s.oAuthSSOProviders);
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const hasOAuthProviders = oAuthSSOProviders && oAuthSSOProviders.length > 0;
  const hasBothMethods = hasOAuthProviders && isMagicLinkEnabled;

  useEffect(() => {
    setMounted(true);
    const urlError = searchParams.get('error');

    if (urlError) {
      // Map URL error codes to translation keys
      const errorKeyMap: Record<string, string> = {
        USER_NOT_FOUND_REQUEST: 'AccountNotFound',
        OAuthSignin: 'OAuthSignin',
        OAuthCallback: 'OAuthCallback',
        OAuthCreateAccount: 'OAuthCreateAccount',
        EmailCreateAccount: 'EmailCreateAccount',
        Callback: 'Callback',
        OAuthAccountNotLinked: 'OAuthAccountNotLinked',
        EmailSignin: 'EmailSignin',
        CredentialsSignin: 'CredentialsSignin',
        SessionRequired: 'SessionRequired',
        AccessDenied: 'AccessDenied',
      };

      const translationKey = errorKeyMap[urlError] || 'generic';
      const errorMessage = t(`errors.${translationKey}`, t('errors.generic'));
      setError(`${errorMessage} - ${searchParams.get('email') || ''}`);
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
      await signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: true, // signIn usually handles redirect automatically
      });
      // Redirect happens, so code below might not run unless redirect: false and manual handling
    } catch (error) {
      setLoadingProvider(null); // Reset loading state on error

      if (error instanceof AuthError) {
        setError(t(`errors.${error.type}`, t('errors.authentication')));
        return;
      }
      // For other errors, or if signIn itself throws before redirecting
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error('Sign-in error:', error);
      setError(t('errors.generic'));
    }
  };

  // Consistent padding for all CardContent sections that hold form elements or loaders
  const cardContentClassName = 'space-y-6 p-6 md:p-8'; // Adjusted padding for smaller screens

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/5 p-4">
        <Card className="w-full max-w-md border border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="pb-8 text-center">
            <Skeleton className="mx-auto mb-4 h-10 w-3/4 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-1/2 rounded-md" />
          </CardHeader>
          {/* Apply consistent padding for skeleton content */}
          <CardContent className={cardContentClassName}>
            <AuthButtonListLoading />
          </CardContent>
          {/* Optional: Skeleton for CardFooter if it has significant height */}
          <CardFooter className="flex flex-col items-center justify-center space-y-6 p-6 pt-4 md:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="space-y-1 text-center">
              <Skeleton className="mx-auto h-3 w-3/4 rounded-md" />
              <Skeleton className="mx-auto h-3 w-1/2 rounded-md" />
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const renderErrorAlert = () =>
    error && (
      <Alert
        variant="destructive"
        className="mb-6 rounded-xl border-red-200/50 bg-red-50/50 backdrop-blur-sm dark:border-red-800/50 dark:bg-red-950/20"
      >
        <AlertDescription className="text-red-700 dark:text-red-300">
          {error}
        </AlertDescription>
      </Alert>
    );

  const renderOAuthProviders = () => (
    <div className="space-y-4">
      {oAuthSSOProviders?.map((provider) => (
        <ProviderButton
          key={provider}
          provider={provider}
          onSignIn={handleSignIn}
          isLoading={loadingProvider === provider}
        />
      ))}
    </div>
  );

  const renderSingleMethod = () => {
    if (hasOAuthProviders && !isMagicLinkEnabled) {
      return (
        <CardContent className={cardContentClassName}>
          {renderErrorAlert()}
          {renderOAuthProviders()}
        </CardContent>
      );
    }

    if (isMagicLinkEnabled && !hasOAuthProviders) {
      return (
        <CardContent className={cardContentClassName}>
          {renderErrorAlert()}{' '}
          {/* Assuming MagicSignInForm handles its own errors, or pass error state */}
          <MagicSignInForm
            onSubmitAction={(data) => {
              return requestMagicLink(data);
            }}
          />
        </CardContent>
      );
    }
    return null;
  };

  const renderTabbedInterface = () => {
    if (!hasBothMethods) return null;

    return (
      <CardContent className={cardContentClassName}>
        {renderErrorAlert()}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted/30 p-1 backdrop-blur-sm">
            <TabsTrigger
              value="oauth"
              className="h-10 rounded-lg bg-transparent font-medium text-sm transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-black/5 data-[state=active]:shadow-md"
            >
              <div className="flex items-center space-x-2">
                <LockIcon className="h-4 w-4" />{' '}
                {/* Adjusted icon size for balance */}
                <span>{t('tabs.sso')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="magic"
              className="h-10 rounded-lg bg-transparent font-medium text-sm transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-black/5 data-[state=active]:shadow-md"
            >
              <div className="flex items-center space-x-2">
                <MailIcon className="h-4 w-4" />{' '}
                {/* Adjusted icon size for balance */}
                <span>{t('tabs.email')}</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oauth" className="mt-6 space-y-4 ">
            {' '}
            {/* Consistent spacing */}
            {renderOAuthProviders()}
          </TabsContent>

          <TabsContent value="magic" className="mt-6 ">
            {' '}
            {/* Consistent spacing */}
            <MagicSignInForm
              onSubmitAction={(data) => {
                return requestMagicLink(data);
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    );
  };

  const renderNoMethods = () => (
    <CardContent className={`${cardContentClassName} py-12 md:py-16`}>
      {' '}
      {/* Ensure padding consistency */}
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 ring-1 ring-border/50">
          <div className="h-10 w-10 rounded-xl border-2 border-muted-foreground/30 border-dashed" />
        </div>
        <h3 className="mb-2 font-semibold text-foreground text-lg">
          {t('noMethods.title')}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t('noMethods.description')}
        </p>
      </div>
    </CardContent>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/5 px-4 py-2">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-primary/20 shadow-xl" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold text-3xl text-transparent tracking-tight">
            {t('welcome.title', { name: BRANDING_NAME })}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        <Card className="border border-border/50 bg-card/60 shadow-2xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="md px-6 pt-6 pb-4 text-center">
            {' '}
            {/* Consistent padding */}
            <CardTitle className="font-semibold text-2xl text-card-foreground">
              {t('form.title')}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {t('form.subtitle')}
            </CardDescription>
          </CardHeader>

          {hasBothMethods ? (
            renderTabbedInterface()
          ) : hasOAuthProviders || isMagicLinkEnabled ? (
            renderSingleMethod()
          ) : oAuthSSOProviders === null ||
            oAuthSSOProviders ===
              undefined /* Loading state for providers */ ? (
            <CardContent className={cardContentClassName}>
              <AuthButtonListLoading />
            </CardContent>
          ) : (
            renderNoMethods()
          )}

          <CardFooter className="flex flex-col items-center justify-center space-y-6 p-3 pt-4 md:px-8 ">
            {' '}
            {/* Consistent padding */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge className="border-green-200/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10 font-medium text-green-700 text-xs dark:border-green-800/50 dark:text-green-400">
                🔒 {t('security.secure')}
              </Badge>
              <Badge className="border-blue-200/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 font-medium text-blue-700 text-xs dark:border-blue-800/50 dark:text-blue-400">
                ⚡ {t('security.fast')}
              </Badge>
              <Badge className="border-purple-200/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10 font-medium text-purple-700 text-xs dark:border-purple-800/50 dark:text-purple-400">
                🛡️ {t('security.private')}
              </Badge>
            </div>
            <div className="text-center text-muted-foreground text-xs leading-relaxed">
              {t('footer.terms.prefix')}{' '}
              <a
                href="/terms"
                className="font-medium text-primary underline-offset-2 transition-all duration-200 hover:text-primary/80 hover:underline"
              >
                {t('footer.terms.link')}
              </a>{' '}
              {t('footer.terms.and')}{' '}
              <a
                href="/privacy"
                className="font-medium text-primary underline-offset-2 transition-all duration-200 hover:text-primary/80 hover:underline"
              >
                {t('footer.privacy.link')}
              </a>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-sm">
            {t('help.prefix')}{' '}
            <a
              href="/support"
              className="font-medium text-primary underline-offset-2 transition-all duration-200 hover:text-primary/80 hover:underline"
            >
              {t('help.link')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
});

SignInForm.displayName = 'SignInForm';

export default SignInForm;
