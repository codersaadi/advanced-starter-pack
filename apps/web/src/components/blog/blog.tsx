import type { Blog } from 'content-collections';
import { FeaturedPostCard } from './featured-post-card';
import { PostCard } from './post-card';
export default function RenderBlog({ posts }: { posts: Blog[] }) {
  // If we have posts, feature the first one
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.length > 0 ? posts.slice(1) : [];

  return (
    <div className="mt-12">
      {/* Featured Post Section */}
      {featuredPost && (
        <div className="mb-16">
          <h2 className="mb-6 font-semibold text-xl text-zinc-200">
            Featured Article
          </h2>
          <FeaturedPostCard post={featuredPost} />
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="mb-8">
        <h2 className="mb-6 font-semibold text-xl text-zinc-200">
          Latest Articles
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {regularPosts.map((post) => (
            <PostCard post={post} key={post.title} />
          ))}
        </div>
      </div>
    </div>
  );
}
