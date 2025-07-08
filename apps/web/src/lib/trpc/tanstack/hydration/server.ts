import "server-only";
import { cache } from "react";
import { makeQueryClient } from "../query-client";

export const getQueryClient = cache(makeQueryClient);
import { createLambdaContext } from "@repo/core/libs/trpc/lambda/context";
import { lambdaRouter } from "@repo/core/server/routers/lambda";
import {
  type TRPCQueryOptions,
  createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import { headers } from "next/headers";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    queryClient.prefetchQuery(queryOptions);
  }
}

// server-caller explicit
export const createTRPCServerCaller = cache(async () => {
  const headersList = await headers();
  return createTRPCOptionsProxy({
    ctx: await createLambdaContext(headersList),
    router: lambdaRouter,
    queryClient: getQueryClient,
  });
});

// createCaller (The Server Caller): This is the modern, preferred way for server-side code to interact with tRPC. It does not make a network request. It directly invokes your router's procedure functions in memory. It's faster, more efficient, and avoids network overhead.
