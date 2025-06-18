// import i18n, { type InitOptions } from 'i18next'; // Operates on the global singleton
// import LanguageDetector, {
//   type DetectorOptions,
// } from 'i18next-browser-languagedetector';
// import resourcesToBackend from 'i18next-resources-to-backend';
// import { initReactI18next } from 'react-i18next';

// import {
//   // Types
//   type AppNamespaces,
//   COOKIE_NAME,
//   // Core Config
//   DEBUG_MODE, // Use the pre-calculated debug mode from config
//   DEFAULT_NAMESPACE,
//   FALLBACK_LNG,
//   LANGUAGES,
//   type SupportedLocales,
//   // Paths (might not be directly used here if dynamic imports are web paths)
//   // PATHS,
// } from '../config/client'; // Centralized config
// import { normalizeLocale } from '../utils'; // Centralized util
// import { i18nEnvConfig } from '../utils/env'; // From package root

// // Augment i18next's Resource type if you have custom structures.
// // If types/generated.d.ts defines 'Resources', i18next should pick it up
// // via tsconfig if the package structure allows.
// // Otherwise, you might explicitly import it:
// // import type { Resources } from '../types/generated';
// export type { Resource } from 'i18next'; // Re-export for convenience
// const getDefaultLocale = (ns: string) => import(`../default/${ns}.ts`);
// const localesDir = (lng: SupportedLocales, ns: string) =>
//   import(`../../locales/${lng}/${ns}.json`);

// const { IS_DEV } = i18nEnvConfig; // Simplify dev check

// // --- Internal Base Options Builder ---
// // This function now strictly uses the centralized config.
// const getInternalBaseInitOptions = (
//   lngParam?: SupportedLocales | string,
//   nsParam?: AppNamespaces | readonly AppNamespaces[]
// ): InitOptions => {
//   const resolvedLng = normalizeLocale(lngParam || FALLBACK_LNG); // Normalize
//   const resolvedNs = nsParam || DEFAULT_NAMESPACE;

//   return {
//     debug: DEBUG_MODE, // Centralized debug mode
//     supportedLngs: [...LANGUAGES],
//     fallbackLng: FALLBACK_LNG,
//     lng: resolvedLng,
//     ns: Array.isArray(resolvedNs) ? [...resolvedNs] : [resolvedNs], // Ensure ns is always an array
//     defaultNS: DEFAULT_NAMESPACE,
//     fallbackNS: DEFAULT_NAMESPACE,
//     interpolation: {
//       escapeValue: false, // React escapes by default
//     },
//     react: {
//       useSuspense: true, // Common React i18next setting
//     },
//     // Partial bundling can be useful if you load namespaces on demand
//     // partialBundledLanguages: true,
//   };
// };

// // --- Global i18next Controller ---
// /**
//  * Initializes and configures the global i18next singleton instance.
//  * This is typically called once at the application's entry point.
//  * The LocaleProvider will then use this globally configured instance.
//  */
// export const initializeGlobalI18next = (
//   initialLang?: SupportedLocales | string,
//   initialNs?: AppNamespaces | readonly AppNamespaces[]
// ) => {
//   if (i18n.isInitialized) {
//     // biome-ignore lint/suspicious/noConsole: Informational
//     console.warn(
//       '[i18n] Global instance is already initialized. Skipping re-initialization.'
//     );
//     return {
//       instance: i18n,
//       initPromise: Promise.resolve(i18n.t), // Return a resolved promise with the t function
//     };
//   }

//   i18n
//     .use(initReactI18next) // Must be before LanguageDetector if using react-i18next bindings
//     .use(LanguageDetector)
//     .use(
//       resourcesToBackend(async (lngToLoad: string, nsToLoad?: string) => {
//         const normalizedLng = normalizeLocale(lngToLoad);
//         const namespace = nsToLoad || DEFAULT_NAMESPACE; // Ensure a namespace is always provided

//         if (IS_DEV && normalizedLng === FALLBACK_LNG) {
//           try {
//             // Relative path from this file (e.g., core/globalController.ts) to default/
//             return await getDefaultLocale(namespace);
//           } catch (e) {
//             // biome-ignore lint/suspicious/noConsole: <explanation>
//             console.warn(
//               `[i18n-dev] Failed to load ../default/${namespace}.ts for ${normalizedLng}.`,
//               (e as Error).message
//             );
//             // Fallback to trying the JSON path if the TS file fails, or rethrow/return empty
//             // For simplicity, we'll let it proceed to the JSON path attempt if this fails.
//           }
//         }
//         // For production/other locales, load JSON from the public path
//         // This path assumes the files are served from `/locales` at the web app's root.
//         try {
//           return localesDir(normalizedLng, namespace);
//         } catch (e) {
//           // biome-ignore lint/suspicious/noConsole: <explanation>
//           console.error(
//             `[i18n] Failed to load /locales/${normalizedLng}/${namespace}.json.`,
//             (e as Error).message
//           );
//           return {}; // Return empty object to prevent breaking the chain
//         }
//       })
//     );

//   const baseOptions = getInternalBaseInitOptions(initialLang, initialNs);
//   const finalOptions: InitOptions = { ...baseOptions };

//   // Configure LanguageDetector only on the client-side
//   if (typeof window !== 'undefined') {
//     const defaultDetectionOptions: DetectorOptions = {
//       order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
//       caches: ['cookie', 'localStorage'],
//       lookupQuerystring: 'hl', // Consistent with client.ts example
//       lookupCookie: COOKIE_NAME,
//       cookieMinutes: 60 * 24 * 30, // 30 days
//       cookieOptions: { path: '/', sameSite: 'lax' },
//       // cookieDomain: 'your-domain.com', // Optional: if needed
//     };
//     finalOptions.detection = {
//       ...defaultDetectionOptions,
//       ...(baseOptions.detection || {}), // Allow overrides from base if ever needed
//     };
//   } else {
//     // On the server, if language is not explicitly set, detection won't run.
//     // `lng` must be provided or it will use fallbackLng.
//     finalOptions.detection = undefined;
//   }

//   // The init promise resolves with the t function
//   const initPromise = i18n.init(finalOptions);

//   return {
//     instance: i18n, // The global singleton
//     initPromise, // The promise returned by i18n.init()
//   };
// };
