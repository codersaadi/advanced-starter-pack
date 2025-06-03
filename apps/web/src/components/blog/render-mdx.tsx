import { MDXContent } from '@content-collections/mdx/react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import Callout from './Callout';
import { CodeBlock } from './codeblock'; // Assuming this is your custom code block

// Define your custom components that can be used in MDX
const mdxComponents = {
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (
      src &&
      typeof src === 'string' &&
      (src.startsWith('/') || src.startsWith('http'))
    ) {
      return (
        <div className="relative mx-auto my-4 aspect-video w-full max-w-3xl">
          {' '}
          {/* Example styling */}
          <Image
            fill
            className="rounded-md object-contain"
            src={src}
            alt={alt || ''}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 672px"
            {...props}
            width={Number.parseInt(props.width as string, 10)} // Default width if not provided
            height={Number.parseInt(props.height as string, 10)} // Default height if not provided
          />
        </div>
      );
    }
    // Fallback for images that might not be standard paths or require different handling
    // eslint-disable-next-line @next/next/no-img-element
    // biome-ignore lint/a11y/useAltText: <explanation>
    // biome-ignore lint/nursery/noImgElement: <explanation>
    return <img src={src} alt={alt} {...props} />;
  },
  a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('/')) {
      return <Link href={href} {...props} />;
    }
    if (href?.startsWith('#')) {
      // Handle anchor links within the page
      return <a href={href} {...props} />;
    }
    return (
      <a target="_blank" rel="noopener noreferrer" href={href} {...props} />
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    // Assuming CodeBlock handles extracting language and code from children
    return <CodeBlock {...props}>{children}</CodeBlock>;
  },
  Callout,
};

interface MDXContentProps {
  /**
   * The compiled MDX code string from Content Collections (document.body.code)
   */
  code: string;
}

export default function RenderMdx({ code }: MDXContentProps) {
  return <MDXContent code={code} components={mdxComponents} />;
}
