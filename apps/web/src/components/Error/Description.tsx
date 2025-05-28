'use client';
import { SyntaxHighlighter } from '@repo/ui/components/Highlighter';
import { Button } from '@repo/ui/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'; // Corrected import name
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import the actual hook

interface ErrorDescriptionProps {
  /** The raw error message, often from an error object */
  message: string;
  /** HTTP status code or a specific error code string */
  statusOrErrorCode: number | string; // Can be a number (HTTP status) or a string code
  /** Optional parameters for interpolation if your translation needs them */
  tOptions?: Record<string, string | number>;
}

const ErrorDescription = memo<ErrorDescriptionProps>(
  ({ message, statusOrErrorCode, tOptions }) => {
    const { t } = useTranslation('error');
    const [showDetails, setShowDetails] = useState(false);

    // Construct the translation key
    // Prioritize specific error codes if they are strings, otherwise use 'response.HTTP_STATUS'
    const translationKey =
      typeof statusOrErrorCode === 'string'
        ? `error.${statusOrErrorCode}` // e.g., error.AgentRuntimeError
        : `response.${statusOrErrorCode}`; // e.g., response.500

    // Fallback message if translation is not found
    const defaultDisplayMessage = `Error: ${statusOrErrorCode}`;
    const displayMessage = t(translationKey, defaultDisplayMessage, tOptions);

    return (
      <div className="flex flex-col gap-2 text-foreground text-sm">
        {' '}
        {/* Use text-foreground for main text */}
        <p>{displayMessage}</p>
        {message && ( // Only show details toggle if there's a raw message
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button
                variant="link"
                className="h-auto justify-start p-0 text-blue-600 text-xs hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <div className="flex items-center gap-1">
                  {t('fetchError.detail', 'Show Details')}{' '}
                  {/* Key from your JSON */}
                  {showDetails ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <SyntaxHighlighter
                language="text" // Or 'json' if the message is often JSON
                // Consider a more neutral or error-specific theme for the highlighter
                // 'github-light' / 'github-dark' can be adapted based on theme
                // Or create a custom theme for errors.
                className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/50 p-2 text-xs"
                style={{
                  background:
                    'var(--color-muted-opacity-50, hsl(var(--muted) / 0.5))',
                }} // More dynamic background
              >
                {message}
              </SyntaxHighlighter>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  }
);

ErrorDescription.displayName = 'ErrorDescription';
export default ErrorDescription;
