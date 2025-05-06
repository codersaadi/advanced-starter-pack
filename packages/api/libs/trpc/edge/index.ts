import { createTRPCRouter } from '@repo/api/libs/trpc/init';
import { stripeRouter } from '@repo/api/server/edge/routers/stripe-router';

// Deployed to /trpc/**
export const edgeRouter = createTRPCRouter({
  stripe: stripeRouter,
});
