import { createTRPCRouter } from '@repo/api/libs/trpc/init';
import { stripeRouter } from './routers/stripe-router';
export const edgeRouter = createTRPCRouter({
  stripe: stripeRouter,
});
