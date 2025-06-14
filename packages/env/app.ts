import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import {
  // cloudflare,
  stripe,
} from './presets';

export const isServerMode = process.env.NEXT_PUBLIC_SERVICE_MODE === 'server';
const isInVercel = process.env.VERCEL === '1';

const vercelUrl = `https://${process.env.VERCEL_URL}`;

const APP_URL = process.env.APP_URL
  ? process.env.APP_URL
  : // biome-ignore lint/nursery/noNestedTernary: <explanation>
    isInVercel
    ? vercelUrl
    : undefined;

// only throw error in server mode and server side
if (typeof window === 'undefined' && isServerMode && !APP_URL) {
  throw new Error('`APP_URL` is required in server mode');
}

const serverSchema = {
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  NODE_ENV: z.enum(['test', 'development', 'production']),
  REDIS_CLIENT: z.string().min(1).url().optional(),
  VERCEL_EDGE_CONFIG: z.string().optional(),
  IN_APP_RATE_LIMIT: z.boolean().optional(),
  ARCJET_KEY: z.string().min(1).startsWith('ajkey_').optional(),

  APP_URL: z.string().optional(),

  // Added by Sentry Integration, Vercel Marketplace
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
  MIDDLEWARE_REWRITE_THROUGH_LOCAL: z.boolean().optional(),

  VERCEL: z.string().optional(),
};

const clientSchema = {
  NEXT_PUBLIC_HOST: z
    .string()
    .url()
    .refine((url) => !url.endsWith('/'), {
      message: 'HOST URL should not end with a trailing slash',
    }),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ENABLE_SENTRY: z.boolean(),

  NEXT_PUBLIC_BASE_PATH: z.string().optional(),
  NEXT_PUBLIC_BACKEND_API_ENDPOINTS: z.string().optional(),
};

const env = createEnv({
  server: serverSchema,
  client: clientSchema,
  emptyStringAsUndefined: true,
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',
    MIDDLEWARE_REWRITE_THROUGH_LOCAL:
      process.env.MIDDLEWARE_REWRITE_THROUGH_LOCAL === '1',
    VERCEL_EDGE_CONFIG: process.env.VERCEL_EDGE_CONFIG,
    NEXT_PUBLIC_ENABLE_SENTRY: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

    NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
    IN_APP_RATE_LIMIT: process.env.IN_APP_RATE_LIMIT === '1',
    // Auth env

    NODE_ENV: process.env.NODE_ENV || 'development',

    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,

    VERCEL: process.env.VERCEL,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,

    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    APP_URL,
    REDIS_CLIENT: process.env.REDIS_CLIENT,
    NEXT_PUBLIC_BACKEND_API_ENDPOINTS:
      process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINTS,
  },
  onValidationError: (err) => {
    throw err;
  },
  extends: [
    stripe(),
    // upstash(),
  ],
});

export default env;
export { env };
export type AppEnv = typeof env;

export const isDev = process.env.NODE_ENV === 'development';
