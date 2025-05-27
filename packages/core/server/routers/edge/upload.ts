import { z } from 'zod';

import { passwordProcedure, router } from '@repo/core/libs/trpc/edge';
import { S3 } from '@repo/core/modules/s3';

export const uploadRouter = router({
  createS3PreSignedUrl: passwordProcedure
    .input(z.object({ pathname: z.string() }))
    .mutation(async ({ input }) => {
      const s3 = new S3();

      return await s3.createPreSignedUrl(input.pathname);
    }),
});

export type FileRouter = typeof uploadRouter;
