'use client';
import { useGlobalStore } from '@/store/global';
import type { SupportedLocales } from '@repo/i18n/settings';
import { Button } from '@repo/ui/components/ui/button';
import { BRANDING_NAME } from '@repo/ui/const/branding';
import { useTranslation } from 'react-i18next';
export default function page() {
  const store = useGlobalStore();
  const langSwitcher = (locale: SupportedLocales) => store.switchLocale(locale);
  const t = useTranslation("welcome")
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">
            {t.t("welcome.title", { branding: BRANDING_NAME })}
          </h1>
          <p className="text-lg">
            {t.t('welcome.description', { branding: BRANDING_NAME })}
          </p>
        </div>
      </div>
      <div className='fixed right-4 bottom-4'>
        <div className="flex space-x-2">
          <Button
            className='rounded bg-blue-500 px-4 py-2 text-white'
            onClick={() => langSwitcher('ar')}
          >
            Arabic
          </Button>
          <Button
            className='rounded bg-green-500 px-4 py-2 text-white'
            onClick={() => langSwitcher('en-US')}
          >
            English
          </Button>
        </div>
      </div>
    </>
  );
}
