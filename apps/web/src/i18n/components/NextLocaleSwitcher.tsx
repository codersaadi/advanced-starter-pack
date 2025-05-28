'use client';
import { LocaleSwitcher } from '@/i18n/components/LocaleSwitcher';
import { useGlobalStore } from '@/store/global';
import { fallbackLng, localeOptions } from '@repo/i18n/settings';
export default function NextLocaleSwitcher() {
  const language = useGlobalStore((s) => s.status.language);
  const handleLocaleChange = useGlobalStore((s) => s.switchLocale);

  return (
    <LocaleSwitcher
      currentLocale={language || fallbackLng}
      localeOptions={localeOptions}
      onLocaleChange={handleLocaleChange}
    />
  );
}
