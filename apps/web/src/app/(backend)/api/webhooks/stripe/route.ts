import { subscriptionCreated } from "@repo/core/database/data/subscription";
import { stripe } from "@repo/core/libs/stripe/stripe";
import env from "@repo/env/app";
import { headers as headersPromise } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
const stripeWebhookEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: NextRequest) {
  const stripeEvent = await stripeWebHook(req);
  return stripeEvent;
}
const stripeWebHook = async (req: NextRequest) => {
  let stripeEvent: Stripe.Event;
  const body = await req.text();
  const headers = await headersPromise();
  const sig = headers.get("Stripe-Signature");
  const webhookSecret =
    env.STRIPE_WEBHOOK_SECRET_LIVE ?? env.STRIPE_WEBHOOK_SECRET;
  try {
    if (!sig || !webhookSecret) {
      return;
    }
    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error: unknown) {
    return new NextResponse(
      `Webhook Error: ${
        error instanceof Error ? error.message : "something went wrong"
      }`,
      { status: 400 }
    );
  }

  //
  try {
    if (stripeWebhookEvents.has(stripeEvent.type)) {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      if (
        !subscription.metadata.connectAccountPayments &&
        !subscription.metadata.connectAccountSubscriptions
      ) {
        switch (stripeEvent.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated": {
            if (subscription.status === "active") {
              await subscriptionCreated(
                subscription,
                subscription.customer as string
              );
            }
            break; // Ensure the break here too
          }

          default:
        }
      }
    }
  } catch (_error) {
    return new NextResponse("🔴 Webhook Error", { status: 400 });
  }
  return NextResponse.json(
    {
      webhookActionReceived: true,
    },
    {
      status: 200,
    }
  );
};
