import { SubscriptionService } from "@repo/core/database/models/subscription";
import { stripe } from "@repo/core/libs/stripe/stripe";
import { authedProcedure, router } from "@repo/core/libs/trpc/lambda";
import {
  createCheckoutSessionSchema,
  createStripeCustomerSchema,
} from "@repo/core/schema/stripe-schema";
import { TRPCError } from "@trpc/server";

export const stripeRouter = router({
  createSessionCheckout: authedProcedure
    .input(createCheckoutSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { successUrl, priceId, cancelUrl } = input;

      // Validate required fields
      if (!successUrl || !priceId || !cancelUrl) {
        throw new TRPCError({
          message: "Missing Required parameters",
          code: "BAD_REQUEST",
        });
      }

      // Create Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer: ctx.userId as string,
      });

      return { sessionId: stripeSession.id };
    }),

  createStripeCustomer: authedProcedure
    .input(createStripeCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Create Stripe customer
      const customer = await stripe.customers.create(input);
      const subscriptionClient = await SubscriptionService.create();
      // Store Stripe customer ID
      await subscriptionClient.updateUserWithStripeCustomerId({
        userId,
        stripeCustomerId: customer.id,
      });

      return customer;
    }),
});
