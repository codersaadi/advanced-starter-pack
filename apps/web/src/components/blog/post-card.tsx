'use client';
import { cn } from '@repo/ui/lib/utils';
import type { Blog } from 'content-collections';
import { formatDate } from 'date-fns';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function PostCard({ post }: { post: Blog }) {
  const { t } = useTranslation('blog');
  return (
    <div className="group relative h-full">
      <Link href={`/blog/${post.slug}`}>
        <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/70 bg-white/70 transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 dark:hover:shadow-2xl dark:hover:shadow-zinc-900/50">
          {/* Image Container */}
          {post.image && (
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-zinc-900/90 dark:via-zinc-900/30 dark:to-transparent" />
            </div>
          )}

          {/* Content Container */}
          <div className="flex flex-grow flex-col p-6">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Title & Description */}
            <h3 className="mb-2 font-semibold text-xl text-zinc-900 transition-colors duration-300 group-hover:text-blue-700 dark:text-zinc-100 dark:group-hover:text-blue-400">
              {post.title}
            </h3>
            <p
              className={cn(
                'mt-2 mb-4 text-zinc-600 dark:text-zinc-400',
                post.image && 'line-clamp-2'
              )}
            >
              {post.description}
            </p>

            {/* Footer with metadata */}
            <div className="mt-auto flex items-center justify-between border-zinc-200 border-t pt-4 dark:border-zinc-800/50">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={post.date.toString()}>
                    {formatDate(new Date(post.date), 'MMM d, yyyy')}
                  </time>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {post.readingTime?.text || t('post.reading_time_fallback')}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="group-hover:-translate-y-1 h-5 w-5 text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
