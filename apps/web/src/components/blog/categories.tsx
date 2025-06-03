'use client';
import { cn } from '@repo/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface CategoriesProps {
  categories: string[];
  activeCategory?: string;
}

export function Categories({ categories, activeCategory }: CategoriesProps) {
  const pathname = usePathname();
  const { t } = useTranslation('blog');
  return (
    <div className="space-y-4">
      {/* Compact header with count */}
      <div className="flex items-center">
        <h2 className="font-medium text-base text-zinc-900 dark:text-zinc-200">
          {}
          <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
            ({categories.length})
          </span>
        </h2>
      </div>

      {/* Categories horizontal scrollable area */}
      <div className="-mx-2 pb- scrollbar-hide relative overflow-x-auto py-2">
        <div className="flex items-center gap-2 px-2">
          <Link href={pathname} className="shrink-0">
            <div className="relative">
              <div
                className={cn(
                  'relative z-10 rounded-full px-3 py-1 text-sm transition-colors',
                  activeCategory
                    ? 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    : 'font-medium text-zinc-900 dark:text-zinc-100'
                )}
              >
                {t('categories.all')}
              </div>
              {!activeCategory && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300/80 to-blue-400/80 blur-sm dark:from-blue-500/80 dark:to-blue-600/80" />
              )}
            </div>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat}
              href={`${pathname}?category=${cat}`}
              className="shrink-0"
            >
              <div className="relative">
                <div
                  className={cn(
                    'relative z-10 rounded-full px-3 py-2 text-sm transition-colors',
                    activeCategory === cat
                      ? 'font-medium text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  )}
                >
                  {cat}
                </div>
                {activeCategory === cat && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300/80 to-blue-400/80 blur-sm dark:from-blue-500/80 dark:to-blue-600/80" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Category Info - Fixed Height Container */}
      <div className="h-12">
        <div
          key={activeCategory}
          className="flex items-center gap-2 rounded-md border border-zinc-200/50 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800/50 dark:bg-zinc-900/50"
        >
          <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
            {t('categories.viewing')}
          </span>
          <span className="font-medium text-blue-600 text-sm dark:text-blue-400">
            {activeCategory}
          </span>
        </div>
      </div>
    </div>
  );
}
