import type { Session } from '@auth/core/types';
import type { User } from '@repo/core/database/schemas';
export type MessageResponse = {
  success: boolean;
  message: string;
};

export type WithSession = {
  session: Session;
};

export type SessionUser = Pick<
  User,
  | 'id'
  | 'fullName'
  | 'email'
  | 'emailVerifiedAt'
  | 'stripeCustomerId'
  | 'avatar'
>;
