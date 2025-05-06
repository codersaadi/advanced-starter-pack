import { createTRPCRouter } from '@repo/api/libs/trpc/init';

// Deployed to /trpc/lambda/**
export const lambdaRouter = createTRPCRouter({
  // add lamda routes , also add their names in consumer , like we have in nextjs trpc lib
});
export default lambdaRouter;
