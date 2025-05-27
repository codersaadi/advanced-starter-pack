import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const oidcEnv = createEnv({
  client: {},
  runtimeEnv: {
    ENABLE_OIDC: process.env.ENABLE_OIDC === '1',
    OIDC_JWKS_KEY: process.env.OIDC_JWKS_KEY,
  },
  server: {
    ENABLE_OIDC: z.boolean().optional().default(false),
    OIDC_JWKS_KEY: z.string().optional(),
  },
});
