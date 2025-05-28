'use client';
import { isRtl as isRtlLang, updateDocumentDirection } from '@repo/i18n/rtl';
import { createI18nNext } from '@repo/i18n/server';
import type { AppNamespaces, SupportedLocales } from '@repo/i18n/settings';
import { DirectionProvider } from '@repo/ui/components/direction';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
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
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log(`[LocaleProvider] Day.js locale set to: ${dayJSLocaleKey}`);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.warn(
      `[LocaleProvider] Day.js locale for ${lang} (${dayJSLocaleKey}) not found, falling back to 'en'. Error:`,
      error
    );
    try {
      const enLocaleModule = await import('dayjs/locale/en.js');
      dayjs.locale(enLocaleModule.default || 'en');
    } catch (fallbackError) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
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
    const [i18n] = useState(() =>
      createI18nNext(initialLocaleFromProp, namespaces?.[0])
    );
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

    // Handle i18n instance language change
    useEffect(() => {
      const handleLanguageChange = async (lng: string) => {
        const newLang = lng as SupportedLocales;
        setCurrentLang(newLang);

        if (currentLang === newLang) return;

        // Update Day.js locale non-blocking
        await updateDayjsLocale(newLang);
      };

      i18n.instance.on('languageChanged', handleLanguageChange);
      return () => {
        i18n.instance.off('languageChanged', handleLanguageChange);
      };
    }, [i18n, currentLang]);

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



// Looks better but Blocks UI (not using or removing for Now )

// 'use client';
// import { type Resource, createGlobalI18nController } from '@repo/i18n/client';
// import { isRtl as isRtlLang, updateDocumentDirection } from '@repo/i18n/rtl';
// import type { AppNamespaces, SupportedLocales } from '@repo/i18n/settings';
// import { DirectionProvider } from "@repo/ui/components/direction"
// import dayjs from 'dayjs';
// import 'dayjs/locale/en';
// import 'dayjs/locale/fr';

// import {
//   type PropsWithChildren,
//   createContext,
//   memo,
//   useCallback,
//   useContext,
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { I18nextProvider } from 'react-i18next';

// // --- Day.js Helper ---
// const updateDayjsLocale = async (lang: string): Promise<void> => {
//   let dayJSLocaleKey = lang.toLowerCase();
//   if (dayJSLocaleKey === 'en-us') dayJSLocaleKey = 'en';

//   try {
//     const localeModule = await import(`dayjs/locale/${dayJSLocaleKey}.js`);
//     dayjs.locale(localeModule.default || dayJSLocaleKey);
//     console.log(`[LocaleProvider] Day.js locale set to: ${dayJSLocaleKey}`);
//   } catch (error) {
//     console.warn(
//       `[LocaleProvider] Day.js locale for ${lang} (${dayJSLocaleKey}) not found, falling back to 'en'. Error:`,
//       error
//     );
//     try {
//       const enLocaleModule = await import('dayjs/locale/en.js');
//       dayjs.locale(enLocaleModule.default || 'en');
//     } catch (fallbackError) {
//       console.error(
//         "[LocaleProvider] Failed to load fallback Day.js 'en' locale:",
//         fallbackError
//       );
//     }
//   }
// };

// // --- Custom LocaleContext ---
// interface AppLocaleContextType {
//   currentLocale: SupportedLocales;
//   direction: 'ltr' | 'rtl';
//   isRtl: boolean;
// }

// const AppLocaleContext = createContext<AppLocaleContextType | undefined>(
//   undefined
// );

// export const useAppLocale = () => {
//   const context = useContext(AppLocaleContext);
//   if (context === undefined) {
//     throw new Error('useAppLocale must be used within a LocaleProvider');
//   }
//   return context;
// };

// // --- Error Fallback UI ---
// const I18nInitErrorFallback = memo(({
//   error,
//   onRetry,
// }: { error: Error | unknown; onRetry: () => void }) => {
//   console.error(
//     'LocaleProvider: Displaying I18nInitErrorFallback due to:',
//     error
//   );
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '100vh',
//         padding: '20px',
//         textAlign: 'center',
//         fontFamily: 'sans-serif',
//       }}
//     >
//       <h2 style={{ fontSize: '1.5rem', color: '#dc3545' }}>
//         Translation Initialization Failed
//       </h2>
//       <p style={{ margin: '10px 0', color: '#6c757d' }}>
//         We encountered an issue loading the necessary language resources. Some
//         parts of the application may not display correctly.
//       </p>
//       {error instanceof Error && (
//         <pre
//           style={{
//             background: '#f8f9fa',
//             border: '1px solid #dee2e6',
//             padding: '10px',
//             borderRadius: '4px',
//             fontSize: '0.8em',
//             whiteSpace: 'pre-wrap',
//             wordBreak: 'break-all',
//             maxWidth: '80%',
//             textAlign: 'left',
//             margin: '10px 0',
//           }}
//         >
//           {error.message}
//         </pre>
//       )}
//       <button
//         type="button"
//         onClick={onRetry}
//         style={{
//           padding: '10px 20px',
//           fontSize: '1rem',
//           color: '#fff',
//           backgroundColor: '#007bff',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: 'pointer',
//         }}
//       >
//         Try Again
//       </button>
//     </div>
//   );
// });

// I18nInitErrorFallback.displayName = 'I18nInitErrorFallback';

// interface LocaleProviderProps extends PropsWithChildren {
//   locale: SupportedLocales;
//   resources?: Resource;
//   namespaces?: readonly AppNamespaces[];
//   direction: 'ltr' | 'rtl';
// }

// const LocaleProvider = memo<LocaleProviderProps>(
//   ({
//     children,
//     locale: initialLocaleFromProp,
//     resources,
//     namespaces,
//     direction: initialDirection,
//   }) => {
//     // Use ref to track if we're already initializing to prevent multiple concurrent inits
//     const isInitializingRef = useRef(false);
//     const mountedRef = useRef(true);

//     // Memoize the i18n controller to prevent recreation on every render
//     // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
//     const i18nController = useMemo(() =>
//       createGlobalI18nController(initialLocaleFromProp, namespaces),
//       [] // Only create once - don't recreate on prop changes
//     );

//     const i18nInstance = i18nController.instance;

//     const [isClientI18nReady, setIsClientI18nReady] = useState(
//       i18nInstance.isInitialized
//     );
//     const [activeI18nLang, setActiveI18nLang] = useState<SupportedLocales>(
//       (i18nInstance.language as SupportedLocales) || initialLocaleFromProp
//     );
//     const [initializationError, setInitializationError] = useState<
//       Error | unknown | null
//     >(null);

//     // Memoized function to attempt i18n initialization or sync
//     const attemptInitOrSync = useCallback(async () => {
//       if (isInitializingRef.current || !mountedRef.current) {
//         return; // Prevent concurrent initialization
//       }

//       isInitializingRef.current = true;
//       setInitializationError(null);

//       try {
//         if (i18nInstance.isInitialized) {
//           // Already initialized - only sync if language is different
//           if (i18nInstance.language !== initialLocaleFromProp) {
//             console.log(
//               `[LocaleProvider] Client: Syncing i18next lang (${i18nInstance.language}) to prop locale: ${initialLocaleFromProp}`
//             );
//             await i18nInstance.changeLanguage(initialLocaleFromProp);
//           }
//         } else {
//           console.log(
//             '[LocaleProvider] Client: Attempting i18next init for locale:',
//             initialLocaleFromProp
//           );
//           await i18nController.init({
//             lng: initialLocaleFromProp,
//             resources: resources,
//             ns: namespaces,
//           });
//           console.log(
//             '[LocaleProvider] Client: i18next initialized. Actual language:',
//             i18nInstance.language
//           );
//         }

//         if (!mountedRef.current) return;

//         // If successful
//         const currentLang =
//           (i18nInstance.language as SupportedLocales) || initialLocaleFromProp;
//         setActiveI18nLang(currentLang);

//         // Update Day.js locale non-blocking
//         updateDayjsLocale(currentLang).catch(console.warn);

//         setIsClientI18nReady(true);
//         setInitializationError(null);
//       } catch (error) {
//         console.error('[LocaleProvider] Client: i18next init/sync FAILED:', error);
//         if (mountedRef.current) {
//           setInitializationError(error);
//           setIsClientI18nReady(false);
//         }
//       } finally {
//         isInitializingRef.current = false;
//       }
//     }, [initialLocaleFromProp, resources, namespaces, i18nController, i18nInstance]);

//     // Main effect for initialization and prop changes
//     useEffect(() => {
//       attemptInitOrSync();
//     }, [attemptInitOrSync]);

//     // Cleanup on unmount
//     useEffect(() => {
//       return () => {
//         mountedRef.current = false;
//       };
//     }, []);

//     // Listener for i18next's 'languageChanged' event
//     useEffect(() => {
//       if (!isClientI18nReady || !i18nInstance || initializationError) return;

//       const handleLanguageChangedByI18n = async (newLangStr: string) => {
//         if (!mountedRef.current) return;

//         const newLang = newLangStr as SupportedLocales;
//         setActiveI18nLang(newLang);

//         // Update Day.js locale non-blocking
//         updateDayjsLocale(newLang).catch(console.warn);
//       };

//       // Initial Day.js sync if i18n already has a language
//       if (i18nInstance.language) {
//         updateDayjsLocale(i18nInstance.language).catch(console.warn);
//       }

//       i18nInstance.on('languageChanged', handleLanguageChangedByI18n);
//       return () => {
//         i18nInstance.off('languageChanged', handleLanguageChangedByI18n);
//       };
//     }, [i18nInstance, isClientI18nReady, initializationError]);

//     // Effect for document direction - use useLayoutEffect to prevent FOUC
//     useLayoutEffect(() => {
//       updateDocumentDirection(initialLocaleFromProp);

//       // Only trigger language change if ready and language is different
//       if (
//         isClientI18nReady &&
//         i18nInstance &&
//         i18nInstance.language !== initialLocaleFromProp &&
//         !initializationError &&
//         !isInitializingRef.current
//       ) {
//         i18nInstance.changeLanguage(initialLocaleFromProp).catch((error) => {
//           console.error(
//             '[LocaleProvider] Client (LayoutEffect): prop-driven changeLanguage failed:',
//             error
//           );
//           if (mountedRef.current) {
//             setInitializationError(error);
//             setIsClientI18nReady(false);
//           }
//         });
//       }
//     }, [initialLocaleFromProp, i18nInstance, isClientI18nReady, initializationError]);

//     // Memoize context value to prevent unnecessary re-renders
//     const isRtl = useMemo(() => isRtlLang(activeI18nLang), [activeI18nLang]);
//     const direction = isRtl ? 'rtl' : 'ltr';

//     const localeContextValue: AppLocaleContextType = useMemo(() => ({
//       currentLocale: activeI18nLang,
//       direction,
//       isRtl,
//     }), [activeI18nLang, direction, isRtl]);

//     // Memoized retry function
//     const handleRetry = useCallback(() => {
//       setInitializationError(null);
//       setIsClientI18nReady(false);
//       attemptInitOrSync();
//     }, [attemptInitOrSync]);

//     // --- Conditional Rendering ---
//     if (initializationError) {
//       return (
//         <I18nInitErrorFallback
//           error={initializationError}
//           onRetry={handleRetry}
//         />
//       );
//     }

//     if (!isClientI18nReady || !i18nInstance || !i18nInstance.isInitialized) {
//       // Don't render I18nextProvider until i18n is fully ready
//       return (
//         <DirectionProvider direction={initialDirection}>
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             minHeight: '100vh',
//             fontFamily: 'sans-serif'
//           }}>
//             <div>Loading translations...</div>
//           </div>
//         </DirectionProvider>
//       );
//     }
//     // If ready and no error, provide contexts and render children
//     return (
//       <DirectionProvider direction={direction}>
//         <I18nextProvider i18n={i18nInstance}>
//           <AppLocaleContext.Provider value={localeContextValue}>
//             {children}
//           </AppLocaleContext.Provider>
//         </I18nextProvider>
//       </DirectionProvider>
//     );
//   }
// );

// LocaleProvider.displayName = 'LocaleProvider';
// export default LocaleProvider;
