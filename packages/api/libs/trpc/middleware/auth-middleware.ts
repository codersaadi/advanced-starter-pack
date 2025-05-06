import { TRPCError } from '@trpc/server';
import type { Session } from 'next-auth';
import { apiRatelimitGeneral } from '../../ratelimit/redis/trpc-ratelimit-middleware';
import { t } from '../init';
/**
 * Public (unauthed) procedure base.
 * It now implicitly relies on the IP being present in the context.
 */
export const publicProcedure = t.procedure.use(apiRatelimitGeneral); // No extra middleware needed here just for IP
/**
 * Reusable procedure that enforces users are logged in.
 * Relies on `auth` and `ip` being present in the context.
 */
export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    const { auth } = ctx;
    const user = auth?.user;
    if (!user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in to perform this action.',
      });
    }

    // Proceed, knowing auth exists. The context already includes IP.
    return next({
      ctx: {
        ...ctx,
        // Assert the auth type more specifically if needed downstream
        auth: {
          ...auth,
          user: user as Session['user'] & {
            organizationId: string;
            id: string;
          },
        },
      },
    });
  })
  .use(apiRatelimitGeneral);
