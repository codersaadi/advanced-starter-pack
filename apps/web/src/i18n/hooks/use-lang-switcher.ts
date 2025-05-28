"use client";

import { useAppLocale } from "@/layout/GlobalProvider/Locale";
import {
  type LocaleOption,
  type SupportedLocales,
  localeOptions, // Your static options from @repo/i18n/settings
} from "@repo/i18n/settings";
import type { AppNamespaces } from "@repo/i18n/settings";
import { useTranslation } from "react-i18next"; // For translating labels if needed
import { useLocalizedNavigation } from "./use-localized-navigation";
interface LanguageSwitcherData {
  currentLocale: SupportedLocales;
  options: readonly LocaleOption[];
  changeLanguage: (newLocale: SupportedLocales) => void;
}

export function useLanguageSwitcher(): LanguageSwitcherData {
  const { currentLocale: activeLocaleFromContext } = useAppLocale(); // From your LocaleContext
  const { changeLanguage } = useLocalizedNavigation();
  const { t, i18n } = useTranslation<AppNamespaces>("common");
  // Prioritize i18n's current language if available and different, then context
  const currentEffectiveLocale =
    (i18n.language as SupportedLocales) || activeLocaleFromContext;

  const translatedOptions = localeOptions.map((option) => ({
    ...option,
    // Example: if you have keys like "common:language.en", "common:language.fr"
    translatedLabel: t(`lang.${option.value}`, option.label),
  }));

  return {
    currentLocale: currentEffectiveLocale,
    options: translatedOptions,
    changeLanguage,
  };
}
