'use client';
import { lambdaClient } from '@repo/core/libs/trpc/client/lamda';
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';
import { LoaderIcon } from 'lucide-react';
import type React from 'react';
import { useFormStatus } from 'react-dom';
export function CheckoutButton({
  className,
  children,
  priceId,
  successUrl,
  cancelUrl,
}: {
  className?: string;
  children: React.ReactNode;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!priceId || !successUrl || !cancelUrl) {
    throw new Error(
      'Missing required props: priceId, successUrl, or cancelUrl'
    );
  }
  // Ensure that the priceId, successUrl, and cancelUrl are provided
  const { pending } = useFormStatus();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await lambdaClient.stripe.createSessionCheckout.mutate({
          priceId,
          successUrl,
          cancelUrl,
        });
      }}
    >
      <Button
        disabled={pending}
        type="submit"
        className={cn('flex justify-center gap-2 px-3', className)}
      >
        {pending && <LoaderIcon className="h-4 w-4 animate-spin" />}
        {children}
      </Button>
    </form>
  );
}
