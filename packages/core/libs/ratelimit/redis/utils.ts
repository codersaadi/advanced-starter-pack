import { TRPCError } from "@trpc/server";
import { type LimiterName, rateLimiterRegistry } from ".";
export interface RateLimitInput {
  identifier: string;
  limiterName: LimiterName;
  context?: {
    path?: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
  };
}

// RateLimitResult is not strictly needed by checkRateLimit as it throws,
// but could be useful if you wanted a non-throwing version.

export async function checkRateLimit(input: RateLimitInput): Promise<void> {
  const { identifier, limiterName, context = {} } = input;

  const limiter = rateLimiterRegistry.get(limiterName);

  if (!limiter) {
    // This case implies the limiter was not registered/initialized during startup,
    // which `initializeAllLimiters` with `throwOnError: true` should prevent.
    // However, it's good to have a safeguard.
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(
      `[CoreRateLimiter] Limiter "${limiterName}" not found or not initialized. Path: ${context.path || "N/A"}. Ensure initializeAllLimiters() was called at startup and succeeded for all configured limiters.`
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Rate limiter configuration error: "${limiterName}" is not available.`,
    });
  }

  try {
    const { success, retryAfter } = await limiter.limit(identifier);

    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded for ${limiterName}. Please try again ${
          retryAfter ? `after ${Math.ceil(retryAfter)} seconds` : "later"
        }.`,
      });
    }
  } catch (error) {
    // Handle errors from limiter.limit() itself, e.g., Redis connection issues
    // if not handled by oss-ratelimit internally by throwing RatelimitError.
    // The RatelimitError and RateLimitExceededError are specific errors from oss-ratelimit.
    // TRPCError for TOO_MANY_REQUESTS is already specific.
    if (error instanceof TRPCError) {
      throw error;
    }

    // For other unexpected errors from the limiter interaction
    console.error(
      `[CoreRateLimiter] Error during limiter.limit() for ${limiterName} (${identifier}). Path: ${context.path || "N/A"}. Error:`,
      error
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred while processing the rate limit check.",
    });
  }
}

export function determineLimiterAndIdentifier(
  userId: string | undefined | null,
  ip: string | undefined | null,
  limiterNameOverride?: LimiterName
): { limiterName: LimiterName; identifier: string } {
  if (!ip) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error("[DetermineLimiter] IP address is missing or invalid");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Could not determine client identity for rate limiting (IP missing).",
    });
  }

  let identifier: string;
  let limiterName: LimiterName;

  if (limiterNameOverride) {
    limiterName = limiterNameOverride;
    // Example: a 'sensitiveOperation' override might always be IP-based,
    // or could be user-based if the user is authenticated.
    // For this example, let's make overrides IP-based unless it's 'authenticated'
    // and a user exists. This needs to align with your intended logic for overrides.
    if (limiterName === "authenticated" && userId) {
      identifier = userId;
    } else {
      identifier = ip;
    }
  } else if (userId) {
    limiterName = "authenticated";
    identifier = userId;
  } else {
    limiterName = "unauthenticated";
    identifier = ip;
  }

  // Ensure the determined limiterName is a valid, configured LimiterName
  // This is more of a safeguard if limiterNameOverride could be arbitrary.
  // With your typed LimiterName, this check is less critical for typed overrides.
  const rl_instance = rateLimiterRegistry.get(limiterName);
  if (!rl_instance) {
    console.warn(
      `[DetermineLimiter] Determined limiterName "${limiterName}" is not registered. Defaulting to 'unauthenticated'`
    );
    // Fallback to a default, or throw, depending on desired strictness
    limiterName = "unauthenticated";
    identifier = ip; // Ensure identifier matches the fallback limiter type
  }

  return { limiterName, identifier };
}
