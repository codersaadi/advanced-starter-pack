import { transformer } from "@repo/core/libs/trpc/transformer";
import type { LambdaRouter } from "@repo/core/server/routers/lambda";
import {
  type HTTPBatchLinkOptions,
  createTRPCClient,
  httpBatchLink,
} from "@trpc/client";
export const shared = {
  maxURLLength: 2083,
  transformer: transformer,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
} satisfies Partial<HTTPBatchLinkOptions<any>>;
export const trpcLinks = [
  httpBatchLink({
    ...shared,
    url: `${process.env.APP_URL}/trpc/lambda`,
  }),
];

export const lambdaClient = createTRPCClient<LambdaRouter>({
  links: trpcLinks,
});
