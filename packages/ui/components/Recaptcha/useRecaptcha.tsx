'use client';

import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface UseRecaptchaReturn {
  /**
   * Function to execute reCAPTCHA challenge.
   * @param action Optional action name for reCAPTCHA v3.
   * @returns A promise that resolves with the reCAPTCHA token.
   *          Returns undefined if reCAPTCHA is not ready/configured or an error occurs during execution.
   */
  executeChallenge: (action?: string) => Promise<string | undefined>;
  /**
   * Indicates if the reCAPTCHA library is loaded and `executeRecaptcha` is available.
   */
  isReady: boolean;
}

export const useRecaptcha = (): UseRecaptchaReturn => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // isReady is true if executeRecaptcha function is available
  const isReady = typeof executeRecaptcha === 'function';

  const executeChallenge = useCallback(
    async (action?: string): Promise<string | undefined> => {
      if (!executeRecaptcha) {
        // Check if the function is available
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.warn(
          'useRecaptcha: executeRecaptcha is not available. reCAPTCHA may not be loaded or configured.'
        );
        return undefined;
      }
      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error(
          'useRecaptcha: Error executing reCAPTCHA challenge:',
          error
        );
        // Depending on desired behavior, you might re-throw or return undefined
        // For simplicity, returning undefined to signal failure to the caller.
        return undefined;
      }
    },
    [executeRecaptcha] // Dependency is the function itself
  );

  return { executeChallenge, isReady };
};
