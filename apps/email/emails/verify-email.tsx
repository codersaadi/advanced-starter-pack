import { AuthEmailTemplate } from '@repo/email/templates/auth-email';

export default function VerifyEmail() {
  return <AuthEmailTemplate link="#" type="verify" />;
}
