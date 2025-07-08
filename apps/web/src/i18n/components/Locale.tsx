'use client';
import { createI18nNext } from '@repo/i18n/core';
import { isRtl as isRtlLang, updateDocumentDirection } from '@repo/i18n/utils';
import { DirectionProvider } from '@repo/ui/components/direction';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import type { AppNamespaces, SupportedLocales } from '@repo/i18n/config/client';
import {
  type PropsWithChildren,
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nextProvider } from 'react-i18next';

// --- Day.js Helper ---
const updateDayjsLocale = async (lang: string): Promise<void> => {
  let dayJSLocaleKey = lang.toLowerCase();
  if (dayJSLocaleKey === 'en-us') dayJSLocaleKey = 'en';

  try {
    const localeModule = await import(`dayjs/locale/${dayJSLocaleKey}.js`);
    dayjs.locale(localeModule.default || dayJSLocaleKey);
    console.log(`[LocaleProvider] Day.js locale set to: ${dayJSLocaleKey}`);
  } catch (error) {
    console.warn(
      `[LocaleProvider] Day.js locale for ${lang} (${dayJSLocaleKey}) not found, falling back to 'en'. Error:`,
      error
    );
    try {
      const enLocaleModule = await import('dayjs/locale/en.js');
      dayjs.locale(enLocaleModule.default || 'en');
    } catch (fallbackError) {
      console.error(
        "[LocaleProvider] Failed to load fallback Day.js 'en' locale:",
        fallbackError
      );
    }
  }
};

// --- Custom LocaleContext ---
interface AppLocaleContextType {
  currentLocale: SupportedLocales;
  direction: 'ltr' | 'rtl';
  isRtl: boolean;
}

const AppLocaleContext = createContext<AppLocaleContextType | undefined>(
  undefined
);

export const useAppLocale = () => {
  const context = useContext(AppLocaleContext);
  if (context === undefined) {
    throw new Error('useAppLocale must be used within a LocaleProvider');
  }
  return context;
};

interface LocaleProviderProps extends PropsWithChildren {
  locale: SupportedLocales;
  // resources?: Resources;
  namespaces?: readonly AppNamespaces[];
  direction: 'ltr' | 'rtl';
}

const LocaleProvider = memo<LocaleProviderProps>(
  ({
    children,
    locale: initialLocaleFromProp,
    // resources,
    namespaces,
    direction: initialDirection,
  }) => {
    const i18n = createI18nNext(initialLocaleFromProp, namespaces?.[0]);
    const [currentLang, setCurrentLang] = useState(initialLocaleFromProp);

    // Check if we're on server side
    const isOnServerSide = typeof window === 'undefined';

    // Server-side initialization
    if (isOnServerSide) {
      i18n.init();
    } else {
      // Client-side: init only once, non-blocking
      // biome-ignore lint/style/useCollapsedElseIf: <explanation>
      if (!i18n.instance.isInitialized) {
        i18n
          .init()
          .then(async () => {
            if (initialLocaleFromProp) {
              await updateDayjsLocale(initialLocaleFromProp);
            }
          })
          .catch(console.error);
      }
    }

    // // Handle i18n instance language change
    // useEffect(() => {
    //   const handleLanguageChange = async (lng: string) => {
    //     const newLang = lng as SupportedLocales;
    //     setCurrentLang(newLang);

    //     if (currentLang === newLang) return;

    //     // Update Day.js locale non-blocking
    //     await updateDayjsLocale(newLang);
    //   };

    //   i18n.instance.on('languageChanged', handleLanguageChange);
    //   return () => {
    //     i18n.instance.off('languageChanged', handleLanguageChange);
    //   };
    // }, [i18n, currentLang]);

    // Handle prop locale changes
    useEffect(() => {
      if (
        i18n.instance.isInitialized &&
        i18n.instance.language !== initialLocaleFromProp
      ) {
        i18n.instance
          .changeLanguage(initialLocaleFromProp)
          .catch(console.error);
      }
    }, [initialLocaleFromProp, i18n]);

    // Update document direction when locale changes
    useEffect(() => {
      if (typeof window !== 'undefined') {
        updateDocumentDirection(currentLang);
      }
    }, [currentLang]);

    // Memoize context value and direction
    const isRtl = useMemo(() => isRtlLang(currentLang), [currentLang]);
    const direction = isRtl ? 'rtl' : 'ltr';

    const localeContextValue: AppLocaleContextType = useMemo(
      () => ({
        currentLocale: currentLang,
        direction,
        isRtl,
      }),
      [currentLang, direction, isRtl]
    );

    // Always render children immediately - non-blocking approach
    return (
      <DirectionProvider direction={direction ?? initialDirection}>
        <I18nextProvider i18n={i18n.instance}>
          <AppLocaleContext.Provider value={localeContextValue}>
            {children}
          </AppLocaleContext.Provider>
        </I18nextProvider>
      </DirectionProvider>
    );
  }
);

LocaleProvider.displayName = 'LocaleProvider';
export default LocaleProvider;
