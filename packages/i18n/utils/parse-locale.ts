import { resolveAcceptLanguage } from "resolve-accept-language";
import {
  FALLBACK_LNG,
  LANGUAGES,
  type SupportedLocales,
} from "../config/client";

export function normalizeLocale(locale?: string | null): SupportedLocales {
  if (!locale) return FALLBACK_LNG;
  const lowerLocale = locale.toLowerCase();
  if ((LANGUAGES as readonly string[]).includes(lowerLocale)) {
    return lowerLocale as SupportedLocales;
  }
  const baseLang = lowerLocale.split("-")[0];
  if ((LANGUAGES as readonly string[]).includes(baseLang as string)) {
    return baseLang as SupportedLocales;
  }
  const supportedBaseLangMatch = LANGUAGES.find((sl) =>
    sl.startsWith(`${baseLang}-`)
  );
  if (supportedBaseLangMatch) {
    return supportedBaseLangMatch;
  }
  return FALLBACK_LNG;
}

export function parseAcceptLanguage(
  acceptLangHeader: string | null
): SupportedLocales {
  // The `resolve-accept-language` library expects BCP47 format.
  // If your LANGUAGES array uses simpler codes (e.g., 'ar'), map them if necessary.
  // Example: const bcp47Languages = LANGUAGES.map(lang => (lang === 'ar' ? 'ar-EG' : lang));
  const resolvedLang = resolveAcceptLanguage(
    acceptLangHeader || "",
    [...LANGUAGES], // Pass your actual supported language codes
    FALLBACK_LNG
  );
  return normalizeLocale(resolvedLang);
}

export async function parsePageLocale(
  // Adapt this to your specific framework's way of providing params
  searchParams?: { [key: string]: string | string[] | undefined }
): Promise<SupportedLocales> {
  const hl = searchParams?.hl;
  const localeParam = searchParams?.locale;
  const potentialLocale = Array.isArray(hl)
    ? hl[0]
    : hl || (Array.isArray(localeParam) ? localeParam[0] : localeParam);
  return normalizeLocale(potentialLocale);
}

/**
 * Parse the browser language and return the fallback language
 */
export const parseBrowserLanguage = (
  headers: Headers,
  defaultLang: string = FALLBACK_LNG
) => {
  // if the default language is not 'en-US', just return the default language as fallback lang
  if (defaultLang !== FALLBACK_LNG) return defaultLang;

  /**
   * The arguments are as follows:
   *
   * 1) The HTTP accept-language header.
   * 2) The available locales (they must contain the default locale).
   * 3) The default locale.
   */
  let browserLang: string = resolveAcceptLanguage(
    headers.get("accept-language") || "",
    //  Invalid locale identifier 'ar'. A valid locale should follow the BCP 47 'language-country' format.
    LANGUAGES.map((locale) => (locale === "ar" ? "ar-EG" : locale)),
    defaultLang
  );

  // if match the ar-EG then fallback to ar
  if (browserLang === "ar-EG") browserLang = "ar";

  return browserLang;
};
