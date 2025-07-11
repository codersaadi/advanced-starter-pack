import type { EmailProviderSendVerificationRequestParams } from 'next-auth/providers';
import { authEmail } from './auth-email';


export async function sendVerificationRequest(
  params: EmailProviderSendVerificationRequestParams
) {
  const { identifier: to, url } = params;
   await authEmail(to, 'verify', { case: 'url', value: url });
}
