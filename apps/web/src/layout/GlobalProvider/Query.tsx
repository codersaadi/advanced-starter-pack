'use client';

import {
  lambdaQuery,
  lambdaQueryClient,
} from '@repo/core/libs/trpc/client/lamda';
import { makeQueryClient } from '@repo/shared/lib/tanstack';
import {
  type QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';

export let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <lambdaQuery.Provider client={lambdaQueryClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </lambdaQuery.Provider>
  );
};

export default QueryProvider;
