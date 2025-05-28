import { eq } from "drizzle-orm";
import type { Stripe } from "stripe";
import { subscriptions, users } from "../schemas/user";
import { getServerDB } from "../server";
export async function createSubscription(subscription: {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
}) {
  const db = await getServerDB();
  await db.insert(subscriptions).values(subscription);
}

export async function updateSubscription(subscription: {
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
}) {
  const db = await getServerDB();
  await db
    .update(subscriptions)
    .set({
      stripePriceId: subscription.stripePriceId,
      stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd,
    })
    .where(
      eq(subscriptions.stripeSubscriptionId, subscription.stripeSubscriptionId)
    );
}

export async function getSubscription(userId: string) {
  const db = await getServerDB();
  return await db.query.subscriptions.findFirst({
    where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
  });
}

export async function subscriptionCreated(
  subscription: Stripe.Subscription,
  customerId: string
) {
  // Retrieve existing subscription from the database
  const existingSubscription = await getSubscription(customerId);
  const stripePriceId = subscription?.items?.data?.[0]?.price.id;
  if (!stripePriceId) {
    throw new Error(
      "price id not found, we are assuming we are dealing with one price"
    );
  }
  const newSubscriptionData = {
    userId: customerId, // Ensure this maps correctly to your user system
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId, // Assuming you're only dealing with one price
    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000), // Convert Unix timestamp
  };

  if (existingSubscription) {
    // If subscription exists, update the current period end and price
    await updateSubscription({
      stripeSubscriptionId: subscription.id,
      stripePriceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  } else {
    // If no existing subscription, create a new one
    await createSubscription(newSubscriptionData);
  }
}

/**
 * Create a Stripe customer record for a user.
 *
 * @param userId - The user's ID.
 * @param stripeCustomerId - The Stripe customer ID.
 */
export async function createStripeCustomerRecord({
  userId,
  stripeCustomerId,
}: {
  userId: string;
  stripeCustomerId: string;
}): Promise<void> {
  const db = await getServerDB();
  await db
    .update(users)
    .set({
      stripeCustomerId,
    })
    .where(eq(users.id, userId));
}
