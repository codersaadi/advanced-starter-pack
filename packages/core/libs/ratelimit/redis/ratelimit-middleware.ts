import type { LimiterName } from ".";
import { checkRateLimit, determineLimiterAndIdentifier } from "./utils";

export async function ratelimitMiddleware(
  ctx: {
    userId?: string | null;
    ip?: string | null;
  },
  path: string,
  limiterNameOverride?: LimiterName
) {
  const userId = ctx.userId;
  const ip = ctx.ip;

  const { limiterName, identifier } = determineLimiterAndIdentifier(
    userId,
    ip,
    path,
    limiterNameOverride
  );

  await checkRateLimit({
    identifier,
    limiterName,
    context: { path, userId, ip },
  });
}
