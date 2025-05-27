'use client';

import { Button, type buttonVariants } from '@repo/ui/components/ui/button'; // Shadcn Button
import { useCopied } from '@repo/ui/hooks/use-copied';
import type { VariantProps } from 'class-variance-authority';
import { Check, Copy as CopyIconLucide } from 'lucide-react';
import React from 'react';
// This component is a copy button that allows users to copy content to the clipboard.
export type ButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

interface CopyButtonProps extends ButtonProps {
  content: string;
  copyIcon?: React.ReactNode;
  checkIcon?: React.ReactNode;
  copyTooltip?: string;
  copiedTooltip?: string;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      content,
      children,
      className,
      variant = 'ghost',
      size = 'icon',
      copyIcon,
      checkIcon,
      copyTooltip = 'Copy to clipboard',
      copiedTooltip = 'Copied!',
      ...props
    },
    ref
  ) => {
    const { copied, setCopied } = useCopied();

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied();
      } catch (err) {
        console.error('Failed to copy: ', err);
        // You could add a toast notification for failure here
      }
    };

    const Icon = copied ? Check : CopyIconLucide;
    const defaultIcon = <Icon className="h-4 w-4" />;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        onClick={handleCopy}
        title={copied ? copiedTooltip : copyTooltip}
        {...props}
      >
        {children
          ? children
          : copied
            ? checkIcon || defaultIcon
            : copyIcon || defaultIcon}
      </Button>
    );
  }
);
CopyButton.displayName = 'CopyButton';

export default CopyButton;
