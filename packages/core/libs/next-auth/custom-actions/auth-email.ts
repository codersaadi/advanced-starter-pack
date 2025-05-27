import { resend } from '@repo/email';
import { AuthEmailTemplate } from '@repo/email/templates/auth-email';
import env from '@repo/env';
import { getEmailEnv } from '@repo/env/email';
type SendAuthEmailType = 'reset' | 'verify' | 'confirmation';
const authEmailLinks = (token: string) => ({
  reset: `${env.NEXT_PUBLIC_HOST}/auth/new-password?token=${token}`,
  verify: `${env.NEXT_PUBLIC_HOST}/auth/email_verify?token=${token}`,
  confirmation: `${env.NEXT_PUBLIC_HOST}/auth/email_confirmation?token=${token}`,
});

const getAuthEmailSubject = {
  reset: 'Resetting Password',
  verify: 'Email Verification',
  confirmation: 'Confirming Email Address',
};
export const authEmail = async (
  email: string,
  type: SendAuthEmailType,
  token: string,
  username?: string
) => {
  const { data, error } = await resend.emails.send({
    from: getEmailEnv().EMAIL_FROM || 'Acme <onboarding@resend.dev>', // ensure a real fallback
    to: [email],
    subject: getAuthEmailSubject[type],
    react: AuthEmailTemplate({
      link: authEmailLinks(token)[type],
      type,
      username,
    }),
  });
  return { data, error };
};
