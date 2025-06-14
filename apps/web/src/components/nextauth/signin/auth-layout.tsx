'use client';

import { Badge } from '@repo/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_CONTENT_CLASSNAME } from './constants';
import type { AuthLayoutProps } from './types';

export const AuthLayout = memo<AuthLayoutProps>(
  ({
    children,
    pageTitle,
    pageSubtitle,
    cardTitle,
    cardSubtitle,
    showLogoAndWelcome = true,
    cardContentClassName = CARD_CONTENT_CLASSNAME,
  }) => {
    const { t } = useTranslation('signin'); // 'signin' namespace

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/5 px-4 py-10">
        {/* Added more py padding */}
        <div className="w-full max-w-md">
          {showLogoAndWelcome && (
            <div className="mb-4 text-center">
              {/* Increased mb */}
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20 md:h-24 md:w-24">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-primary/20 shadow-xl md:h-12 md:w-12" />
              </div>
              <h1 className="mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold text-2xl text-transparent tracking-tight md:text-3xl">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                {pageSubtitle}
              </p>
            </div>
          )}

          <Card className="border border-border/50 bg-card/60 shadow-2xl shadow-black/5 backdrop-blur-sm">
            <CardHeader className="px-3 pt-6 pb-4 text-center sm:px-5 md:px-6">
              <CardTitle className="font-semibold text-card-foreground text-xl md:text-2xl">
                {cardTitle}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm md:text-base">
                {cardSubtitle}
              </CardDescription>
            </CardHeader>

            <CardContent className={cardContentClassName}>
              {children}
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center space-y-4 p-4 pt-4 md:space-y-6 md:p-6 md:pt-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className="border-green-300/70 bg-green-500/10 text-green-700 text-xs dark:border-green-700/50 dark:bg-green-500/15 dark:text-green-400"
                >
                  🔒 {t('security.secure')}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-300/70 bg-blue-500/10 text-blue-700 text-xs dark:border-blue-700/50 dark:bg-blue-500/15 dark:text-blue-400"
                >
                  ⚡ {t('security.fast')}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-300/70 bg-purple-500/10 text-purple-700 text-xs dark:border-purple-700/50 dark:bg-purple-500/15 dark:text-purple-400"
                >
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

          <div className="mt-6 text-center">
            {' '}
            {/* Increased mt */}
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
  }
);

AuthLayout.displayName = 'AuthLayout';
