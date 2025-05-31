import {
  ORG_LOCALE_HEADER,
  type SupportedLocales,
} from "@repo/i18n/config/client";
import { changeLanguage } from "@repo/i18n/core";
import { setCookie } from "./cookie";
export const switchLang = (locale: SupportedLocales | "auto") => {
  const lang = locale === "auto" ? navigator.language : locale;

  changeLanguage(lang);
  document.documentElement.lang = lang;

  setCookie(ORG_LOCALE_HEADER, locale === "auto" ? undefined : locale, 365);
};
