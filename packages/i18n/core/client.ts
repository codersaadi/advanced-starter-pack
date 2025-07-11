import i18n from "i18next";
// import LanguageDetector from 'i18next-browser-languagedetector'; language detector only works on browser
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

import {
  type AppNamespaces,
  FALLBACK_LNG,
  type SupportedLocales,
} from "../config/client";
import { normalizeLocale, updateDocumentDirection } from "../utils";
import { i18nEnvConfig } from "../utils/env"; // Assuming env.ts is at package root
import { getBaseInitOptions } from "./common"; // Corrected path for refactor

const { IS_DEV } = i18nEnvConfig; // Corrected based on your env.ts usage
const getDefaultLocale = (ns: string) => import(`../default/${ns}.ts`);
const localesDir = (lng: SupportedLocales, ns: string) =>
  import(`../../locales/${normalizeLocale(lng)}/${ns}.json`);
export const createI18nNext = (lang?: string, ns?: AppNamespaces) => {
  const instance = i18n
    .use(initReactI18next)
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
