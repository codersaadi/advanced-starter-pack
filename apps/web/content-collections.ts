import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx"; // For processing MDX content
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCodeTitles from "rehype-code-titles"; // May need a Content Collections compatible way or alternative
import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
// remarkToc is tricky with compileMDX directly, often TOC is generated differently or via rehype plugins
// For rehype plugins, you pass them to compileMDX options.
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
// Your Git sync logic can remain largely the same, but it will be called
// before Content Collections runs, or as a separate pre-build step.
// Content Collections itself doesn't have a built-in "syncFiles" like Contentlayer's makeSource did.
// You'd run this script via your package.json build script.

const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: "github-dark",
  // onVisitLine and onVisitHighlightedLine might need to be adapted if the plugin structure changes
};

const BlogCollection = defineCollection({
  name: "Blog", // Matches your Contentlayer `name: 'Blog'`
  directory: "posts", // Assuming your content is in `content/blog/**/*.mdx`
  include: "**/*.mdx", // Matches `filePathPattern: '**/*.mdx'`
  // schema defines the frontmatter and how Content Collections processes it
  schema: (zod) => ({
    // zod is passed by Content Collections
    title: zod.string(),
    date: zod.coerce.date(), // <<<< CORRECTED HERE: Use z.coerce.date()
    description: zod.string(),
    image: zod.string().optional(),
    author: zod.string().default("Anonymous"),
    categories: zod.array(zod.string()).default([]),
    tags: zod.array(zod.string()).default([]),
    status: zod.enum(["draft", "published"]).default("published"),
    // `content` will hold the raw MDX string by default if using frontmatter parser
    // We will process this in `transform` using `compileMDX`
    content: zod.string(), // Add this to access the raw content string
  }),
  // `transform` is where you add computed fields and process MDX
  transform: async (document, utils) => {
    const pathParts = document._meta.directory.split("/"); // e.g., "posts/en" -> ["posts", "en"]
    const locale = pathParts.at(-1); // Assumes locale is the last part of the directory
    // biome-ignore lint/performance/useTopLevelRegex:
    const slugWithoutLocale = document._meta.fileName.replace(/\.mdx$/, ""); // e.g., "my-first-post"
    const mdxBody = await utils.cache(
      // Cache based on raw content
      {
        name: "compile-mdx", // Unique cache key part
        content: document.content, // The raw MDX string
      },
      // Function to execute if not cached or content changed
      async () =>
        compileMDX(utils, document, {
          // Pass `document` to make frontmatter available to MDX if needed
          // remarkPlugins, rehypePlugins are configured in compileMDX for @content-collections/mdx
          remarkPlugins: [
            remarkGfm /*, [remarkToc, { heading: 'Table of Contents' }] */,
          ], // remarkToc might need specific handling
          rehypePlugins: [
            rehypeSlug,
            rehypeCodeTitles,
            [rehypePrettyCode, rehypePrettyCodeOptions],
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ],
        })
    );

    // Replicate Contentlayer's _raw and _id structure for easier migration
    const _raw = {
      sourceFilePath: `${locale}/${document._meta.fileName}`,
      sourceFileName: document._meta.fileName, // e.g., my-post.mdx
      sourceFileDir: document._meta.directory, // e.g., blog
      flattenedPath: document._meta.path, // e.g., blog/my-post (path without extension)
      contentType: "mdx" as const,
    };
    const readingTimeResult = readingTime(document.content);
    return {
      ...document,
      _id: `${locale}/${slugWithoutLocale}`, // Unique ID including locale,
      _raw,
      body: {
        code: mdxBody,
        frontmatter: {},
      },
      readingTime: {
        text: readingTimeResult.text,
        minutes: readingTimeResult.minutes,
        time: readingTimeResult.time,
        words: readingTimeResult.words,
      },
      slug: slugWithoutLocale, // The slug within its language
      locale: locale, // Explicitly store the locale
      permalink: `/${locale}/blog/${slugWithoutLocale}`, // Locale-specific permalink
    };
  },
});

export default defineConfig({
  collections: [BlogCollection],
});
