import { DESKTOP_USER_ID, isDesktopApp } from "@repo/shared/const/version";
import { userAuth } from "../middleware/auth";
import { trpc } from "./init";
import { oidcAuth } from "./middleware/oidcAuth";

/**
 * Create a router
 * @link https://trpc.io/docs/v11/router
 */
export const router = trpc.router;

/**
 * Create an unprotected procedure
 * @link https://trpc.io/docs/v11/procedures
 **/
export const publicProcedure = trpc.procedure.use(({ next, ctx }) => {
  return next({
    ctx: { userId: isDesktopApp ? DESKTOP_USER_ID : ctx.userId },
  });
});
// .use(trpcRateLimitLambda());

// procedure that asserts that the user is logged in
export const authedProcedure = trpc.procedure.use(oidcAuth).use(userAuth);
// .use(trpcRateLimitLambda(true));

/**
 * Create a server-side caller
 * @link https://trpc.io/docs/v11/server/server-side-calls
 */
export const createCallerFactory = trpc.createCallerFactory;
