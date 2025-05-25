// @repo/i18n/settings
import type { InitOptions } from 'i18next';
import { i18nEnvConfig, isOnServerSide } from './env';

// --- Core Language & Namespace Configuration ---
export const fallbackLng = 'en' as const;
export const languages = [
  fallbackLng,
  'fr',
  'ar',
  'bg-BG',
  'de-DE',
  'en-US',
  'es-ES',
  'fr-FR',
  'ja-JP',
  'ko-KR',
  'pt-BR',
  'ru-RU',
  'tr-TR',
  'zh-CN',
  'zh-TW',
  'vi-VN',
  'fa-IR',
] as const; // Add more as needed
export type SupportedLocales = (typeof languages)[number];

export const defaultNS = 'common' as const;
export const namespaces = ['common', 'home', 'errors'] as const;
export type AppNamespaces = (typeof namespaces)[number];

// --- Cookie Configuration ---
export const cookieName = 'i18n-org-locale'; // More specific cookie name

// --- UI Options for Language Selection ---
export type LocaleOption = {
  /** Native label for the language */
  label: string;
  /** Translated label for the current UI language (optional, can be derived with t()) */
  translatedLabel?: string;
  value: SupportedLocales;
  /** Direction for this locale (ltr or rtl) */
  dir: 'ltr' | 'rtl';
};

// For this to be fully dynamic, labels might need to be translation keys themselves.
// Or, provide labels in their native language.
export const localeOptions: readonly LocaleOption[] = [
  { label: 'English', value: 'en', dir: 'ltr' },
  { label: 'Français', value: 'fr', dir: 'ltr' },
  { label: 'Español', value: 'es-ES', dir: 'ltr' },
  { label: '简体中文', value: 'zh-CN', dir: 'ltr' },
  // Example RTL: { label: 'العربية', value: 'ar', dir: 'rtl' }, // if 'ar' is added to languages
] as const;

const { DEBUG_GENERAL, DEBUG_BROWSER, DEBUG_SERVER } = i18nEnvConfig;
const debugMode =
  (DEBUG_GENERAL ?? isOnServerSide) ? DEBUG_SERVER : DEBUG_BROWSER;

// --- i18next Initialization Options ---
/**
 * Generates base i18next initialization options.
 * @param lng - The target language.
 * @param ns - The namespaces to load.
 * @returns Base i18next InitOptions.
 */
export function getBaseInitOptions(
  lng: string = fallbackLng,
  ns: AppNamespaces | readonly AppNamespaces[] = defaultNS
): InitOptions {
  return {
    debug: debugMode,
    supportedLngs: [...languages], // Spread to ensure it's a new array mutable by i18next
    fallbackLng,
    lng,
    ns: Array.isArray(ns) ? [...ns] : [ns],
    defaultNS,
    fallbackNS: defaultNS, // Fallback to defaultNS if a key is not found in requested NS
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  };
}

/**
 * Normalizes a locale string for file path resolution if needed.
 * Example: map 'en-US' and 'en-GB' to an 'en' folder.
 * For now, we assume direct mapping.
 * @param locale - The input locale string.
 * @returns A normalized locale string for path usage.
 */
export function normalizeLocalePath(locale?: string): string {
  if (!locale) {
    return fallbackLng;
  }
  // Add normalization logic here if your folder structure differs from exact locale codes
  // e.g., if (locale.startsWith('en-')) return 'en';
  if (languages.includes(locale as SupportedLocales)) {
    return locale;
  }
  // Fallback for unsupported locales if necessary, or let i18next handle fallbackLng
  const baseLang = locale.split('-')[0];
  if (languages.includes(baseLang as SupportedLocales)) {
    return baseLang as string;
  }
  return fallbackLng; // Default to fallbackLng if no match
}

export const ORG_LOCALE_HEADER = 'org-next-locale';
