'use client';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { AlertCircle, Clock, Home, RefreshCw, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authRedirectPath } from '../_auth-constants';

export const SessionExpiredClient = ({
  sessionError,
}: {
  sessionError?: string;
}) => {
  const { t } = useTranslation('session');
  const [countdown, setCountdown] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Auto redirect countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setIsRedirecting(true);
    // Redirect to sign-in page
    window.location.href = authRedirectPath;
  }, [countdown]);

  const handleSignIn = () => {
    setIsRedirecting(true);
    window.location.href = authRedirectPath;
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Card */}
        <Card className="shadow-2xl backdrop-blur-lg">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 shadow-lg">
              <Clock className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="font-semibold text-2xl">
              {t('title')}
            </CardTitle>
            <CardDescription className="mt-3">{t('subtitle')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {sessionError && (
              <Alert className="border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive-foreground">
                  {sessionError === 'timeout'
                    ? t('timeoutReason')
                    : t('errorMessage')}
                </AlertDescription>
              </Alert>
            )}

            {/* Description */}
            <div className="space-y-4 text-center">
              <p className="text-foreground leading-relaxed">
                {t('description')}
              </p>

              <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4" />
                <span>{t('securityNote')}</span>
              </div>
            </div>

            {/* Auto Redirect Counter */}
            <div className="rounded-xl border bg-muted p-5 text-center">
              <div className="mb-2 font-medium text-muted-foreground text-sm">
                {t('autoRedirect')}
              </div>
              <div className="font-bold text-3xl text-foreground">
                {countdown} {t('seconds')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleSignIn}
                className="h-12 w-full shadow-lg transition-all duration-200 hover:shadow-xl"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  t('signInButton')
                )}
              </Button>

              <div className="flex space-x-3">
                <Button
                  onClick={handleHome}
                  variant="outline"
                  className="h-11 flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  {t('homeButton')}
                </Button>

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="h-11 flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('refreshButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>{t('companyFooter')}</p>
        </div>
      </div>
    </div>
  );
};
