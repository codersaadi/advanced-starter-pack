import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getEmailEnv = () => {
  return createEnv({
    server: {
      RESEND_KEY: z.string().startsWith('re_').min(1),
      RESEND_AUDIENCE_ID: z.string().optional(),
      EMAIL_FROM: z.string().optional(),
    },
    runtimeEnv: {
      RESEND_KEY: process.env.RESEND_KEY,
      RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
      EMAIL_FROM: process.env.EMAIL_FROM,
    },
  });
};

export const serverDBEnv = getEmailEnv();
