import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
export { vercel } from '@t3-oss/env-core/presets';

export const stripe = () =>
  createEnv({
    server: {
      STRIPE_WEBHOOK_SECRET_LIVE: z.string().optional(),
      STRIPE_API_KEY: z.string().optional(),
      STRIPE_WEBHOOK_SECRET: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_PRICE_ID_BASIC: z.string(),
      NEXT_PUBLIC_PRICE_ID_PREMIUM: z.string(),
    },
    runtimeEnv: {
      STRIPE_WEBHOOK_SECRET_LIVE: process.env.STRIPE_WEBHOOK_SECRET_LIVE,
      STRIPE_API_KEY: process.env.STRIPE_API_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_PRICE_ID_BASIC: process.env.NEXT_PUBLIC_PRICE_ID_BASIC,
      NEXT_PUBLIC_PRICE_ID_PREMIUM: process.env.NEXT_PUBLIC_PRICE_ID_PREMIUM,
    },
  });

export const upstash = () => {
  return createEnv({
    server: {
      UPSTASH_REDIS_REST_URL: z.string().min(1).url().optional(),
      UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    },
    runtimeEnv: {
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    },
  });
};
