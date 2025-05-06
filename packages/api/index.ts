import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from './libs/trpc/root';
export { createTRPCContext } from '@repo/api/libs/trpc/context';
export type { AppRouter } from './libs/trpc/root';
export { appRouter } from './libs/trpc/root';
/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
