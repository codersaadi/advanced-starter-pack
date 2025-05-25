export { SigninCredentials as default } from '@/components/auth/signin';
import { APP_NAME } from '@/constants';
import type { Metadata } from 'next';

/**
 * Meta data for the signin form page
 */
export const metadata: Metadata = {
  title: `${APP_NAME} - Signin to Continue `,
  description: '...',
};
