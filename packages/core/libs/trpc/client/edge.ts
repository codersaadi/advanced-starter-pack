import type { EdgeRouter } from '@repo/core/server/routers/edge';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { shared } from './lambda';
export const trpcLinks = [
  httpBatchLink({
    ...shared,
    url: `${process.env.NEXT_PUBLIC_HOST}/trpc/edge`,
  }),
];

export const edgeClient = createTRPCClient<EdgeRouter>({
  links: trpcLinks,
});
