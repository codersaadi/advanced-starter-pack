import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { timestamps, timestamptz } from './_helpers';

// Enum Types
export const rolesEnumArray = ['user', 'admin', 'member'] as const;
export const userRole = pgEnum('role', rolesEnumArray);

export const accountStatusArray = [
  'suspended',
  'disabled',
  'active',
  'onboarding',
] as const;
export const accountStatus = pgEnum('accountStatus', accountStatusArray);

const DEFAULT_ACCOUNT_STATUS: (typeof accountStatusArray)[number] =
  'onboarding';

// Users table
export const users = pgTable(
  'user',
  {
    id: text('id').primaryKey().notNull(),

    email: text('email'),

    username: text('username').unique(),
    avatar: text('avatar'),
    phone: text('phone'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    fullName: text('full_name'),
    isOnboarded: boolean('is_onboarded').default(false),

    password: text('password'),
    status: accountStatus('accountStatus').default(DEFAULT_ACCOUNT_STATUS),
    stripeCustomerId: text('stripeCustomerId'),
    // reqired for clerk
    clerkCreatedAt: timestamptz('clerk_created_at'),

    // Required by nextauth, all null allowed
    emailVerifiedAt: timestamptz('email_verified_at'),
    ...timestamps,
  },
  (table) => [uniqueIndex('user_email_idx').on(table.email)]
);

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripeSubscriptionId').notNull(),
  stripeCustomerId: text('stripeCustomerId').notNull(),
  stripePriceId: text('stripePriceId').notNull(),
  stripeCurrentPeriodEnd: timestamp('expires', { mode: 'date' }).notNull(),
});

// Newsletters table
export const newsletters = pgTable('newsletter', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
});

// Type Exports
export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewsLetter = typeof newsletters.$inferSelect;
export type NewUser = typeof users.$inferInsert;
