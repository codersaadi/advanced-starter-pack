import { LoaderIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button, type ButtonProps } from './ui/button';

export function LoaderButton({
  children,
  isLoading,
  className,
  ...props
}: ButtonProps & { isLoading: boolean }) {
  return (
    <Button
      disabled={isLoading}
      type="submit"
      {...props}
      className={cn('flex justify-center gap-2 px-3', className)}
    >
      {isLoading && <LoaderIcon className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
