import type { LimiterName } from '.';
import { checkRateLimit, determineLimiterAndIdentifier } from './utils';

export async function ratelimitMiddleware(
  ctx: {
    userId?: string | null;
    ip?: string | null;
  },
  limiterNameOverride?: LimiterName
) {
  const userId = ctx.userId;
  const ip = ctx.ip;

  const { limiterName, identifier } = determineLimiterAndIdentifier(
    userId,
    ip,
    limiterNameOverride
  );

  await checkRateLimit({
    identifier,
    limiterName,
    context: { userId, ip },
  });
}
