import {
  type DynamicLayoutProps,
  RouteVariants,
} from '@repo/core/utils/route-variants';
import { isRtl } from '@repo/i18n/utils';
import '@repo/ui/globals.css';
import RootProvider from '@/layout/root';
import type React from 'react';
import { geistMono, geistSans } from '../fonts';

interface RootLayoutProps extends DynamicLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: 'Typescript Turborepo',
  description: 'An advanced typesafe turborepo for modern saas applications',
};

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { variants } = await params;
  const { locale, isMobile } = RouteVariants.deserializeVariants(variants);

  const direction = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <RootProvider direction={direction} locale={locale} isMobile={isMobile}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
// using SRP here
// export { generateMetadata } from './metadata';

// export const generateStaticParams = () => {
//   const themes: ThemeAppearance[] = ['dark', 'light'];
//   const mobileOptions = [true, false];
//   // only static for serveral page, other go to dynamtic
//   const staticLocales: SupportedLocales[] = [fallbackLng];

//   const variants: { variants: string }[] = [];

//   for (const locale of staticLocales) {
//     for (const theme of themes) {
//       for (const isMobile of mobileOptions) {
//         variants.push({
//           variants: RouteVariants.serializeVariants({
//             isMobile,
//             locale,
//             theme,
//           }),
//         });
//       }
//     }
//   }

//   return variants;
// };

// export const generateViewport = async (
//   props: DynamicLayoutProps
// ): ResolvingViewport => {
//   const isMobile = await RouteVariants.getIsMobile(props);

//   const dynamicScale = isMobile ? { maximumScale: 1, userScalable: false } : {};

//   return {
//     ...dynamicScale,
//     initialScale: 1,
//     minimumScale: 1,
//     themeColor: [
//       { color: '#f8f8f8', media: '(prefers-color-scheme: light)' },
//       { color: '#000', media: '(prefers-color-scheme: dark)' },
//     ],
//     viewportFit: 'cover',
//     width: 'device-width',
//   };
// };
