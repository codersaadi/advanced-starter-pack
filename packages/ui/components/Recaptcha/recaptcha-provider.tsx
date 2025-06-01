'use client'; // This component will be used in client-side contexts

import type { ReactNode } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface RecaptchaProviderProps {
  children: ReactNode;
  /**
   * Optional: Explicitly pass the reCAPTCHA v3 Site Key.
   * If not provided, it will try to read from `process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
   */
  siteKey?: string;
}

export const RecaptchaProvider = ({
  children,
  siteKey: explicitSiteKey,
}: RecaptchaProviderProps) => {
  const siteKey = explicitSiteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    // biome-ignore lint/suspicious/noConsole:
    console.warn(
      'reCAPTCHA V3: Site Key is not configured. ' +
        "Please provide it via RecaptchaProvider props or ensure NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set in your application's environment."
    );
    // Render children without the provider, reCAPTCHA will not function.
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
};
