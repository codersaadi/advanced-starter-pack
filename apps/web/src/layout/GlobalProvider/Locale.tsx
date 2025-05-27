'use client';

import { type Resource, createGlobalI18nController } from '@repo/i18n/client'; // Ensure this path is correct
import { isRtl as isRtlLang, updateDocumentDirection } from '@repo/i18n/rtl';
import type { AppNamespaces, SupportedLocales } from '@repo/i18n/settings';
import { DirectionProvider } from '@repo/ui/components/ui-provider';
import dayjs from 'dayjs';
// Ensure all supported Day.js locales are imported or handle dynamic imports more robustly
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
// ... import other dayjs locales you support

import {
  type PropsWithChildren,
  createContext,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { I18nextProvider } from 'react-i18next';

// --- Day.js Helper ---
const updateDayjsLocale = async (lang: string): Promise<void> => {
  let dayJSLocaleKey = lang.toLowerCase();
  if (dayJSLocaleKey === 'en-us') dayJSLocaleKey = 'en';
  // Add other normalizations if needed (e.g., 'es-es' -> 'es')

  try {
    const localeModule = await import(`dayjs/locale/${dayJSLocaleKey}.js`);
    dayjs.locale(localeModule.default || dayJSLocaleKey); // Handle esm and cjs modules
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
// --- End Day.js Helper ---

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
// --- End Custom LocaleContext ---

// --- Error Fallback UI ---
const I18nInitErrorFallback = ({
  error,
  onRetry,
}: { error: Error | unknown; onRetry: () => void }) => {
  console.error(
    'LocaleProvider: Displaying I18nInitErrorFallback due to:',
    error
  );
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', color: '#dc3545' }}>
        Translation Initialization Failed
      </h2>
      <p style={{ margin: '10px 0', color: '#6c757d' }}>
        We encountered an issue loading the necessary language resources. Some
        parts of the application may not display correctly.
      </p>
      {error instanceof Error && (
        <pre
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '0.8em',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxWidth: '80%',
            textAlign: 'left',
            margin: '10px 0',
          }}
        >
          {error.message}
        </pre>
      )}
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '10px 20px',
          fontSize: '1rem',
          color: '#fff',
          backgroundColor: '#007bff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
};
// --- End Error Fallback UI ---

interface LocaleProviderProps extends PropsWithChildren {
  locale: SupportedLocales;
  resources?: Resource;
  namespaces?: readonly AppNamespaces[];
  direction: 'ltr' | 'rtl';
}

const LocaleProvider = memo<LocaleProviderProps>(
  ({
    children,
    locale: initialLocaleFromProp,
    resources,
    namespaces,
    direction: initialDirection,
  }) => {
    // Factory is called once. lang/ns passed here are for getBaseInitOptions inside init()
    const [i18nController] = useState(() =>
      createGlobalI18nController(initialLocaleFromProp, namespaces)
    );
    const i18nInstance = i18nController.instance;

    const [isClientI18nReady, setIsClientI18nReady] = useState(
      i18nInstance.isInitialized
    );
    const [activeI18nLang, setActiveI18nLang] = useState<SupportedLocales>(
      (i18nInstance.language as SupportedLocales) || initialLocaleFromProp
    );
    const [initializationError, setInitializationError] = useState<
      Error | unknown | null
    >(null);

    // Function to attempt i18n initialization or sync
    const attemptInitOrSync = async (attempt = 0) => {
      setInitializationError(null); // Clear previous errors on new attempt

      if (i18nInstance.isInitialized) {
        // Already initialized
        if (i18nInstance.language !== initialLocaleFromProp) {
          console.log(
            `[LocaleProvider] Client: Syncing i18next lang (${i18nInstance.language}) to prop locale: ${initialLocaleFromProp}`
          );
          try {
            await i18nInstance.changeLanguage(initialLocaleFromProp);
          } catch (error) {
            console.error(
              '[LocaleProvider] Client: changeLanguage failed during sync:',
              error
            );
            setInitializationError(error); // Error during sync
            setIsClientI18nReady(false);
            return;
          }
        }
      } else {
        console.log(
          `[LocaleProvider] Client: Attempting i18next init (attempt ${attempt + 1}) for locale:`,
          initialLocaleFromProp
        );
        try {
          await i18nController.init({
            lng: initialLocaleFromProp,
            resources: resources,
            ns: namespaces,
          });
          console.log(
            '[LocaleProvider] Client: i18next initialized. Actual language:',
            i18nInstance.language
          );
        } catch (error) {
          console.error(
            `[LocaleProvider] Client: i18next init FAILED (attempt ${attempt + 1}):`,
            error
          );
          setInitializationError(error);
          setIsClientI18nReady(false); // Explicitly set to false on error
          return; // Stop further processing if init fails
        }
      }

      // If successful or already initialized correctly
      const currentLang =
        (i18nInstance.language as SupportedLocales) || initialLocaleFromProp;
      setActiveI18nLang(currentLang);
      // updateDocumentDirection is handled by the factory's listener
      await updateDayjsLocale(currentLang);
      setIsClientI18nReady(true); // Mark as ready
      setInitializationError(null); // Clear error on success
    };

    // Main effect for initialization and prop changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      let didUnmount = false;
      attemptInitOrSync().then(() => {
        if (didUnmount) return;
        // Post-init actions if any, usually handled within attemptInitOrSync's success path
      });
      return () => {
        didUnmount = true;
      };
    }, [initialLocaleFromProp, resources, namespaces]); // Dependencies that trigger re-init/sync

    // Listener for i18next's 'languageChanged' event (e.g., from language switcher)
    useEffect(() => {
      if (!isClientI18nReady || !i18nInstance || initializationError) return; // Only if ready and no error

      const handleLanguageChangedByI18n = async (newLangStr: string) => {
        const newLang = newLangStr as SupportedLocales;
        setActiveI18nLang(newLang);
        // updateDocumentDirection is handled by the factory's global listener
        await updateDayjsLocale(newLang);
      };

      if (i18nInstance.language) {
        // Sync Day.js if i18n already has a language
        updateDayjsLocale(i18nInstance.language);
      }

      i18nInstance.on('languageChanged', handleLanguageChangedByI18n);
      return () => {
        i18nInstance.off('languageChanged', handleLanguageChangedByI18n);
      };
    }, [i18nInstance, isClientI18nReady, initializationError]);

    // Effect for initial document direction and syncing to prop changes after mount
    useLayoutEffect(() => {
      // RootLayout sets dir on server. This syncs on client for hydration and updates.
      updateDocumentDirection(initialLocaleFromProp);

      if (
        isClientI18nReady &&
        i18nInstance &&
        i18nInstance.language !== initialLocaleFromProp &&
        !initializationError
      ) {
        i18nInstance.changeLanguage(initialLocaleFromProp).catch((error) => {
          console.error(
            '[LocaleProvider] Client (LayoutEffect): prop-driven changeLanguage failed:',
            error
          );
          setInitializationError(error);
          setIsClientI18nReady(false);
        });
      }
    }, [
      initialLocaleFromProp,
      i18nInstance,
      isClientI18nReady,
      initializationError,
    ]);

    const isRtl = isRtlLang(activeI18nLang);
    const direction = isRtl ? 'rtl' : 'ltr';
    const localeContextValue: AppLocaleContextType = {
      currentLocale: activeI18nLang,
      direction,
      isRtl,
    };

    // --- Conditional Rendering ---
    if (initializationError) {
      return (
        <I18nInitErrorFallback
          error={initializationError}
          onRetry={attemptInitOrSync}
        />
      );
    }

    if (!isClientI18nReady || !i18nInstance) {
      // This state means initialization is in progress or hasn't started.
      // Return null or a global app loader. Children relying on useTranslation
      // will suspend if I18nextProvider isn't rendered with a ready instance.
      return null; // Or <GlobalAppSpinner />;
    }

    // If ready and no error, provide contexts and render children
    return (
      // https://www.radix-ui.com/primitives/docs/utilities/direction-provider
      <DirectionProvider dir={isClientI18nReady ? direction : initialDirection}>
        <I18nextProvider i18n={i18nInstance}>
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
