import type { ReactNode, Ref } from 'react';
import type React from 'react';
import type { BuiltinTheme } from 'shiki';
import type { Language } from './highlighter-consts'; // Use your Language type

export interface SyntaxHighlighterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: string;
  language: Language | (string & {}); // Allow string for flexibility, but prefer Language
  theme?: BuiltinTheme | 'github-light' | 'github-dark'; // Simplified theme options for now
  enableTransformer?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
  ref?: Ref<HTMLDivElement>;
}

export interface HighlighterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: string; // The code content
  language: Language | (string & {});
  theme?: BuiltinTheme | 'github-light' | 'github-dark';
  copyable?: boolean;
  showLanguage?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless'; // Controls padding and background
  shadow?: boolean;
  wrap?: boolean; // Whether to wrap long lines
  fullFeatured?: boolean; // Enables header with controls
  fileName?: string;
  icon?: ReactNode; // Icon for the header (e.g., file type icon)
  allowChangeLanguage?: boolean;
  defaultExpand?: boolean; // For fullFeatured collapsible content
  actionsRender?: (props: {
    actionIconSize: 'sm' | 'default' | 'lg'; // Map to button sizes
    content: string;
    language: string;
    originalNode: ReactNode;
  }) => ReactNode;
  bodyRender?: (props: {
    content: string;
    language: string;
    originalNode: ReactNode;
  }) => ReactNode;
  enableTransformer?: boolean; // Pass down to SyntaxHighlighter
}
