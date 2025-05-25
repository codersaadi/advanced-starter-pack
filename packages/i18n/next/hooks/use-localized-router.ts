import type { AppNamespaces, SupportedLocales } from '@repo/i18n/settings';
import { type NextRouter, useRouter } from 'next/router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface LocalizedRouter extends NextRouter {
  /**
   * Navigates to the given href, automatically prefixing with the current or specified locale.
   * @param href The path to navigate to (e.g., '/about', or an object).
   * @param as The path that will be displayed in the browser URL.
   * @param options Navigation options, including an optional `locale` to override the current one.
   */
  localizedPush: (
    href: Parameters<NextRouter['push']>[0],
    as?: Parameters<NextRouter['push']>[1],
    options?: Parameters<NextRouter['push']>[2] & { locale?: SupportedLocales }
  ) => ReturnType<NextRouter['push']>;

  /**
   * Replaces the current history entry, automatically prefixing with the current or specified locale.
   * @param href The path to navigate to (e.g., '/about', or an object).
   * @param as The path that will be displayed in the browser URL.
   * @param options Navigation options, including an optional `locale` to override the current one.
   */
  localizedReplace: (
    href: Parameters<NextRouter['replace']>[0],
    as?: Parameters<NextRouter['replace']>[1],
    options?: Parameters<NextRouter['replace']>[2] & {
      locale?: SupportedLocales;
    }
  ) => ReturnType<NextRouter['replace']>;

  /**
   * Changes the application's language and updates the Next.js route.
   * @param newLocale The target locale.
   */
  changeLanguage: (newLocale: SupportedLocales) => void;
}

export function useLocalizedRouter(): LocalizedRouter {
  const router = useRouter();
  const { i18n } = useTranslation<AppNamespaces>(); // To trigger i18next language change

  const localizedNavigate = useCallback(
    (method: 'push' | 'replace') =>
      (
        href: Parameters<NextRouter['push']>[0],
        as?: Parameters<NextRouter['push']>[1],
        options?: Parameters<NextRouter['push']>[2] & {
          locale?: SupportedLocales;
        }
      ) => {
        const targetLocale = options?.locale || router.locale || i18n.language;

        // If href is a string, we might need to prepend locale if not using defaultLocale prefixing strategy from Next.js
        // However, Next.js handles this with its `locale` prop in router.push/replace
        return router[method](href, as, {
          ...options,
          locale: targetLocale as string,
        });
      },
    [router, i18n.language]
  );

  const changeLanguage = useCallback(
    (newLocale: SupportedLocales) => {
      if (i18n.language !== newLocale) {
        i18n.changeLanguage(newLocale); // Change i18next language
      }
      // Change Next.js route locale
      // router.pathname will give current page like /products/[id]
      // router.asPath will give /en/products/123
      // router.query will give { id: "123" }
      router.push(
        { pathname: router.pathname, query: router.query },
        router.asPath,
        {
          locale: newLocale,
          // shallow: true, // Optional: use shallow routing if page content doesn't change, only translations
        }
      );
    },
    [i18n, router]
  );

  return {
    ...router,
    localizedPush: localizedNavigate('push'),
    localizedReplace: localizedNavigate('replace'),
    changeLanguage,
  };
}
