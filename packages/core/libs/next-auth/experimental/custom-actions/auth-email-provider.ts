import { getEmailEnv } from '@repo/env/email';
import type { EmailConfig, EmailUserConfig } from 'next-auth/providers';
// import { hasAdapterOnNode } from "..";
import { sendVerificationRequest } from './send-request';
const emailEnv = getEmailEnv();

export const authEmailProvider = async (
  config?: EmailUserConfig
): Promise<EmailConfig> => {
  const apiKey = emailEnv.RESEND_KEY;
  if (!apiKey || !emailEnv.EMAIL_FROM) {
    console.log({ error: 'add emailEnv to use authEmailProvider' });

    throw new Error('AUTH EMAIL ENV MISSING');
  }
  return {
    ...config,
    id: emailEnv.EMAIL_PROVIDER,
    type: 'email',
    name: emailEnv.EMAIL_PROVIDER === 'resend' ? 'Resend' : 'http-email',
    generateVerificationToken: () => crypto.randomUUID(),
    apiKey: apiKey,
    from: emailEnv.EMAIL_FROM,
    sendVerificationRequest: sendVerificationRequest,
  };
};
