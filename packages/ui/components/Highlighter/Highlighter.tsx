'use client';

import { cn } from '@repo/ui/lib/utils';
import { cva } from 'class-variance-authority';
import React from 'react';
import CopyButton from '../CopyButton';
import Tag from '../Tag';
import SyntaxHighlighter from './SyntaxHighlighter';
import HighlighterFullFeatured from './SyntaxHighlighterFeatured';
import type { HighlighterProps } from './highlighter-types';

const highlighterVariants = cva('group relative overflow-hidden rounded-md', {
  variants: {
    variant: {
      filled: 'bg-muted', // Applied to the root for simple highlighter
      outlined: 'border border-border',
      borderless: '',
    },
    shadow: {
      true: 'shadow-lg',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'filled',
  },
});

export const Highlighter = React.memo<HighlighterProps>(
  ({
    children, // This is the code string
    language = 'markdown',
    theme = 'github-dark', // Default theme
    className,
    copyable = true,
    showLanguage = true,
    variant = 'filled',
    shadow = false,
    wrap = false,
    fullFeatured = false,
    actionsRender,
    bodyRender,
    enableTransformer = true, // Pass down to SyntaxHighlighter
    // Props for FullFeatured variant
    fileName,
    icon,
    allowChangeLanguage,
    defaultExpand,
    ...rest
  }) => {
    const trimmedChildren = children.trim();

    const syntaxHighlighterNode = (
      <SyntaxHighlighter
        language={language}
        theme={theme}
        variant={fullFeatured ? 'borderless' : variant} // In fullFeatured, SyntaxHighlighter itself is borderless
        enableTransformer={enableTransformer}
        className={cn(
          wrap ? 'code-wrap whitespace-pre-wrap' : 'whitespace-pre',
          'text-sm'
        )} // Control wrapping here for simple version
      >
        {trimmedChildren}
      </SyntaxHighlighter>
    );

    const body = bodyRender
      ? bodyRender({
          content: trimmedChildren,
          language,
          originalNode: syntaxHighlighterNode,
        })
      : syntaxHighlighterNode;

    if (fullFeatured) {
      return (
        <HighlighterFullFeatured
          content={trimmedChildren}
          language={language}
          theme={theme}
          showLanguage={showLanguage}
          className={className}
          copyable={copyable}
          variant={variant}
          shadow={shadow}
          wrap={wrap} // Pass wrap to FullFeatured
          fileName={fileName}
          icon={icon}
          allowChangeLanguage={allowChangeLanguage}
          defaultExpand={defaultExpand}
          actionsRender={actionsRender}
          {...rest} // Pass other div props
        >
          {body}{' '}
          {/* The body here is the SyntaxHighlighter (possibly wrapped by bodyRender) */}
        </HighlighterFullFeatured>
      );
    }

    // Simple Highlighter
    const copyButtonNode = copyable && (
      <CopyButton
        content={trimmedChildren}
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
      />
    );

    const finalActions = actionsRender
      ? actionsRender({
          actionIconSize: 'sm',
          content: trimmedChildren,
          language,
          originalNode: copyButtonNode,
        })
      : copyButtonNode;

    return (
      <div
        className={cn(highlighterVariants({ variant, shadow }), className)}
        data-code-type="highlighter-simple"
        {...rest}
      >
        {finalActions}
        {showLanguage && language && (
          <Tag className="absolute right-2 bottom-2 z-10 text-xs opacity-0 transition-opacity group-hover:opacity-100">
            {language.toLowerCase()}
          </Tag>
        )}
        {/* Padding for the content is handled by SyntaxHighlighter's variant if not borderless */}
        {/* biome-ignore lint/suspicious/noExplicitAny:  */}
        {React.cloneElement(body as React.ReactElement<any>, {
          variant: variant === 'borderless' ? 'borderless' : 'filled',
        })}
      </div>
    );
  }
);

Highlighter.displayName = 'Highlighter';
export default Highlighter;
