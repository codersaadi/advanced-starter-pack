import { eq } from "drizzle-orm";
import type { Stripe } from "stripe";
// Assuming your schemas are in a central place, adjust path if necessary
import { subscriptions, users } from "../schemas/user"; // Or import * as schema from "..."
import { getServerDB } from "../server";
import type { OrgDatabase } from "../type";

// It's good practice to get the specific type of your Drizzle instance
// If getServerDB() returns, for example, PgDatabase<typeof import("../schemas/user")>
// you could use that. For simplicity, we'll use Awaited<ReturnType<...>>

// Define input types for clarity and reusability
interface CreateSubscriptionParams {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
}

interface UpdateSubscriptionParams {
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
}

interface CreateStripeCustomerRecordParams {
  userId: string;
  stripeCustomerId: string;
}

export class SubscriptionService {
  private db: OrgDatabase;

  // Private constructor to enforce instantiation via the static factory
  private constructor(db: OrgDatabase) {
    this.db = db;
  }

  /**
   * Creates an instance of SubscriptionService.
   * Recommended way to instantiate the service due to async DB initialization.
   */
  public static async create(): Promise<SubscriptionService> {
    const db = await getServerDB();
    return new SubscriptionService(db);
  }

  /**
   * Creates a new subscription record in the database.
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<void> {
    await this.db.insert(subscriptions).values(params);
  }

  /**
   * Updates an existing subscription record in the database.
   */
  async updateSubscription(params: UpdateSubscriptionParams): Promise<void> {
    await this.db
      .update(subscriptions)
      .set({
        stripePriceId: params.stripePriceId,
        stripeCurrentPeriodEnd: params.stripeCurrentPeriodEnd,
      })
      .where(
        eq(subscriptions.stripeSubscriptionId, params.stripeSubscriptionId)
      );
  }

  /**
   * Retrieves a subscription by user ID.
   * @param userId The ID of the user whose subscription is to be fetched.
   */
  async getSubscription(userId: string) {
    // The return type will be inferred, or you can explicitly type it
    // e.g., Promise<typeof subscriptions.$inferSelect | undefined>
    return await this.db.query.subscriptions.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
  }

  /**
   * Handles the creation or update of a subscription based on a Stripe webhook event.
   * It assumes the `userIdInApp` is the ID used within your application for the user.
   * This might be the same as Stripe's customer ID or mapped from it.
   * @param stripeSubscription The Stripe.Subscription object from the webhook.
   * @param userIdInApp The user's ID in your application.
   */
  async handleSubscriptionChange(
    stripeSubscription: Stripe.Subscription,
    userIdInApp: string // Renamed from customerId for clarity within this method's context
  ): Promise<void> {
    const stripePriceId = stripeSubscription.items?.data?.[0]?.price.id;

    if (!stripePriceId) {
      // Consider more specific error handling or logging
      throw new Error(
        `Price ID not found for Stripe subscription ${stripeSubscription.id}. Assuming single price item.`
      );
    }

    // Retrieve existing subscription from the database using the app's user ID
    const existingSubscription = await this.getSubscription(userIdInApp);

    const subscriptionData = {
      userId: userIdInApp,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer as string, // Stripe ensures this is a string if expanded or just the ID
      stripePriceId,
      stripeCurrentPeriodEnd: new Date(
        stripeSubscription.current_period_end * 1000 // Convert Unix timestamp to JS Date
      ),
    };

    if (existingSubscription) {
      // If subscription exists, update relevant fields (price and period end)
      // Ensure you use the existing subscription's stripeSubscriptionId if it could differ,
      // though typically for an update event, stripeSubscription.id is the one to use.
      await this.updateSubscription({
        stripeSubscriptionId: stripeSubscription.id, // Use the ID from the event
        stripePriceId: subscriptionData.stripePriceId,
        stripeCurrentPeriodEnd: subscriptionData.stripeCurrentPeriodEnd,
      });
    } else {
      // If no existing subscription for this user, create a new one
      await this.createSubscription(subscriptionData);
    }
  }

  /**
   * Updates the user record with their Stripe Customer ID.
   */
  async updateUserWithStripeCustomerId(
    params: CreateStripeCustomerRecordParams
  ): Promise<void> {
    await this.db
      .update(users)
      .set({
        stripeCustomerId: params.stripeCustomerId,
      })
      .where(eq(users.id, params.userId));
  }
}
