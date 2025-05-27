import AuthProvider from '@/layout/AuthProvider';
import GlobalLayout from '@/layout/GlobalProvider';
import type { SupportedLocales } from '@repo/i18n';
import { UIProvider } from '@repo/ui/components/ui-provider';
import type React from 'react';
import LocaleProvider from './GlobalProvider/Locale';

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
    <LocaleProvider locale={locale} direction={direction}>
      <UIProvider>
        <GlobalLayout isMobile={isMobile}>
          <AuthProvider>{children}</AuthProvider>
        </GlobalLayout>
      </UIProvider>
    </LocaleProvider>
  );
}
