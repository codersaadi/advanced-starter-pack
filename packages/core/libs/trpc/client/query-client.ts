import type { LambdaRouter } from "@repo/core/server/routers/lambda";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { shared } from "./lambda";

export { makeQueryClient } from "@repo/shared/lib/tanstack";

export const lambdaBrowserClient = createTRPCClient<LambdaRouter>({
  links: [
    httpBatchLink({
      ...shared,
      url: "/trpc/lambda",
    }),
  ],
});
