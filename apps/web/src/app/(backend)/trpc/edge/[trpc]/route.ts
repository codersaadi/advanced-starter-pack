import { createEdgeContext } from '@repo/core/libs/trpc/edge/context';
import { edgeRouter } from '@repo/core/server/routers/edge';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createEdgeContext(req),

    endpoint: '/trpc/edge',

    onError: ({ error, path }) => {
      console.info(`Error in tRPC handler (edge) on path: ${path}`);
      console.error(error);
    },

    req,
    router: edgeRouter,
  });

export { handler as GET, handler as POST };
