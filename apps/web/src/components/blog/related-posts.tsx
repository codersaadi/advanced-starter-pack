import type { SupportedLocales } from '@repo/i18n/config';
import { translation } from '@repo/i18n/functions/translation';
import { type Blog, allBlogs as posts } from 'content-collections';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
export async function RelatedPosts({
  currentPost,
  locale,
}: {
  currentPost: Blog;
  locale: SupportedLocales;
}) {
  const { t } = await translation('blog', locale);

  const relatedPosts = posts
    .filter((post) => post.slug !== currentPost.slug) // Exclude current post
    .filter((post) => {
      const matchingCategories = post.categories?.some((cat) =>
        currentPost.categories?.includes(cat)
      );
      const matchingTags = post.tags?.some((tag) =>
        currentPost.tags?.includes(tag)
      );
      return matchingCategories || matchingTags;
    })
    .slice(0, 3); // Get top 3 related posts
  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-16 border-zinc-200 border-t pt-16 dark:border-zinc-800/50">
      <h2 className="mb-8 font-bold text-2xl text-zinc-900 dark:text-zinc-100">
        {t('sections.related_articles')}
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-lg hover:shadow-zinc-200/50 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 dark:hover:shadow-xl dark:hover:shadow-zinc-900/50"
          >
            {post.image && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/80 via-transparent to-transparent dark:from-zinc-900/80" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-600 text-xs ring-1 ring-blue-200 ring-inset dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
              {/* Title & Meta */}
              <h3 className="line-clamp-2 font-semibold text-lg text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {post.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <time className="text-zinc-500 dark:text-zinc-500">
                  {format(new Date(post.date), 'MMM d, yyyy')}
                </time>
                <ArrowUpRight className="group-hover:-translate-y-1 h-4 w-4 text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
