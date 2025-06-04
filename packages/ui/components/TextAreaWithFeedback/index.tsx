import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';
import { useId } from 'react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
type TextareaProps = React.ComponentPropsWithoutRef<'textarea'>;
// Define the props for our enhanced component
interface TextAreaWithFeedbackProps
  extends Omit<TextareaProps, 'onChange' | 'value' | 'maxLength'> {
  maxLength: number;
  label?: string; // Optional label text
  value?: string; // Optional initial value
  onValueChange?: (value: string) => void; // Optional callback for value changes
  id?: string; // Allow passing a specific ID
  containerClassName?: string; // Allow custom styling for the container div
  feedbackClassName?: string; // Allow custom styling for the feedback text
  showWarningAtPercent?: number; // Percentage (0-1) to show warning color, e.g., 0.8 for 80%
}

const TextAreaWithFeedback = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaWithFeedbackProps
>(
  (
    {
      maxLength,
      label,
      value, // Default to empty string if no initial value is provided
      onValueChange,
      id: propId,
      className, // ClassName for the Textarea itself
      containerClassName,
      feedbackClassName,
      showWarningAtPercent = 0.8, // Default to showing warning at 80% capacity
      ...props // Spread other native TextareaProps (placeholder, disabled, rows etc.)
    },
    ref
  ) => {
    // Generate a unique ID if one isn't provided, for label association
    const internalId = useId();
    const id = propId || internalId;

    // State to hold the current value of the textarea
    // const [value, setValue] = useState(initialValue);

    // Calculate current length and remaining characters
    const currentLength = value?.length || 0;
    const isOverLimit = currentLength > maxLength;
    const warningThreshold = Math.floor(maxLength * showWarningAtPercent);
    const isApproachingLimit =
      currentLength >= warningThreshold && !isOverLimit;

    // Determine the feedback text color based on character count
    const feedbackColor = isOverLimit
      ? 'text-destructive' // Red (from shadcn theme)
      : isApproachingLimit
        ? 'text-yellow-600 dark:text-yellow-500' // Warning color (adjust as needed)
        : 'text-muted-foreground'; // Default subtle color (from shadcn theme)

    // Handle input changes
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;

      // Although the native maxLength attribute prevents typing more,
      // this handles pasting or programmatic changes that might exceed it.
      // We'll visually indicate the overflow but keep the state updated.
      // Alternatively, you could strictly enforce the limit here:
      // if (newValue.length <= maxLength) {
      //   setValue(newValue);
      //   onValueChange?.(newValue);
      // }
      // Let's allow exceeding slightly but show it clearly, common UX pattern.
      onValueChange?.(newValue); // Notify parent component if needed
    };

    return (
      <div className={cn('grid w-full gap-2', containerClassName)}>
        {/* Optional Label */}
        {label && <Label htmlFor={id}>{label}</Label>}

        {/* Shadcn Textarea */}
        <Textarea
          ref={ref} // Forward the ref to the actual textarea element
          id={id}
          value={value}
          onChange={handleChange}
          maxLength={maxLength} // Use the native HTML maxLength attribute
          className={cn(
            // Add border color indication if over limit
            isOverLimit
              ? 'border-destructive focus-visible:ring-destructive'
              : '',
            className // Allow overriding/extending styles
          )}
          aria-describedby={`${id}-feedback`} // Link feedback for screen readers
          {...props} // Pass down other props like placeholder, disabled, etc.
        />

        {/* Feedback Text */}
        <div
          id={`${id}-feedback`} // ID for aria-describedby
          className={cn(
            'text-right font-medium text-sm transition-colors duration-200 ease-in-out',
            feedbackColor,
            feedbackClassName
          )}
          aria-live="polite" // Announce changes politely to screen readers
        >
          {currentLength}/{maxLength}
        </div>
      </div>
    );
  }
);

TextAreaWithFeedback.displayName = 'TextAreaWithFeedback';

export { TextAreaWithFeedback };
