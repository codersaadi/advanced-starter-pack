'use client';

import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { ArrowLeft, Calendar, ChevronRight, Clock, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
export default function BlogPostLoading() {
  const { t } = useTranslation('blog');
  return (
    <div className="relative min-h-screen dark:bg-box-dark">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <nav className="mb-8 flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/"
            className="flex items-center transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            <Home className="mr-2 h-4 w-4" />
            <span>{t('navigation.home')}</span>
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link
            href="/blog"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            {t('navigation.blog')}
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </nav>
        {/* Grid container for main content and sidebar */}
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Main Content Skeleton (Now first, will appear on the left) */}
          <div className="lg:col-span-3">
            <article className="prose dark:prose-invert prose-zinc dark:prose-zinc lg:prose-lg max-w-none">
              {/* Post header for mobile */}
              <div className="mb-8 flex lg:hidden">
                <div className="group inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <Skeleton className="h-4 w-24" />{' '}
                  {/* Example: "Back to Blog" */}
                </div>
              </div>

              {/* Featured Image */}
              <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl">
                <Skeleton className="h-full w-full" />
              </div>

              {/* Title */}
              <Skeleton className="!mt-0 !mb-6 h-12 w-4/5" />

              {/* Mobile metadata */}
              <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-zinc-600 lg:hidden dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Mobile Categories and Tags */}
              <div className="mb-12 flex flex-wrap gap-4 lg:hidden">
                {/* Mobile Categories Example */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                {/* Mobile Tags Example */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              {/* Post content */}
              <div className="mt-8 space-y-6">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="my-8 h-8 w-1/2" />{' '}
                {/* Subheading skeleton */}
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="my-12 h-40 w-full rounded-lg" />{' '}
                {/* Code block or image skeleton */}
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </article>

            {/* Related Posts Skeleton */}
            <div className="mt-16 border-zinc-200 border-t pt-8 dark:border-zinc-800/50">
              <Skeleton className="mb-8 h-8 w-48" />
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/70 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-900/50"
                    >
                      <Skeleton className="aspect-video w-full" />{' '}
                      {/* Removed rounded-t-xl as aspect-video handles it */}
                      <div className="flex flex-grow flex-col p-4">
                        <Skeleton className="mb-2 h-5 w-full" />
                        <Skeleton className="mb-4 h-4 w-3/4" />
                        <div className="mt-auto flex items-center justify-between">
                          {' '}
                          {/* Pushed to bottom */}
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>{' '}
          {/* End Main Content */}
          {/* Sidebar Skeleton (Now second, will appear on the right) */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-8 space-y-8">
              {/* Back to Blog Link (Desktop) */}
              <div>
                <Skeleton className="mb-4 h-6 w-32" />{' '}
                {/* Placeholder for "Navigate" or similar title */}
                <Link
                  href="/blog"
                  className="group inline-flex items-center text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform" />
                  <Skeleton className="h-4 w-24" /> {/* "Back to Blog" */}
                </Link>
              </div>

              {/* Article metadata */}
              <div className="border-zinc-200 border-t pt-8 dark:border-zinc-800/50">
                <Skeleton className="mb-4 h-6 w-36" /> {/* "Article Details" */}
                <div className="space-y-3">
                  <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <Skeleton className="h-4 w-32" /> {/* Date */}
                  </div>
                  <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                    <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                    <Skeleton className="h-4 w-24" /> {/* Reading time */}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="border-zinc-200 border-t pt-8 dark:border-zinc-800/50">
                <Skeleton className="mb-4 h-6 w-28" /> {/* "Categories" */}
                <div className="flex flex-col items-start gap-2">
                  {' '}
                  {/* Align start */}
                  <Skeleton className="h-8 w-32 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              </div>

              {/* Tags */}
              <div className="border-zinc-200 border-t pt-8 dark:border-zinc-800/50">
                <Skeleton className="mb-4 h-6 w-16" /> {/* "Tags" */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-16 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </aside>{' '}
          {/* End Sidebar */}
        </div>{' '}
        {/* End Grid */}
      </div>
    </div>
  );
}
