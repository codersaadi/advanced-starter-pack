'use client';

import { useUserStore } from '@/store/user'; // Your Zustand store for user/auth state
import { AlertTriangleIcon } from 'lucide-react'; // Or a more suitable icon like LogInIcon
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import the real hook

// Shadcn/UI Alert component can be nice for this kind of message
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui/components/ui/alert';
import { Button } from '@repo/ui/components/ui/button'; // For an explicit button

interface RedirectLoginProps {
  /** Timeout in milliseconds before automatically triggering login */
  timeout?: number;
  /** Message to display before the redirect instruction */
  message?: string;
  /** Title for the alert (optional) */
  title?: string;
}

const RedirectLogin = memo<RedirectLoginProps>(
  ({
    timeout = 3000, // Increased default timeout slightly
    message = 'To continue, please log in.', // Default contextual message
    title,
  }) => {
    // Specify the namespace (e.g., 'common' or 'auth')
    const { t } = useTranslation('error');
    const openLogin = useUserStore((s) => s.openLogin); // From your Zustand store

    useEffect(() => {
      const timer = setTimeout(() => {
        openLogin();
      }, timeout);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [openLogin, timeout]);

    // The title for the alert, defaults to a generic "Login Required"
    const alertTitle = title || t('loginRequired.title', 'Login Required');
    // The main descriptive text, including the auto-redirect info
    const alertDescription = t(
      'loginRequired.desc',
      "You'll be redirected to login shortly, or click below to go now."
    );

    return (
      <Alert variant="default" className="my-4">
        <AlertTriangleIcon className="h-5 w-5" />
        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription className="mt-1">
          {message} {alertDescription}
        </AlertDescription>
        <div className="mt-3">
          <Button
            variant="link"
            onClick={openLogin}
            className="h-auto p-0 text-sm" // Link-like button
          >
            {t('loginRequired.action', 'Login Now')}
          </Button>
        </div>
      </Alert>
    );
  }
);

RedirectLogin.displayName = 'RedirectLogin';
export default RedirectLogin;
