'use client';

import CopyButton from '@repo/ui/components/CopyButton';
import { Button } from '@repo/ui/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/ui/collapsible'; // Shadcn Collapsible
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'; // Shadcn Select
import { cn } from '@repo/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import React, { useState, useMemo, type ReactNode } from 'react';
import { type Language, languages as allLanguages } from './highlighter-consts'; // Assuming you export Language type
import type { HighlighterProps } from './highlighter-types';

interface HighlighterFullFeaturedProps
  extends Omit<HighlighterProps, 'children' | 'fullFeatured'> {
  content: string; // Renamed from children for clarity as it's the code string
  children: ReactNode; // This will be the <SyntaxHighlighter /> component
}

const highlighterRootVariants = cva('relative overflow-hidden rounded-md', {
  variants: {
    variant: {
      filled: 'bg-muted', // Background for the entire component
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
    shadow: false,
  },
});

const headerVariants = cva('flex items-center justify-between p-2 text-sm', {
  variants: {
    variant: {
      filled: 'bg-muted-foreground/10', // Slightly different header background
      outlined: 'border-border border-b',
      borderless: '',
    },
  },
  defaultVariants: {
    variant: 'filled',
  },
});

export const HighlighterFullFeatured = React.memo<HighlighterFullFeaturedProps>(
  ({
    content,
    language: initialLanguage,
    theme,
    showLanguage = true,
    className,
    style,
    allowChangeLanguage = false,
    fileName,
    icon = <FileText className="h-4 w-4 text-muted-foreground" />,
    actionsRender,
    copyable = true,
    variant = 'filled',
    shadow = false,
    wrap = false, // Pass wrap to SyntaxHighlighter via children
    defaultExpand = true,
    children, // This is the rendered SyntaxHighlighter
    ...rest
  }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpand);
    const [currentLanguage, setCurrentLanguage] = useState<Language | string>(
      initialLanguage
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies:
    const languageOptions = useMemo(
      () =>
        allLanguages.map((lang) => ({
          label: lang,
          value: lang.toLowerCase(),
        })),
      [allLanguages]
    );

    const effectiveFileName = fileName || (showLanguage ? currentLanguage : '');

    const copyButtonNode = copyable && (
      <CopyButton content={content} size="sm" variant="ghost" />
    );

    const finalActions = actionsRender
      ? actionsRender({
          actionIconSize: 'sm',
          content,
          language: currentLanguage as string,
          originalNode: copyButtonNode,
        })
      : copyButtonNode;

    return (
      <div
        className={cn(highlighterRootVariants({ variant, shadow }), className)}
        style={style}
        data-code-type="highlighter-full-featured"
        {...rest}
      >
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="w-full"
        >
          <div className={cn(headerVariants({ variant }))}>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </Button>
              </CollapsibleTrigger>
              {icon && !fileName && !allowChangeLanguage && (
                <span className="text-muted-foreground">{icon}</span>
              )}
              {allowChangeLanguage && !fileName && showLanguage ? (
                <Select
                  value={currentLanguage.toLowerCase()}
                  onValueChange={(val) => setCurrentLanguage(val as Language)}
                >
                  <SelectTrigger className="h-7 w-[120px] border-none bg-transparent text-xs focus:ring-0">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                effectiveFileName && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {icon && fileName && icon}
                    <span className="max-w-[150px] truncate">
                      {effectiveFileName}
                    </span>
                  </div>
                )
              )}
            </div>
            <div className="flex items-center gap-1">{finalActions}</div>
          </div>
          <CollapsibleContent
            className={cn(
              'overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
              wrap ? 'whitespace-pre-wrap' : 'whitespace-pre' // control text wrapping on the content
            )}
          >
            {/* Pass down currentLanguage and theme to the actual SyntaxHighlighter child */}
            {React.isValidElement(children)
              ? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                React.cloneElement(children as React.ReactElement<any>, {
                  language: currentLanguage,
                  theme: theme,
                  className: wrap
                    ? 'whitespace-pre-wrap code-wrap'
                    : 'whitespace-pre',
                })
              : children}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);
HighlighterFullFeatured.displayName = 'HighlighterFullFeatured';
export default HighlighterFullFeatured;
