/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @link https://trpc.io/docs/v11/router
 * @link https://trpc.io/docs/v11/procedures
 */
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

import { trpcErrorFormatter } from '../error-handling';
import type { LambdaContext } from './context';

export const trpc = initTRPC.context<LambdaContext>().create({
  /**
   * @link https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter: trpcErrorFormatter,
  /**
   * @link https://trpc.io/docs/v11/data-transformers
   */
  transformer: superjson,
});
