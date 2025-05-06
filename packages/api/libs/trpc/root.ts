import { edgeRouter } from './edge';

// Then, a custom link is used to generate the correct URL for the request
// mergeRouter is unstable , we may use separate client for lamda router , and others
// export const appRouter = mergeRouters(edgeRouter, lambdaRouter);
export const appRouter = edgeRouter;
export type AppRouter = typeof appRouter;
