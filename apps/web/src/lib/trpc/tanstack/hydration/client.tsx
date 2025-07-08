import {
  HydrationBoundary as ReactQueryHydrationBoundary,
  dehydrate,
} from '@tanstack/react-query';
import type React from 'react';
import { getQueryClient } from './server';
// https://trpc.io/docs/client/tanstack-react-query/server-components
export function HydrateClient(props: { children: React.ReactNode }) {
  const { children } = props;
  const queryClient = getQueryClient();
  return (
    <ReactQueryHydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </ReactQueryHydrationBoundary>
  );
}
