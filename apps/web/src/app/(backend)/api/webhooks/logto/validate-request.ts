import { createHmac } from 'node:crypto';
import { authEnv } from '@repo/env/auth';
import { headers } from 'next/headers';

export type LogtToUserEntity = {
  applicationId?: string;
  avatar?: string;
  createdAt?: string;
  customData?: object;
  id: string;
  identities?: object;
  isSuspended?: boolean;
  lastSignInAt?: string;
  name?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  username?: string;
};

interface LogtoWebhookPayload {
  // Only support user event currently
  data: LogtToUserEntity;
  event: string;
}

export const validateRequest = async (request: Request, signingKey: string) => {
  const payloadString = await request.text();
  const headerPayload = await headers();
  const logtoHeaderSignature = headerPayload.get(
    'logto-signature-sha-256'
  ) as string;
  try {
    const hmac = createHmac('sha256', signingKey);
    hmac.update(payloadString);
    const signature = hmac.digest('hex');
    if (signature === logtoHeaderSignature) {
      return JSON.parse(payloadString) as LogtoWebhookPayload;
    }
    console.warn(
      '[logto]: signature verify failed, please check your logto signature in `LOGTO_WEBHOOK_SIGNING_KEY`'
    );
    return;
  } catch (e) {
    if (!authEnv.LOGTO_WEBHOOK_SIGNING_KEY) {
      throw new Error(
        '`LOGTO_WEBHOOK_SIGNING_KEY` environment variable is missing.'
      );
    }
    console.error('[logto]: incoming webhook failed in verification.\n', e);
    return;
  }
};
