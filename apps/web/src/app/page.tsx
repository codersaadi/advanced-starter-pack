'use client';
import { useTranslation } from '@repo/i18n';
import { BRANDING_NAME } from '@repo/ui/const/branding';
export default async function page() {
  const { t, i18n } = useTranslation(['common', 'home']);

  return <div>Welcome to {BRANDING_NAME}</div>;
}
