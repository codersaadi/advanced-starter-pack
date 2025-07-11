import { trpc } from '../init';

export const oidcAuth = trpc.middleware((opts) => {
  const { ctx, next } = opts;

  if (ctx.oidcAuth) {
    return next({
      ctx: { oidcAuth: ctx.oidcAuth, userId: ctx.oidcAuth.sub },
    });
  }

  return next();
});
