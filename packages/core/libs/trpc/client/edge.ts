"use server";
import type { EdgeRouter } from "@repo/core/server/routers/edge";
import { withBasePath } from "@repo/shared/utils/base-path";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { transformer } from "../transformer";
export const edgeClient = createTRPCClient<EdgeRouter>({
  links: [
    // Logger link for debugging tRPC requests and responses.
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" || // Enable in development mode.
        (opts.direction === "down" && opts.result instanceof Error), // Log errors in responses.
    }),
    httpBatchLink({
      maxURLLength: 2083,
      transformer: transformer,
      url: withBasePath("/trpc/edge"),
    }),
  ],
});
