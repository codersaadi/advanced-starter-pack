'use client';
import { Check, Copy } from 'lucide-react';
import { type ReactNode, useState } from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  filename?: string;
}
import React from 'react';

export function CodeBlock({ children, className, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const code = getCodeFromChildren(children);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeFromChildren = (children: ReactNode): string => {
    let code = '';
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') {
        code += child;
      } else if (
        React.isValidElement(child) &&
        typeof child.props === 'object' &&
        child.props &&
        // biome-ignore lint/correctness/noUnsafeOptionalChaining:
        'children' in child?.props &&
        child?.props?.children
      ) {
        code += getCodeFromChildren(child.props?.children as ReactNode);
      }
    });
    return code;
  };

  return (
    <div className="group relative rounded-lg bg-zinc-900 text-white shadow-md transition-all hover:shadow-lg">
      {filename && (
        <div className="-mt-8 absolute top-0 right-0 left-0 rounded-t-lg bg-zinc-800/80 px-4 py-2 font-mono text-xs text-zinc-400">
          {filename}
        </div>
      )}
      <pre dir="ltr" className={`${className} overflow-x-auto p-4`}>
        <div className="absolute top-4 right-4 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-400" />
            )}
          </button>
        </div>
        {children}
      </pre>
    </div>
  );
}
