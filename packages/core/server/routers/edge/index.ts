import { publicProcedure, router } from '@repo/core/libs/trpc/edge';
import { appStatusRouter } from './appStatus';
import { configRouter } from './config';
import { uploadRouter } from './upload';

/**
 * The main tRPC router for edge functions.
 * This router combines all the other edge routers.
 */
export const edgeRouter = router({
  // Router for application status checks
  appStatus: appStatusRouter,
  // Router for configuration-related endpoints
  config: configRouter,
  // A public endpoint for health checks
  healthcheck: publicProcedure.query(() => 'Alive and Healthy'),
  // Router for file upload functionality
  upload: uploadRouter,
});

// Export the type of the edge router for type-safe client-side usage
export type EdgeRouter = typeof edgeRouter;
