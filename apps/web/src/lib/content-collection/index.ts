import { FALLBACK_LNG, type SupportedLocales } from '@repo/i18n/config';
import { type Blog, allBlogs } from 'content-collections'; // Adjust import path

// Sort all posts once
const sortedPosts: Blog[] = [...allBlogs].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export const getAllSortedPosts = async (
  locale: SupportedLocales = FALLBACK_LNG
): Promise<Blog[]> => {
  return sortedPosts.filter(
    (post) => post.status === 'published' && post.locale === locale
  );
};

export const getAllUniqueCategories = async (
  locale: SupportedLocales = FALLBACK_LNG
): Promise<string[]> => {
  const categories = new Set<string>();
  const publishedPosts = sortedPosts.filter(
    (post) => post.status === 'published' && post.locale === locale
  );
  for (const post of publishedPosts) {
    if (post.categories) {
      for (const cat of post.categories) {
        categories.add(cat);
      }
    }
  }
  return Array.from(categories).sort();
};

export const getAllFilteredPosts = async (params: {
  category?: string;
  locale: SupportedLocales;
}): Promise<Blog[]> => {
  const allPublished = await getAllSortedPosts(params.locale || FALLBACK_LNG);
  if (!params.category || params.category.toLowerCase() === 'all') {
    return allPublished;
  }
  return allPublished.filter((post) =>
    post.categories?.some(
      (cat) => cat.toLowerCase() === params.category?.toLowerCase()
    )
  );
};

export const getPost = async (locale: SupportedLocales, slug: string) => {
  const posts = await getAllSortedPosts(locale ?? FALLBACK_LNG);
  return posts.find((post) => post.slug === slug);
};
