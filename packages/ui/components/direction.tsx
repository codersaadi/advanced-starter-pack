import { DirectionProvider as RadixDirection } from '@radix-ui/react-direction';

import type { ReactNode } from 'react';

export function DirectionProvider({
  children,
  direction = 'ltr',
}: {
  children: ReactNode;
  direction?: 'ltr' | 'rtl';
}) {
  return <RadixDirection dir={direction}>{children}</RadixDirection>;
}
