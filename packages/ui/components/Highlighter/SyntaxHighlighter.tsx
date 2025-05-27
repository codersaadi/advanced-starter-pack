'use client';

import { useHighlight } from '@repo/ui/hooks/use-highlight';
import { cn } from '@repo/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Skeleton } from '../ui/skeleton';
import type { SyntaxHighlighterProps } from './highlighter-types';

const syntaxHighlighterVariants = cva(
  'dir-ltr relative m-0 text-left', // dir-ltr for LTR rendering of code
  {
    variants: {
      variant: {
        filled: 'p-4', // Padding applied here for the filled look
        outlined: 'p-4', // Similar padding for outlined
        borderless: 'p-0',
      },
      showBackground: {
        true: 'bg-muted', // Default background, Shiki theme will override <pre>
        false: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'borderless',
      showBackground: false,
    },
  }
);

const SyntaxHighlighter = forwardRef<HTMLDivElement, SyntaxHighlighterProps>(
  (
    {
      children,
      language,
      className,
      style,
      enableTransformer = true,
      variant = 'filled', // Default variant from LobeUI
      theme: shikiTheme = 'github-dark', // Default theme, can be prop
      ...props
    },
    ref
  ) => {
    const {
      data: highlightedHtml,
      isLoading,
      error,
    } = useHighlight(children, {
      language,
      theme: shikiTheme,
      enableTransformer,
    });

    // Determine if a background should be shown based on theme and variant
    // Lobe theme logic was complex. Simplifying: if theme is not 'lobe-theme' (which we map to std themes)
    // and variant is 'filled', we might add a wrapper background.
    // However, Shiki themes typically provide their own pre background.
    // The `showBackground` CVA variant is more for the outer div if needed.
    const showOuterBackground =
      variant === 'filled' &&
      shikiTheme !== 'github-light' &&
      shikiTheme !== 'github-dark';

    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            syntaxHighlighterVariants({
              variant,
              showBackground: showOuterBackground,
            }),
            'min-h-[60px]', // Placeholder height
            className
          )}
          style={style}
          {...props}
        >
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    if (error || !highlightedHtml) {
      // Fallback for error or no data (already handled by useHighlight's fallback)
      // Render plain text in a <pre><code> block if useHighlight doesn't provide HTML
      const fallbackHtml = `<pre class="shiki shiki-fallback"><code>${children.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</code></pre>`;
      return (
        <div
          ref={ref}
          className={cn(
            syntaxHighlighterVariants({
              variant,
              showBackground: showOuterBackground,
            }),
            className
          )}
          style={style}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sensitive if not used carefully , as we are using it statically ensuring otherwise it will be sanitized,validated properly
          dangerouslySetInnerHTML={{ __html: highlightedHtml || fallbackHtml }}
          {...props}
        />
      );
    }

    // Shiki's output includes <pre class="shiki themed-name">.
    // Our Tailwind styles in shiki-styles.css will target .shiki and its children.
    // The variant prop here controls padding on the *outer* div.
    return (
      <div
        ref={ref}
        className={cn(
          syntaxHighlighterVariants({
            variant,
            showBackground: showOuterBackground,
          }),
          className
        )}
        style={style}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sensitive if not used carefully , as we are using it statically ensuring otherwise it will be sanitized,validated properly
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        dir="ltr" // Ensure LTR for code blocks
        {...props}
      />
    );
  }
);

SyntaxHighlighter.displayName = 'SyntaxHighlighter';

export default SyntaxHighlighter;
