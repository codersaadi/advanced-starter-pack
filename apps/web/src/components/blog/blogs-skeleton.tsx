'use client';
import { Button } from '@repo/ui/components/ui/button';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
export default function BlogLoading() {
  const { t } = useTranslation('blog');
  return (
    <div className="relative dark:bg-transparent">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with breadcrumb */}
        <Link href={'/'}>
          <Button
            variant={'link'}
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            {t('breadcrumbs.home')}
          </Button>
        </Link>

        {/* Blog Header and Search Skeletons */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <Skeleton className="mb-4 h-10 w-64 sm:h-12 sm:w-96" />
            <Skeleton className="mt-2 h-5 w-full sm:w-80" />
          </div>
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>

        {/* Categories Skeleton */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2 pb-2">
            <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
            <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
          </div>
          <div className="h-12" />
        </div>

        <div className="mt-12">
          {/* Featured Post Skeleton */}
          <div className="mb-16">
            <Skeleton className="mb-6 h-6 w-48" />
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="grid gap-6 overflow-hidden rounded-2xl p-1 md:grid-cols-2">
                <Skeleton className="h-[300px] rounded-xl" />
                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <div className="mb-4 flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="mb-3 h-8 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-4/5" />
                    <Skeleton className="mb-6 h-5 w-5/6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regular Posts Grid Skeleton */}
          <div className="mb-8">
            <Skeleton className="mb-6 h-6 w-40" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex h-full flex-col rounded-xl border border-zinc-200/70 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-900/50"
                  >
                    <Skeleton className="aspect-video w-full rounded-t-xl" />
                    <div className="flex flex-grow flex-col p-6">
                      <div className="mb-3 flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="mb-2 h-6 w-full" />
                      <Skeleton className="mb-1 h-4 w-full" />
                      <Skeleton className="mb-4 h-4 w-4/5" />
                      <div className="mt-auto flex items-center justify-between border-zinc-200 border-t pt-4 dark:border-zinc-800/50">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
