import { pino } from "@repo/core/libs/logger";
import { createLambdaContext } from "@repo/core/libs/trpc/lambda/context";
import { lambdaRouter } from "@repo/core/server/routers/lambda";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createLambdaContext(req),

    endpoint: "/trpc/lambda",

    onError: ({ error, path, type }) => {
      pino.info(
        `Error in tRPC handler (lambda) on path: ${path}, type: ${type}`
      );
      console.error(error);
    },

    req,
    router: lambdaRouter,
  });

export { handler as GET, handler as POST };
