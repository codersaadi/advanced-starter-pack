import { publicProcedure, router } from "@repo/core/libs/trpc/lambda";

export const lambdaHealth = router({
  check: publicProcedure.query(() => "lambda is live! Status ok"),
});
