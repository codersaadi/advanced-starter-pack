'use client';
import { lambdaClient } from '@repo/core/libs/trpc/client/lamda';
import { LoaderButton } from '@repo/ui/components/loader-button';
import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
// Checkout button with server action , incase you don't want to use it with trpc ( while using with trpc is Recommended, leaving it as it is for now)
export function CheckoutButton({
  className,
  children,
  priceId,
  successUrl,
  cancelUrl,
}: {
  className?: string;
  children: ReactNode;
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
      <LoaderButton isLoading={pending} className={className}>
        {children}
      </LoaderButton>
    </form>
  );
}
