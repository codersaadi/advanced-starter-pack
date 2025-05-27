import { pino } from '@repo/core/libs/logger';
import { desktopRouter } from '@repo/core/libs/trpc/desktop';
import { createLambdaContext } from '@repo/core/libs/trpc/lambda/context';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createLambdaContext(req),

    endpoint: '/trpc/desktop',

    onError: ({ error, path, type }) => {
      pino.info(
        `Error in tRPC handler (tools) on path: ${path}, type: ${type}`
      );
      console.error(error);
    },

    req,
    router: desktopRouter,
  });

export { handler as GET, handler as POST };
