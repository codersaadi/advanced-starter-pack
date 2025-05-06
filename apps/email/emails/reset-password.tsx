import { AuthEmailTemplate } from '@repo/email/templates/auth-email';

export default function ResetPassword() {
  return <AuthEmailTemplate link="#" type="reset" />;
}
