'use client';

import {
  enableAuth,
  enableClerk,
  enableNextAuth,
} from '@repo/shared/config/auth';
import { BRANDING_NAME } from '@repo/shared/const/branding';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { ArrowRight, Shield, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function WelcomePage() {
  const { t } = useTranslation('welcome');

  const features = [
    {
      icon: Shield,
      titleKey: 'welcome.features.security.title',
      descriptionKey: 'welcome.features.security.description',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Zap,
      titleKey: 'welcome.features.performance.title',
      descriptionKey: 'welcome.features.performance.description',
      gradient: 'from-yellow-500/10 to-orange-500/10',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      icon: Sparkles,
      titleKey: 'welcome.features.experience.title',
      descriptionKey: 'welcome.features.experience.description',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];
  const getStartedLink =
    enableAuth && enableClerk
      ? '/login'
      : enableNextAuth
        ? 'next-auth/signin'
        : '#';
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="-top-40 -right-40 absolute h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl" />
        <div className="-bottom-40 -left-40 absolute h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/5 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl text-center">
          {/* Logo/Brand section */}
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-2xl shadow-primary/10 ring-1 ring-primary/20">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-primary/30 shadow-xl" />
            </div>

            {/* Main heading */}
            <h1 className="mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text font-bold text-5xl text-transparent tracking-tight sm:text-6xl lg:text-7xl">
              {t('welcome.title', { branding: BRANDING_NAME })}
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed sm:text-2xl">
              {t('welcome.description', { branding: BRANDING_NAME })}
            </p>

            {/* CTA Buttons */}
            <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-14 bg-gradient-to-r from-primary to-primary/90 px-8 font-semibold text-lg shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/30 hover:shadow-xl"
              >
                <Link href={getStartedLink}>
                  {t('welcome.cta.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 border-border/50 bg-background/50 px-8 font-medium text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-background/80 hover:shadow-lg"
              >
                <Link href="/about">{t('welcome.cta.learnMore')}</Link>
              </Button>
            </div>
          </div>

          {/* Features grid */}
          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-border/80 hover:shadow-black/5 hover:shadow-xl"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <h3 className="mb-3 font-semibold text-card-foreground text-xl">
                      {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
                      {t(feature.titleKey as any)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
                      {t(feature.descriptionKey as any)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional info section */}
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm">
            <h2 className="mb-4 font-semibold text-2xl text-card-foreground">
              {t('welcome.ready.title')}
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              {t('welcome.ready.description')}
            </p>
            <Button
              asChild
              className="group bg-gradient-to-r from-primary to-primary/90 font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/30 hover:shadow-xl"
            >
              <Link href={getStartedLink}>
                {t('welcome.ready.cta')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-border/50 border-t bg-background/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-muted-foreground text-sm">
              {t('welcome.footer.copyright', {
                year: new Date().getFullYear(),
                branding: BRANDING_NAME,
              })}
            </p>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                {t('welcome.footer.terms')}
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                {t('welcome.footer.privacy')}
              </Link>
              <Link
                href="/support"
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                {t('welcome.footer.support')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
