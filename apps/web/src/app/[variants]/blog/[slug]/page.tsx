import { RelatedPosts } from '@/components/blog/related-posts';
import RenderMdx from '@/components/blog/render-mdx';
import { getAllSortedPosts, getPost } from '@/lib/content-collection';
import { format } from 'date-fns';
import './prose.css';
import { translation } from '@repo/i18n/functions/translation';
import { RouteVariants } from '@repo/shared/utils/route-variants';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Home,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PromiseParams<T> {
  params: Promise<T>;
}

export const generateStaticParams = async ({
  params,
}: {
  params: Promise<{ variants: string }>;
}) => {
  const locale = await RouteVariants.getLocale({ params });
  const allPosts = await getAllSortedPosts();
  return allPosts
    .filter((p) => p.status === 'published' && p.locale === locale) // Assuming 'Post' type has 'status'
    .map((post) => ({
      slug: post.slug, // The slug within its language
      locale: post.locale,
    }));
};

export const generateMetadata = async ({
  params: paramsPromise,
}: PromiseParams<{ slug: string; variants: string }>) => {
  const params = await paramsPromise;
  const locale = await RouteVariants.getLocale({ params: paramsPromise });
  const allPosts = await getAllSortedPosts(locale);

  const post = allPosts.find(
    (post) => post.slug === params.slug && post.locale === locale
  );
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
  return { title: post.title };
};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string; variants: string }>;
}) {
  const resolvedParams = await params;
  const locale = await RouteVariants.getLocale({ params });
  const { t } = await translation('blog', locale);

  const post = await getPost(locale, resolvedParams.slug);
  if (!post) {
    return <>{t('status.not_found')}</>;
  }
  return (
    <div className="relative min-h-screen dark:bg-box-dark">
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center overflow-x-auto whitespace-nowrap pb-2 text-xs text-zinc-600 sm:mb-8 sm:text-sm dark:text-zinc-400">
          <Link
            href="/"
            className="flex items-center transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            <Home className="mr-1 h-3 w-3 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
            <span>{t('breadcrumbs.home')}</span>
          </Link>
          <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0 sm:mx-2 sm:h-4 sm:w-4" />
          <Link
            href="/blog"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            {t('breadcrumbs.blog')}
          </Link>
          <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0 sm:mx-2 sm:h-4 sm:w-4" />
          <span className="max-w-[150px] truncate text-zinc-900 sm:max-w-[200px] dark:text-zinc-200">
            {post.title}
          </span>
        </nav>

        <div className="grid gap-6 sm:gap-12 lg:grid-cols-4">
          {/* Main Content */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <article className="prose dark:prose-invert prose-zinc dark:prose-zinc sm:prose-base lg:prose-lg max-w-none">
              {/* Post header for mobile */}
              <div className="mb-4 flex sm:mb-8 lg:hidden">
                <Link
                  href="/blog"
                  className="group inline-flex items-center text-xs text-zinc-600 transition-colors hover:text-blue-600 sm:text-sm dark:text-zinc-400 dark:hover:text-blue-400"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 mr-1 h-3 w-3 transition-transform sm:mr-2 sm:h-4 sm:w-4" />
                  {t('post.back_to_blog')}
                </Link>
              </div>

              {/* Featured Image */}
              {!!post.image && post.image !== '' && (
                <div className="relative mb-6 w-full overflow-hidden rounded-lg sm:mb-8 sm:rounded-xl">
                  {/* Use proper responsive image with appropriate sizing */}
                  <div className="aspect-[16/9] w-full">
                    <Image
                      src={post.image}
                      alt={'Blog post featured image'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
                      priority
                      className="rounded-lg object-cover sm:rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <h1 className="!mt-0 !mb-4 sm:!mb-6 font-bold text-2xl text-zinc-900 tracking-tight sm:text-3xl md:text-4xl lg:text-5xl dark:text-zinc-100">
                {post.title}
              </h1>

              {/* Mobile metadata */}
              <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-zinc-600 sm:mb-8 sm:gap-4 sm:text-sm lg:hidden dark:text-zinc-400">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                  <time dateTime={post.date.toDateString()}>
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                  </time>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                  <span>{post.readingTime?.text || '5 min read'}</span>
                </div>
              </div>

              {/* Mobile Categories and Tags */}
              <div className="mb-8 flex flex-wrap gap-3 sm:mb-12 sm:gap-4 lg:hidden">
                {post.categories && post.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <Link
                        key={category}
                        href={`/blog?category=${category}`}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-600 text-xs ring-1 ring-blue-200 ring-inset sm:px-3 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 font-medium text-xs text-zinc-600 sm:px-3 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        <Tag className="mr-1 h-2.5 w-2.5 flex-shrink-0 sm:h-3 sm:w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post content */}
              <div className="mt-6 max-w-sm sm:mt-8 sm:max-w-md md:max-w-lg lg:max-w-4xl">
                <RenderMdx code={post.body.code} />
              </div>
            </article>

            {/* Related Posts */}
            <RelatedPosts locale={locale} currentPost={post} />
          </div>

          {/* Sidebar */}
          <aside className="order-1 hidden lg:order-2 lg:col-span-1 lg:block">
            <div className="sticky top-8 space-y-6 sm:space-y-8">
              {/* Table of Contents could go here */}
              <div>
                <h3 className="mb-4 font-medium text-lg text-zinc-900 dark:text-zinc-200">
                  {t('post.back_to_blog')}
                </h3>
                <Link
                  href="/blog"
                  className="group flex items-center text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform" />
                  {t('navigation.view_all_articles')}
                </Link>
              </div>

              {/* Article metadata */}
              <div className="border-zinc-200 border-t pt-6 sm:pt-8 dark:border-zinc-800/50">
                <h3 className="mb-4 font-medium text-lg text-zinc-900 dark:text-zinc-200">
                  {t('sections.article_details')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <time dateTime={post.date.toDateString()}>
                      {format(new Date(post.date), 'MMMM d, yyyy')}
                    </time>
                  </div>
                  <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                    <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{post.readingTime?.text || '5 min read'}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="border-zinc-200 border-t pt-6 sm:pt-8 dark:border-zinc-800/50">
                  <h3 className="mb-4 font-medium text-lg text-zinc-900 dark:text-zinc-200">
                    {t('categories.title')}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {post.categories.map((category) => (
                      <Link
                        key={category}
                        href={`/blog?category=${category}`}
                        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-600 text-sm ring-1 ring-blue-200 ring-inset transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20 dark:hover:bg-blue-500/20"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="border-zinc-200 border-t pt-6 sm:pt-8 dark:border-zinc-800/50">
                  <h3 className="mb-4 font-medium text-lg text-zinc-900 dark:text-zinc-200">
                    {t('metadata.tags')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 font-medium text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        <Tag className="mr-1.5 h-3 w-3 flex-shrink-0" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
