'use server';
import type { EdgeRouter } from '@repo/core/server/routers/edge';
import { withBasePath } from '@repo/shared/utils/base-path';
import { transformer } from '@repo/shared/utils/transformer';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
export const edgeClient = createTRPCClient<EdgeRouter>({
  links: [
    // Logger link for debugging tRPC requests and responses.
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' || // Enable in development mode.
        (opts.direction === 'down' && opts.result instanceof Error), // Log errors in responses.
    }),
    httpBatchLink({
      maxURLLength: 2083,
      transformer: transformer,
      url: withBasePath('/trpc/edge'),
    }),
  ],
});
