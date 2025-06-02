// packages/env/novu.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const getNovuEnv = () => {
  return createEnv({
    /**
     * Specify your server-side environment variables schema here.
     * This way you can ensure the app isn't built with invalid env vars.
     */
    server: {
      // novu app secret
      NOVU_SECRET_KEY: z
        .string()
        .min(1)
        .describe("API Key for your Novu instance (for server-side SDK)."),
      NOVU_BACKEND_URL: z
        .string()
        .url()
        .optional()
        .describe(
          "URL for your Novu API backend. Required for self-hosted Novu. " +
            "If using Novu Cloud and this is omitted, the SDK may default to Novu Cloud."
        ),
    },

    /**
     * Specify your client-side environment variables schema here.
     * This way you can ensure the app isn't built with invalid env vars.
     * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
     */
    client: {
      NEXT_PUBLIC_NOVU_APP_ID: z
        .string()
        .min(1) // Usually required if using client-side features
        .optional() // Making it optional if client features are not always used
        .describe(
          "Public Application Identifier for Novu client-side SDKs (e.g., Notification Center)."
        ),
      // NEXT_PUBLIC_NOVU_SOCKET_URL: z.string().url().optional().describe("Optional: Custom Novu WebSocket URL for client-side real-time updates if different from backend URL context.")
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js
     * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
      // Server-side
      NOVU_SECRET_KEY: process.env.NOVU_SECRET_KEY,
      NOVU_BACKEND_URL: process.env.NOVU_BACKEND_URL,

      // Client-side
      NEXT_PUBLIC_NOVU_APP_ID: process.env.NEXT_PUBLIC_NOVU_APP_ID,
      // NEXT_PUBLIC_NOVU_SOCKET_URL: process.env.NEXT_PUBLIC_NOVU_SOCKET_URL,
    },
    /**
     * Makes sure Zod reports all errors at once.
     */
    // skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION, // Adjust as needed
    emptyStringAsUndefined: true,
  });
  // Optional: Add a .superRefine if there are interdependencies,
  // e.g., if NEXT_PUBLIC_NOVU_APP_ID is set, some client-side features are expected.
  // Or, if using self-hosted, NOVU_BACKEND_URL is strictly required.
  // .superRefine((env, ctx) => {
  //   // Example: If you decide self-hosting always needs NOVU_BACKEND_URL explicitly
  //   // This is hard to determine just from env vars without another "NOVU_HOSTING_TYPE" var.
  //   // The Novu SDK itself will likely throw an error if it can't connect.
  // })
};

export const novuEnv = getNovuEnv();
