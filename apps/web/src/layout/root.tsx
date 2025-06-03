import AuthProvider from '@/layout/AuthProvider';
import GlobalLayout from '@/layout/GlobalProvider';
import type { SupportedLocales } from '@repo/i18n/config';
import Analytics from '@repo/ui/components/Analytics';
import { UIProvider } from '@repo/ui/components/ui-provider';
import type React from 'react';
import LocaleProvider from '../i18n/components/Locale';
const inVercel = process.env.VERCEL === '1';
import NextLocaleSwitcher from '@/i18n/components/NextLocaleSwitcher';
import { SpeedInsights } from '@vercel/speed-insights/next';
export default async function RootProvider({
  children,
  locale,
  isMobile = false,
  direction = 'ltr',
}: {
  children: React.ReactNode;
  locale: SupportedLocales;
  isMobile?: boolean;
  direction?: 'ltr' | 'rtl';
}) {
  return (
    <>
      <LocaleProvider locale={locale} direction={direction}>
        <UIProvider>
          <GlobalLayout isMobile={isMobile}>
            <AuthProvider>{children}</AuthProvider>
          </GlobalLayout>
          {/* Language switcher */}
          <div className="fixed right-6 bottom-6 z-50">
            <div className="rounded-xl border border-border/50 bg-background/50 p-2 shadow-lg backdrop-blur-sm">
              <NextLocaleSwitcher />
            </div>
          </div>
        </UIProvider>
      </LocaleProvider>
      <Analytics />
      {inVercel && <SpeedInsights />}
    </>
  );
}
