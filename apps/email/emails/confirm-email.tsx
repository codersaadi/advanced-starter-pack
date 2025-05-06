import { AuthEmailTemplate } from '@repo/email/templates/auth-email';

export default function ConfirmEmail() {
  return <AuthEmailTemplate link="#" type="confirmation" />;
}
