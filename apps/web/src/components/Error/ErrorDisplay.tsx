'use client';
import { Button } from '@repo/ui/components/ui/button';
import { HomeIcon, RefreshCwIcon, XCircleIcon } from 'lucide-react'; // Corrected icon names
import Link from 'next/link';
import type React from 'react';
import { memo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import the real hook

// Assuming ErrorType and sentryCaptureException are defined elsewhere
import { type ErrorType, sentryCaptureException } from './error'; // Example path

// For MAX_WIDTH, it's better to use Tailwind's max-width classes or define it in tailwind.config.js
// If you must use it as a CSS variable for the text effect, define it in globals.css or inline.
// For simplicity, we can use a Tailwind class like `lg:text-[200px]` or similar for the large text.

interface ErrorDisplayProps {
  error: ErrorType; // ErrorType should include at least `message` and optionally `digest`
  reset: () => void; // Function to attempt to recover (e.g., re-render segment)
}

const ErrorDisplay = memo<ErrorDisplayProps>(({ error, reset }) => {
  // Specify the namespace that contains 'errorPage' keys.
  // Default to 'common', but could be 'errors' if you have a dedicated file.
  const { t } = useTranslation('common');

  useLayoutEffect(() => {
    // Log the error to Sentry (or your error tracking service)
    // Consider adding more context to the Sentry capture if available
    sentryCaptureException(error);
  }, [error]);

  // For the large "ERROR" text, using Tailwind classes directly is often cleaner.
  // The CSS variable approach for `--max-width` can be kept if the effect is very specific.
  // If using Tailwind, you might define a utility in globals.css or use arbitrary values.
  const largeErrorTextStyle = {
    '--max-width-val': '1280px', // You can set this based on a prop or a fixed value
  } as React.CSSProperties;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-6 text-center text-foreground antialiased">
      {/* Background text effect - consider simplifying with Tailwind if possible */}
      <div
        aria-hidden="true"
        className="-z-10 pointer-events-none absolute inset-0 flex select-none items-center justify-center font-black text-destructive/5 opacity-50 blur-xl filter [font-size:clamp(10rem,30vw,30rem)] lg:[font-size:clamp(15rem,25vw,calc(var(--max-width-val)/3.5))]"
        style={largeErrorTextStyle}
      >
        ERROR
      </div>

      <div className="z-10 flex flex-col items-center">
        {' '}
        {/* Content wrapper */}
        <XCircleIcon className="mb-6 h-20 w-20 text-destructive sm:h-24 sm:w-24" />
        <h1 className="mb-3 font-semibold text-2xl text-foreground sm:text-3xl md:text-4xl">
          {t('errorPage.title', 'Oops! Something Went Wrong')}
        </h1>
        <p className="mb-8 max-w-lg text-muted-foreground sm:text-lg">
          {t(
            'errorPage.desc',
            "We've encountered an unexpected issue. Our team has been notified. Please try again, or if the problem persists, return home."
          )}
        </p>
        {error?.message && (
          <details className="mb-8 w-full max-w-xl rounded-md border border-border bg-muted p-4 text-left">
            <summary className="cursor-pointer font-medium text-foreground text-sm hover:text-foreground/80">
              {t('errorPage.showErrorDetails', 'Show Error Details')}
            </summary>
            <pre className="mt-2 overflow-auto text-destructive-foreground/80 text-xs">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
              {/* Consider adding stack trace if available and appropriate */}
              {/* {error.stack && `\n\nStack: ${error.stack}`} */}
            </pre>
          </details>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button onClick={() => reset()} variant="outline" size="lg">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            {t('errorPage.retry', 'Try Again')}
          </Button>
          <Button asChild size="lg">
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              {t('errorPage.backHome', 'Back to Home')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';
export default ErrorDisplay;
