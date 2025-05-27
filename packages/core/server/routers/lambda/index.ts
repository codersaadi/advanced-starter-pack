import { router } from '@repo/core/libs/trpc/lambda';
import { stripeRouter } from './stripe';
import { userRouter } from './user';

export const lambdaRouter = router({
  stripe: stripeRouter,
  user: userRouter,
});

export type LambdaRouter = typeof lambdaRouter;
