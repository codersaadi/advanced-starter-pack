import { createStripeCustomerRecord } from '@repo/api/database/data/users';
import { stripe } from '@repo/api/libs/stripe/stripe';
import { createTRPCRouter } from '@repo/api/libs/trpc/init';
import { protectedProcedure } from '@repo/api/libs/trpc/middleware/auth-middleware';
import {
  createCheckoutSessionSchema,
  createStripeCustomerSchema,
} from '@repo/api/schema/stripe-schema';
import { TRPCError } from '@trpc/server';

export const stripeRouter = createTRPCRouter({
  createSessionCheckout: protectedProcedure
    .input(createCheckoutSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { successUrl, priceId, cancelUrl } = input;

      // Validate required fields
      if (!successUrl || !priceId || !cancelUrl) {
        throw new TRPCError({
          message: 'Missing Required parameters',
          code: 'BAD_REQUEST',
        });
      }

      // Create Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: ctx.auth.user.id },
      });

      return { sessionId: stripeSession.id };
    }),

  createStripeCustomer: protectedProcedure
    .input(createStripeCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      // Create Stripe customer
      const customer = await stripe.customers.create(input);

      // Store Stripe customer ID
      await createStripeCustomerRecord({
        userId,
        stripeCustomerId: customer.id,
      });

      return customer;
    }),
});
