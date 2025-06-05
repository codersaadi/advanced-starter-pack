import { publicProcedure, router } from '@repo/core/libs/trpc/edge';
import { appStatusRouter } from './appStatus';
import { configRouter } from './config';
import { uploadRouter } from './upload';

export const edgeRouter = router({
  appStatus: appStatusRouter,
  config: configRouter,
  healthcheck: publicProcedure.query(() => 'Alive and Healthy'),
  upload: uploadRouter,
});

export type EdgeRouter = typeof edgeRouter;
