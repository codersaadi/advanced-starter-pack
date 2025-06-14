'use client';

import { useDebounce } from '@repo/ui/hooks/use-debounce';
import type { Blog } from 'content-collections';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Search as SearchIcon, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface SearchProps {
  posts: Blog[];
}

export function Search({ posts }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Blog[]>([]);
  const { t } = useTranslation('blog');
  const searchPosts = useCallback(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const searchResults = posts.filter((post) => {
      const searchContent = `
        ${post.title} 
        ${post.description} 
        ${post.categories?.join(' ')} 
        ${post.tags?.join(' ')}
      `.toLowerCase();

      return searchContent.includes(debouncedQuery.toLowerCase());
    });

    setResults(searchResults);
  }, [debouncedQuery, posts]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    searchPosts();
  }, [debouncedQuery, searchPosts]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Search Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-icon-dark hover:text-zinc-100"
      >
        <SearchIcon className="h-4 w-4" />
        <span>{t('search.placeholder')}</span>
        <kbd className="hidden rounded bg-zinc-700 px-2 py-0.5 font-light text-xs text-zinc-400 sm:inline-block">
          {t('search.shortcut')}
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="relative mx-auto mt-20 max-w-xl">
            <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-zinc-800">
              {/* Search Input */}
              <div className="flex items-center border-zinc-800 border-b px-4">
                <SearchIcon className="h-5 w-5 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="flex-1 bg-transparent px-4 py-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="rounded p-1 hover:bg-zinc-800"
                  >
                    <X className="h-4 w-4 text-zinc-500" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-zinc-800/50"
                      >
                        {post.image && (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              unoptimized
                              src={post.image}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <h3 className="truncate font-medium text-sm text-zinc-100 group-hover:text-blue-400">
                            {post.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.date), 'MMM d, yyyy')}
                            </span>
                            {post.categories?.[0] && (
                              <span className="rounded-full bg-zinc-800 px-2 py-0.5">
                                {post.categories[0]}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
                      </Link>
                    ))}
                  </div>
                  // biome-ignore lint/nursery/noNestedTernary: <explanation>
                ) : query ? (
                  <div className="p-6 text-center text-sm text-zinc-500">
                    {t('search.no_results', { query })}
                  </div>
                ) : null}
              </div>

              {/* Search Tips */}
              <div className="border-zinc-800 border-t p-4">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div>
                    <span className="font-medium text-zinc-400">
                      {t('search.tip_label')}:
                    </span>{' '}
                    {t('search.tip_text')}
                  </div>
                  <kbd className="rounded bg-zinc-800 px-2 py-0.5">
                    {t('search.close_shortcut')}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
