'use client';
import { LocaleSwitcher } from '@/i18n/components/LocaleSwitcher';
import { useGlobalStore } from '@/store/global';
import { FALLBACK_LNG, LOCALE_OPTIONS } from '@repo/i18n/config/client';
export default function NextLocaleSwitcher() {
  const language = useGlobalStore((s) => s.status.language);
  const handleLocaleChange = useGlobalStore((s) => s.switchLocale);

  return (
    <LocaleSwitcher
      currentLocale={language || FALLBACK_LNG}
      localeOptions={LOCALE_OPTIONS}
      onLocaleChange={handleLocaleChange}
    />
  );
}
