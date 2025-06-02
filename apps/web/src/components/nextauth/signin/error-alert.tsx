'use client';

import { Alert, AlertDescription } from '@repo/ui/components/ui/alert'; // Ensure path
import { memo } from 'react';
import type { ErrorAlertProps } from './types';

export const ErrorAlert = memo<ErrorAlertProps>(({ error }) => {
  if (!error) return null;
  return (
    <Alert
      variant="destructive"
      className="mb-6 rounded-xl border-red-300/50 bg-red-500/10 dark:border-red-700/50 dark:bg-red-500/15" // Adjusted colors for better contrast
    >
      <AlertDescription className="font-medium text-red-700 dark:text-red-300">
        {' '}
        {/* Added font-medium */}
        {error}
      </AlertDescription>
    </Alert>
  );
});
ErrorAlert.displayName = 'ErrorAlert';
