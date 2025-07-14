import BlogPageHeader from '@/components/blog/blog-page-header';
import { Categories } from '@/components/blog/categories';
import { FeaturedPostCard } from '@/components/blog/featured-post-card';
import { PostCard } from '@/components/blog/post-card';
import { Search } from '@/components/blog/search';
import {
  getAllFilteredPosts,
  getAllUniqueCategories,
} from '@/lib/content-collection';
import { translation } from '@repo/i18n/next';
import { RouteVariants } from '@repo/shared/utils/route-variants';
import { Button } from '@repo/ui/components/ui/button';
import { allBlogs } from 'content-collections';
import Link from 'next/link';

export default async function BlogPage({
  searchParams,
  params,
}: {
  params: Promise<{ variants: string }>;
  // nextjs15 requires await on searchparams and params
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams.category
    ? decodeURIComponent(resolvedParams?.category)
    : undefined;
  const locale = await RouteVariants.getLocale({
    params,
  });
  console.log('BlogPage locale', locale);
  // Get all unique categories

  const categories = await getAllUniqueCategories(locale);
  const activeCategory = selectedCategory
    ? // biome-ignore lint/nursery/noNestedTernary: <explanation>
      categories.includes(selectedCategory)
      ? resolvedParams.category
      : undefined
    : undefined;
  const posts = await getAllFilteredPosts({
    category: selectedCategory,
    locale,
  });
  // If we have posts, feature the first one
  const featuredPost = posts?.length > 0 ? posts[0] : null;
  const regularPosts =
    posts?.length > 0 ? (selectedCategory ? posts : posts.slice(1)) : [];
  const { t } = await translation('blog', locale);
  return (
    <div className="relative bg-white dark:bg-transparent">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <Link href={'/'}>
          <Button
            variant={'link'}
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            {t('navigation.home')}
          </Button>
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <BlogPageHeader locale={locale} />
          <Search posts={allBlogs} />
        </div>

        {/* Categories */}
        <div className="mt-8">
          <Categories activeCategory={activeCategory} categories={categories} />
        </div>

        <div className="mt-12">
          {/* Featured Post Section */}
          {!activeCategory && featuredPost && (
            <div className="mb-16">
              <h2 className="mb-6 font-semibold text-xl text-zinc-900 dark:text-zinc-200">
                {t('sections.featured_article')}
              </h2>
              <FeaturedPostCard post={featuredPost} />
            </div>
          )}

          {/* Regular Posts Grid */}
          <div className="mb-8">
            <h2 className="mb-6 font-semibold text-xl text-zinc-900 dark:text-zinc-200">
              {t('sections.latest_articles')}
            </h2>
            <div className="grid min-h-96 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post) => (
                <PostCard post={post} key={post._id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
