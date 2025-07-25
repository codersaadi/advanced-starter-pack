import { baseOptions } from '@/app/layout.config';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '../source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source?.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
