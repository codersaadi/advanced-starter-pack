import { TRPCError } from '@trpc/server';
import { type LimiterName, rateLimiterRegistry } from '.';
import { t } from '../../trpc/init';

// --- Rate Limiting Middleware ---

/**
 * tRPC middleware to apply rate limiting.
 * Reads IP/UserID directly from the context.
 * Selects appropriate limiter based on auth status or procedure path (if needed).
 */
export const trpcRateLimit = (limiterNameOverride?: LimiterName) =>
  t.middleware(async ({ ctx, path, next }) => {
    // Cast ctx to your defined TrpcContext if needed for stricter typing,
    // otherwise access properties directly.
    const { ip, auth } = ctx;
    const userId = auth?.user?.id;

    if (!ip) {
      // If IP is null (e.g., fallback 'global_ip_fb' wasn't sufficient or getIp failed)
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(
        `[RateLimit Middleware] IP missing or invalid in context for path: ${path}`
      );
      // Decide how to handle - block or allow? Blocking is safer.
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not determine client identity for rate limiting.',
      });
    }

    let identifier: string;
    let limiterName: LimiterName;

    // Determine Limiter and Identifier
    if (limiterNameOverride) {
      limiterName = limiterNameOverride;
      // Assume overrides are usually IP-based, adjust if necessary
      identifier = ip;
    } else if (userId) {
      // Authenticated user
      limiterName = 'authenticated';
      identifier = userId;
    } else {
      // Anonymous user
      limiterName = 'unauthenticated';
      identifier = ip;
    }

    try {
      const limiter = rateLimiterRegistry.get(limiterName);
      const { success, retryAfter } = await limiter.limit(identifier);

      if (!success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Please try again ${retryAfter ? `after ${retryAfter} seconds` : 'later'}.`,
        });
      }

      return next(); // Rate limit passed!
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(
        `[RateLimit Middleware] Limiter error for ${limiterName} (${identifier}) on path ${path}:`,
        error
      );
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not process rate limit.',
      });
    }
  });

export const apiRatelimitGeneral = trpcRateLimit();
