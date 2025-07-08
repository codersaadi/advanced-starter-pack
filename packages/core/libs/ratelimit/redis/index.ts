import {
  type RateLimitBuilder,
  type RegisterConfigParam,
  createLimiterAccessor, // Type for registration config
  initRateLimit,
  initializeLimiters,
  slidingWindow,
} from "oss-ratelimit";

// Define names for your different limiters (enhances type safety)
export type LimiterName = "authenticated" | "unauthenticated";

// Create the registry instance
// It's recommended to use environment variables for Redis connection details
// https://oss-ratelimit.vercel.app/docs/04-multiple-limiters-with-registry
export const rateLimiterRegistry: RateLimitBuilder<LimiterName> =
  initRateLimit<LimiterName>({
    // Default Redis options applied to all limiters unless overridden
    // defaultRedisOptions: {
    //   url: process.env.RATELIMIT_REDIS_URL || "redis://localhost:6379",
    //   // password: process.env.RATELIMIT_REDIS_PASSWORD,
    //   // database: 0, // Default database
    // },
  });

// Define configurations for each named limiter
export const limiterConfigs: Record<LimiterName, RegisterConfigParam> = {
  authenticated: {
    prefix: "rl_auth",
    limiter: slidingWindow(10, "10 s"),
    analytics: true, // Enable analytics for this limiter
  },
  unauthenticated: {
    limiter: slidingWindow(5, "10 s"), // Stricter limits
    prefix: "rl_unauth",
    timeout: 500, // Shorter Redis timeout for this one
  },
};
export const getLimiter = createLimiterAccessor(rateLimiterRegistry);

/**
 * Initializes all rate limiters defined in `limiterConfigs`.
 * Call this during application startup.
 * @returns Promise resolving when all limiters are ready, or rejecting on error.
 */
export const initializeAllLimiters = async () => {
  const startTime = Date.now();
  try {
    const results = await initializeLimiters({
      registry: rateLimiterRegistry,
      configs: limiterConfigs,
      verbose: process.env.NODE_ENV !== "production", // Log details in dev
      throwOnError: true, // Stop startup if any limiter fails
    });
    const duration = Date.now() - startTime;

    console.log(
      `✅ All ${Object.keys(results).length} rate limiters initialized successfully in ${duration}ms.`
    );
    return results;
  } catch (error) {
    console.error(
      "💥 Critical error during rate limiter initialization:",
      error
    );
    // Gracefully shut down or prevent the app from starting fully
    process.exit(1); // Or rethrow the error
  }
};

// You can add listeners to the registry *before* initialization

export { RatelimitError, RateLimitExceededError } from "oss-ratelimit";
