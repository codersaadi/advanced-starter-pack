import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export const validateRequest = async (request: Request, secret: string) => {
  const payloadString = await request.text();
  const headerPayload = await headers();

  const svixHeaders = {
    'svix-id': headerPayload.get('svix-id') as string,
    'svix-signature': headerPayload.get('svix-signature') as string,
    'svix-timestamp': headerPayload.get('svix-timestamp') as string,
  };
  const wh = new Webhook(secret);

  try {
    return wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch {
    console.error('incoming webhook failed verification');
    return;
  }
};
