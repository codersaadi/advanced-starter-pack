'use client';
import type { Blog } from 'content-collections';
import { format } from 'date-fns';
import { ArrowUpRight, Calendar, Clock, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function FeaturedPostCard({ post }: { post: Blog }) {
  return (
    <div className="rounded-2xl bg-icon-dark">
      <div className="group relative">
        <Link href={`/blog/${post.slug}`}>
          <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800/70">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Image Section */}
              {post.image && (
                <div className="relative h-full min-h-[300px] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-transparent to-transparent" />
                </div>
              )}

              {/* Content Section */}
              <div className="flex flex-col justify-between p-6 md:p-8">
                {/* Categories and metadata */}
                <div>
                  {post.categories && post.categories.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 font-medium text-blue-400 text-xs ring-1 ring-blue-500/30 ring-inset"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title & Description */}
                  <h2 className="mb-3 font-bold text-2xl text-zinc-100 transition-colors duration-300 group-hover:text-blue-400 md:text-3xl">
                    {post.title}
                  </h2>
                  <p className="mb-6 line-clamp-3 text-lg text-zinc-400">
                    {post.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={post.date.toString()}>
                        {format(new Date(post.date), 'MMM d, yyyy')}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="h-4 w-4" />
                      <span>{post.readingTime?.text || '5 min read'}</span>
                    </div>
                  </div>

                  <div className="flex items-center font-medium text-blue-400">
                    <span className="mr-2">Read more</span>
                    <ArrowUpRight className="group-hover:-translate-y-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 font-medium text-xs text-zinc-400"
                      >
                        <Tag className="mr-1.5 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        </Link>
      </div>
    </div>
  );
}
