import { FALLBACK_LNG, type SupportedLocales } from "@repo/i18n/config/client";
import { isOnServerSide } from "@repo/i18n/env";
import type { GlobalState } from "../initialState";
import { systemStatus } from "./systemStatus";

const language = (s: GlobalState) => systemStatus(s).language || "auto";

const currentLanguage = (s: GlobalState) => {
  const locale = language(s);

  if (locale === "auto") {
    if (isOnServerSide) return FALLBACK_LNG;

    return navigator.language as SupportedLocales;
  }

  return locale as SupportedLocales;
};

export const globalGeneralSelectors = {
  currentLanguage,
  language,
};
