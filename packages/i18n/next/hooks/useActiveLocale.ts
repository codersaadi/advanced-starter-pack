// For App Router, you might use `useParams` or a context if locale is in URL params
import {
  type AppNamespaces,
  type SupportedLocales,
  fallbackLng,
  languages,
} from '@repo/i18n/settings';
import { useRouter } from 'next/router'; // For Pages Router
import { useTranslation } from 'react-i18next';

/**
 * Hook to get the current active i18next language and Next.js router locale.
 * It prioritizes the i18next language, then the router locale, then the fallback.
 * @returns The current active locale.
 */
export function useActiveLocale(): SupportedLocales {
  const { i18n } = useTranslation<AppNamespaces>();
  const router = useRouter(); // Assuming Pages Router

  const i18nLanguage = i18n.language;
  const routerLocale = router.locale;

  if (i18nLanguage && languages.includes(i18nLanguage as SupportedLocales)) {
    return i18nLanguage as SupportedLocales;
  }
  if (routerLocale && languages.includes(routerLocale as SupportedLocales)) {
    return routerLocale as SupportedLocales;
  }
  return fallbackLng;
}
