'use client';

import { TRPCProvider } from '@/lib/trpc/tanstack';
import {
  lambdaBrowserClient,
  makeQueryClient,
} from '@repo/core/libs/trpc/client/browser-client';
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
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() => lambdaBrowserClient);
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
};

export default QueryProvider;
