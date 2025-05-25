import { resolveAcceptLanguage } from 'resolve-accept-language';
import { fallbackLng, languages, normalizeLocalePath } from './settings';

export const getAntdLocale = async (lang?: string) => {
  let normalLang = normalizeLocalePath(lang);

  // due to antd only have ar-EG locale, we need to convert ar to ar-EG
  // refs: https://ant.design/docs/react/i18n

  // And we don't want to handle it in `normalizeLocale` function
  // because of other locale files are all `ar` not `ar-EG`
  if (normalLang === 'ar') normalLang = 'ar-EG';

  const { default: locale } = await import(
    `antd/locale/${normalLang.replace('-', '_')}.js`
  );

  return locale;
};

/**
 * Parse the browser language and return the fallback language
 */
export const parseBrowserLanguage = (
  headers: Headers,
  defaultLang: string = fallbackLng
) => {
  // if the default language is not 'en-US', just return the default language as fallback lang
  if (defaultLang !== 'en-US') return defaultLang;

  /**
   * The arguments are as follows:
   *
   * 1) The HTTP accept-language header.
   * 2) The available locales (they must contain the default locale).
   * 3) The default locale.
   */
  let browserLang: string = resolveAcceptLanguage(
    headers.get('accept-language') || '',
    //  Invalid locale identifier 'ar'. A valid locale should follow the BCP 47 'language-country' format.
    languages.map((locale) => (locale === 'ar' ? 'ar-EG' : locale)),
    defaultLang
  );

  // if match the ar-EG then fallback to ar
  if (browserLang === 'ar-EG') browserLang = 'ar';

  return browserLang;
};

/**
 * Parse the page locale from the URL and search params
 * @param props
 */
export const parsePageLocale = async (props: {
  params: Promise<{ variants: string }>;
  // biome-ignore lint/suspicious/noExplicitAny:
  searchParams: Promise<any>;
}) => {
  const searchParams = await props.searchParams;

  const browserLocale = (await searchParams.locale) ?? fallbackLng;
  return normalizeLocalePath(searchParams?.hl || browserLocale);
};
