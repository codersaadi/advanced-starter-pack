import { router } from '@repo/core/libs/trpc/lambda';
import { lambdaHealth } from './health';
import { stripeRouter } from './stripe';
import { userRouter } from './user';

export const lambdaRouter = router({
  stripe: stripeRouter,
  user: userRouter,
  health: lambdaHealth,
});

export type LambdaRouter = typeof lambdaRouter;
