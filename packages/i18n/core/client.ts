import i18n from "i18next";
// import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

import {
  type AppNamespaces,
  FALLBACK_LNG,
  type SupportedLocales,
} from "../config/client";
import { normalizeLocale, updateDocumentDirection } from "../utils";
// To use refactored structure, imports would change:
import { i18nEnvConfig } from "../utils/env"; // Assuming env.ts is at package root
import { getBaseInitOptions } from "./common"; // Corrected path for refactor

const { IS_DEV } = i18nEnvConfig; // Corrected based on your env.ts usage
const getDefaultLocale = (ns: string) => import(`../default/${ns}.ts`);
const localesDir = (lng: SupportedLocales, ns: string) =>
  import(`../../locales/${normalizeLocale(lng)}/${ns}.json`);
export const createI18nNext = (lang?: string, ns?: AppNamespaces) => {
  const instance = i18n
    .use(initReactI18next)
    // .use(LanguageDetector)
    .use(
      resourcesToBackend(async (lng: SupportedLocales, ns: string) => {
        if (IS_DEV && lng === FALLBACK_LNG) return await getDefaultLocale(ns);

        return localesDir(lng, ns);
      })
    );
  // Dynamically set HTML direction on language change
  instance.on("languageChanged", (lng) => {
    updateDocumentDirection(lng);
  });
  return {
    init: () => instance.init(getBaseInitOptions(lang, ns)),
    instance,
  };
};

export { changeLanguage } from "i18next";

// detection: {
//   caches: ['cookie'],
//   cookieMinutes: 60 * 24 * COOKIE_CACHE_DAYS,
//   /**
//      Set `sameSite` to `lax` so that the i18n cookie can be passed to the
//      server side when returning from the OAuth authorization website.
//      ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
//   */
//   cookieOptions: {
//     sameSite: 'lax',
//   },
//   lookupCookie: COOKIE_NAME,
// },
