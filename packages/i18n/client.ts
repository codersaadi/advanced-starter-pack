// @repo/i18n/factory.ts
import i18n, { type InitOptions } from "i18next"; // Operates on the global singleton
import LanguageDetector, {
  type DetectorOptions,
} from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
export type { Resource } from "i18next";
import { i18nEnvConfig, isDev } from "./env";
// import { updateDocumentDirection } from './rtl'; // REMOVED - LocaleProvider will handle this
import {
  type AppNamespaces,
  type NS,
  type SupportedLocales,
  defaultNS as configDefaultNS,
  cookieName,
  fallbackLng,
  // getBaseInitOptions as getBaseInitOptionsFromSettings, // Using local version for clarity
  normalizeLocalePath,
  languages as supportedLanguagesList,
} from "./settings";

import "./types/i18next.d.ts"; // Import type augmentation

const { DEBUG_GENERAL, DEBUG_BROWSER, DEBUG_SERVER } = i18nEnvConfig;

const getDynamicDebugMode = (): boolean => {
  if (typeof window !== "undefined") {
    return DEBUG_BROWSER ?? DEBUG_GENERAL ?? false;
  }
  return DEBUG_SERVER ?? DEBUG_GENERAL ?? false;
};

const getInternalBaseInitOptions = (
  lngParam?: SupportedLocales | string,
  nsParam?: AppNamespaces | readonly AppNamespaces[]
): InitOptions => {
  const resolvedLng = (lngParam || fallbackLng) as SupportedLocales;
  const resolvedNs = nsParam || configDefaultNS;

  return {
    debug: getDynamicDebugMode(),
    supportedLngs: [...supportedLanguagesList],
    fallbackLng,
    lng: resolvedLng,
    ns: Array.isArray(resolvedNs) ? [...resolvedNs] : [],
    defaultNS: configDefaultNS,
    fallbackNS: configDefaultNS,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  };
};

export const createGlobalI18nController = (
  lang?: SupportedLocales | string,
  ns?: AppNamespaces | readonly AppNamespaces[]
) => {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      resourcesToBackend(async (lngToLoad: string, nsToLoad?: string) => {
        const normalizedLng = normalizeLocalePath(
          lngToLoad
        ) as SupportedLocales;
        if (isDev && normalizedLng === fallbackLng) {
          try {
            const commonNs = "error" as NS;
            return await import(`./default/${nsToLoad ?? commonNs}.ts`);
          } catch (e) {
            // biome-ignore lint/suspicious/noConsole:
            console.warn(
              `[i18n-dev] Failed to load ./default/${nsToLoad}.ts for ${normalizedLng}. Falling back.`,
              e
            );
          }
        }
        return import(
          `../../apps/web/public/locales/${normalizedLng}/${nsToLoad ?? "error"}.json`
        );
      })
    );

  // REMOVED the global document direction updater listener from here.
  // LocaleProvider will now be responsible for this client-side effect.

  return {
    init: (runtimeOptions?: InitOptions) => {
      const baseOptions = getInternalBaseInitOptions(lang, ns);
      const finalOptions: InitOptions = { ...baseOptions, ...runtimeOptions };

      if (typeof window !== "undefined") {
        const defaultDetectionOptions: DetectorOptions = {
          order: [
            "querystring",
            "cookie",
            "localStorage",
            "navigator",
            "htmlTag",
          ],
          caches: ["cookie", "localStorage"],
          lookupCookie: cookieName,
          cookieMinutes: 60 * 24 * 30,
          cookieOptions: { path: "/", sameSite: "lax" },
        };
        finalOptions.detection = {
          ...defaultDetectionOptions,
          ...(baseOptions.detection || {}),
          ...(runtimeOptions?.detection || {}),
        } as DetectorOptions;
      } else if (!baseOptions.detection && !runtimeOptions?.detection) {
        finalOptions.detection = undefined;
      }

      finalOptions.lng = runtimeOptions?.lng || baseOptions.lng;
      finalOptions.ns = runtimeOptions?.ns || baseOptions.ns;

      return i18n.init(finalOptions);
    },
    instance: i18n,
  };
};
