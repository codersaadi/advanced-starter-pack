import type { SupportedLocales } from '@repo/i18n/config';
import { translation } from '@repo/i18n/next';

export const BlogPageHeader = async ({
  locale,
}: {
  locale: SupportedLocales;
}) => {
  const { t } = await translation('blog', locale); // Assuming you have a translation function
  return (
    <div className="max-w-2xl">
      {/* Using text-zinc-100 and text-zinc-400 from Tailwind defaults */}
      <h1 className="font-bold text-4xl text-zinc-800 tracking-tight sm:text-5xl dark:text-zinc-200">
        {t('header.title')}
      </h1>
      <p className="mt-4 text-base text-zinc-800 sm:text-lg dark:text-zinc-400">
        {t('header.subtitle')}
      </p>
    </div>
  );
};

export { BlogPageHeader as default }; // Optional default export if preferred
