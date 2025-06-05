import { getJWTPayload } from "@repo/shared/utils/jwt";
import { TRPCError } from "@trpc/server";
import { edgeTrpc } from "./init";

export const jwtPayloadChecker = edgeTrpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: "UNAUTHORIZED" });

  const jwtPayload = await getJWTPayload(ctx.authorizationHeader);
  return opts.next({ ctx: { jwtPayload } });
});
