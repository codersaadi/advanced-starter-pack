// import i18n from "i18next";
// import LanguageDetector from "i18next-browser-languagedetector";
// import resourcesToBackend from "i18next-resources-to-backend";
// import { initReactI18next } from "react-i18next";
// import { isRtlLang } from "rtl-detect";
// import { isDev } from "./env";
// import {
//   type AppNamespaces,
//   type SupportedLocales,
//   fallbackLng,
//   getBaseInitOptions,
//   normalizeLocalePath,
// } from "./settings";

// export const createI18nNext = (lang?: string, ns?: AppNamespaces) => {
//   const instance = i18n
//     .use(initReactI18next)
//     .use(LanguageDetector)
//     .use(
//       resourcesToBackend(async (lng: SupportedLocales, ns: string) => {
//         if (isDev && lng === fallbackLng) return import(`./default/${ns}`);

//         return import(`../../locales/${normalizeLocalePath(lng)}/${ns}.json`);
//       })
//     );
//   // Dynamically set HTML direction on language change
//   instance.on("languageChanged", (lng) => {
//     if (typeof window !== "undefined") {
//       const direction = isRtlLang(lng) ? "rtl" : "ltr";
//       document.documentElement.dir = direction;
//     }
//   });
//   return {
//     init: () => instance.init(getBaseInitOptions(lang, ns)),
//     instance,
//   };
// };

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
