import { cn } from '@repo/ui/lib/utils';
import type React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Tag: React.FC<TagProps> = ({ className, children, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Tag;
