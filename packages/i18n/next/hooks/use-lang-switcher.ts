import { useLocalizedRouter } from '@repo/i18n/next/hooks/use-localized-router';
import {
  type LocaleOption,
  type SupportedLocales,
  localeOptions,
} from '@repo/i18n/settings';
import { useActiveLocale } from './useActiveLocale';

interface LanguageSwitcherData {
  currentLocale: SupportedLocales;
  options: readonly LocaleOption[]; // Or a translated version
  changeLanguage: (newLocale: SupportedLocales) => void;
}

/**
 * Hook to provide data and functionality for building a language switcher UI.
 */
export function useLanguageSwitcher(): LanguageSwitcherData {
  const activeLocale = useActiveLocale();
  const { changeLanguage } = useLocalizedRouter();
  // Optionally, map localeOptions to translate their labels
  const translatedOptions = localeOptions.map((option) => ({
    ...option,
    // Example: if you have keys like "language.en", "language.fr" in 'common' namespace
    // translatedLabel: t(`language.${option.value}`, option.label), // Fallback to native label
    // For simplicity here, we'll just use the native label
    translatedLabel: option.label,
  }));

  return {
    currentLocale: activeLocale,
    options: translatedOptions, // Use `localeOptions` directly if labels are not translated
    changeLanguage,
  };
}
