import {
  type RateLimitBuilder,
  RateLimitExceededError,
  RatelimitError,
  type RegisterConfigParam,
  createLimiterAccessor, // Type for registration config
  fixedWindow,
  initRateLimit,
  initializeLimiters,
  slidingWindow,
} from "oss-ratelimit";

// Define names for your different limiters (enhances type safety)
export type LimiterName = "authenticated" | "unauthenticated";

// Create the registry instance
// It's recommended to use environment variables for Redis connection details
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

export const initializedLimitersPromise = initializeLimiters({
  registry: rateLimiterRegistry,
  configs: limiterConfigs,
  verbose: process.env.NODE_ENV !== "production", // Log progress in dev
  throwOnError: true, // Recommended: Stop startup if a limiter fails
});

// You can add listeners to the registry *before* initialization
rateLimiterRegistry.on("limiterRegister", ({ name, clientKey }) => {
  console.log(
    `✅ Limiter "${name}" registered using Redis client: ${clientKey}`
  );
});
rateLimiterRegistry.on("redisError", ({ clientKey, error }) => {
  console.error(`❌ Redis Error for client ${clientKey}:`, error);
});
rateLimiterRegistry.on("limiterError", ({ name, error }) => {
  console.error(`❌ Failed to initialize limiter "${name}":`, error);
});

// Handle potential initialization errors globally if needed
initializedLimitersPromise.catch((error) => {
  console.error("💥 Critical error during rate limiter initialization:", error);
  // Potentially exit the application or disable features relying on rate limiting
  process.exit(1);
});
export { RatelimitError, RateLimitExceededError };
