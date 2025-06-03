'use client';
import { LocaleSwitcher } from '@/i18n/components/LocaleSwitcher';
import { useGlobalStore } from '@/store/global';
import {
  FALLBACK_LNG,
  LOCALE_OPTIONS,
  type SupportedLocales,
} from '@repo/i18n/config/client';
import { useRouter } from 'next/navigation';
export default function NextLocaleSwitcher() {
  const language = useGlobalStore((s) => s.status.language);
  const handleLocaleChange = useGlobalStore((s) => s.switchLocale);
  const r = useRouter();
  const onLocaleChange = (locale: SupportedLocales) => {
    handleLocaleChange(locale);
    r.refresh();
  };

  return (
    <LocaleSwitcher
      currentLocale={language || FALLBACK_LNG}
      localeOptions={LOCALE_OPTIONS}
      onLocaleChange={onLocaleChange}
    />
  );
}
